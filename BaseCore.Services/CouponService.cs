using BaseCore.DTO.CouponPlatform;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Services
{
    public class CouponService : ICouponService
    {
        private readonly ICouponRepositoryEF _couponRepository;
        private readonly AppDbContext _context;

        public CouponService(ICouponRepositoryEF couponRepository, AppDbContext context)
        {
            _couponRepository = couponRepository;
            _context = context;
        }

        // ─── GET ALL (admin) ──────────────────────────────────────────────────
        public async Task<CouponListResult> GetAllAsync(
            string? keyword, string? discountType, bool? isActive, int page, int pageSize)
        {
            var (items, totalCount) = await _couponRepository
                .SearchAsync(keyword, discountType, isActive, page, pageSize);
            return new CouponListResult(items, totalCount);
        }

        // ─── GET AVAILABLE (công khai, kèm trạng thái đã lưu chưa) ───────────
        public async Task<List<Coupon>> GetAvailableCouponsAsync()
            => await _couponRepository.GetAvailableCouponsAsync();

        // ─── GET AVAILABLE WITH STATUS (dành cho trang khách) ─────────────────
        /// <summary>
        /// Trả về danh sách coupon công khai kèm thông tin:
        /// - Khách đã lưu chưa
        /// - Có đủ điều kiện lưu không (tổng tiền đã mua >= MinOrderValue của coupon)
        /// </summary>
        public async Task<List<CouponWithStatusDto>> GetAvailableWithStatusAsync(Guid userId)
        {
            var now = DateTime.UtcNow;

            // Tổng tiền đã mua thành công của khách
            var totalSpent = await _context.Orders
                .Where(o => o.UserId == userId
                    && (o.Status == "delivered" || o.Status == "completed"))
                .SumAsync(o => (decimal?)o.Total) ?? 0;

            // Danh sách coupon công khai còn hiệu lực
            var coupons = await _context.Coupons
                .AsNoTracking()
                .Where(c => c.IsActive && !c.IsDeleted
                    && c.ValidFrom <= now && c.ValidUntil >= now
                    && (c.UsageLimit == 0 || c.UsedCount < c.UsageLimit))
                .OrderByDescending(c => c.Created)
                .ToListAsync();

            // Coupon khách đã lưu
            var savedCouponIds = await _context.UserCoupons
                .AsNoTracking()
                .Where(uc => uc.UserId == userId)
                .Select(uc => uc.CouponId)
                .ToListAsync();

            return coupons.Select(c => new CouponWithStatusDto
            {
                Id                = c.Id,
                Code              = c.Code,
                Name              = c.Name,
                Description       = c.Description,
                DiscountType      = c.DiscountType,
                DiscountValue     = c.DiscountValue,
                MinOrderValue     = c.MinOrderValue,
                MaxDiscountAmount = c.MaxDiscountAmount,
                UsageLimit        = c.UsageLimit,
                UsedCount         = c.UsedCount,
                ValidFrom         = c.ValidFrom,
                ValidUntil        = c.ValidUntil,
                IsSaved           = savedCouponIds.Contains(c.Id),
                // Đủ điều kiện lưu: tổng chi tiêu >= MinOrderValue của coupon
                CanSave           = !savedCouponIds.Contains(c.Id)
                                    && totalSpent >= c.MinOrderValue,
                // Thông báo rõ ràng nếu chưa đủ điều kiện
                ConditionNote     = savedCouponIds.Contains(c.Id)
                    ? "Đã lưu"
                    : totalSpent >= c.MinOrderValue
                        ? "Đủ điều kiện"
                        : $"Cần mua thêm {(c.MinOrderValue - totalSpent):N0}đ nữa",
                UserTotalSpent    = totalSpent
            }).ToList();
        }

        // ─── GET MY COUPONS ───────────────────────────────────────────────────
        public async Task<List<UserCoupon>> GetMyCouponsAsync(Guid userId)
            => await _couponRepository.GetUserCouponsAsync(userId);

        // ─── SAVE COUPON (có kiểm tra điều kiện) ─────────────────────────────
        public async Task<bool> SaveCouponAsync(Guid userId, Guid couponId)
        {
            var coupon = await _couponRepository.GetByIdAsync(couponId)
                ?? throw new KeyNotFoundException("Mã giảm giá không tồn tại");

            var now = DateTime.UtcNow;

            // 1. Kiểm tra coupon còn hoạt động không
            if (!coupon.IsActive)
                throw new InvalidOperationException("Mã giảm giá đã bị vô hiệu hóa");

            // 2. Kiểm tra thời gian hiệu lực
            if (now < coupon.ValidFrom || now > coupon.ValidUntil)
                throw new InvalidOperationException("Mã giảm giá đã hết hạn");

            // 3. Kiểm tra còn lượt không
            if (coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit)
                throw new InvalidOperationException("Mã giảm giá đã hết lượt sử dụng");

            // 4. Kiểm tra đã lưu chưa
            var alreadySaved = await _context.UserCoupons
                .AnyAsync(uc => uc.UserId == userId && uc.CouponId == couponId);
            if (alreadySaved)
                throw new InvalidOperationException("Bạn đã lưu mã giảm giá này rồi");

            // 5. Kiểm tra tổng tiền đã mua (nghiệp vụ chính)
            var totalSpent = await _context.Orders
                .Where(o => o.UserId == userId
                    && (o.Status == "delivered" || o.Status == "completed"))
                .SumAsync(o => (decimal?)o.Total) ?? 0;

            if (totalSpent < coupon.MinOrderValue)
                throw new InvalidOperationException(
                    $"Bạn cần mua đủ {coupon.MinOrderValue:N0}đ để lưu voucher này. " +
                    $"Bạn đã mua {totalSpent:N0}đ, cần thêm {(coupon.MinOrderValue - totalSpent):N0}đ nữa.");

            // 6. Lưu voucher
            var success = await _couponRepository.SaveUserCouponAsync(userId, couponId);
            if (!success)
                throw new InvalidOperationException("Không thể lưu voucher, vui lòng thử lại");

            return true;
        }

        // ─── VALIDATE COUPON (dùng khi checkout) ─────────────────────────────
        public async Task<ValidateCouponResult> ValidateCouponAsync(
            string code, decimal orderAmount, Guid? userId)
        {
            var coupon = await _couponRepository.GetByCodeAsync(code)
                ?? throw new InvalidOperationException("Mã giảm giá không tồn tại");

            var now = DateTime.UtcNow;

            // Bước 1-3: tồn tại, hoạt động, hiệu lực
            if (!coupon.IsActive)
                throw new InvalidOperationException("Mã giảm giá đã bị vô hiệu hóa");
            if (now < coupon.ValidFrom || now > coupon.ValidUntil)
                throw new InvalidOperationException("Mã giảm giá đã hết hạn");

            // Bước 4: còn lượt
            if (coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit)
                throw new InvalidOperationException("Mã giảm giá đã hết lượt sử dụng");

            // Bước 5: đủ đơn tối thiểu
            if (orderAmount < coupon.MinOrderValue)
                throw new InvalidOperationException(
                    $"Đơn hàng chưa đạt giá trị tối thiểu {coupon.MinOrderValue:N0}đ");

            // Bước 6: user đã dùng chưa (nếu có userId)
            if (userId.HasValue && userId.Value != Guid.Empty)
            {
                var usedCount = await _context.Orders
                    .CountAsync(o => o.UserId == userId.Value && o.CouponId == coupon.Id);
                if (usedCount > 0)
                    throw new InvalidOperationException("Bạn đã sử dụng mã giảm giá này rồi");
            }

            // Tính tiền giảm
            decimal discountAmount = coupon.DiscountType == "percentage"
                ? Math.Min(
                    orderAmount * coupon.DiscountValue / 100,
                    coupon.MaxDiscountAmount > 0 ? coupon.MaxDiscountAmount : decimal.MaxValue)
                : Math.Min(coupon.DiscountValue, orderAmount);

            return new ValidateCouponResult(true, coupon, discountAmount, orderAmount - discountAmount);
        }

        // ─── CREATE ───────────────────────────────────────────────────────────
        public async Task<Coupon> CreateAsync(
            Guid createdByUserId, string createdByStr, CreateCouponDto dto)
        {
            if (await _couponRepository.IsCodeExistsAsync(dto.Code))
                throw new InvalidOperationException("Mã giảm giá đã tồn tại");

            var now = DateTime.UtcNow;
            var coupon = new Coupon
            {
                Id                = Guid.NewGuid(),
                Code              = dto.Code.ToUpper(),
                Name              = dto.Name,
                Description       = dto.Description ?? "",
                DiscountType      = dto.DiscountType,
                DiscountValue     = dto.DiscountValue,
                MinOrderValue     = dto.MinOrderValue,
                MaxDiscountAmount = dto.DiscountType == "percentage" ? dto.MaxDiscountAmount : 0,
                UsageLimit        = dto.UsageLimit,
                UsedCount         = 0,
                IsActive          = dto.IsActive,
                ValidFrom         = dto.ValidFrom.ToUniversalTime(),
                ValidUntil        = dto.ValidUntil.ToUniversalTime(),
                Created           = now, CreatedBy  = createdByStr,
                Modified          = now, ModifiedBy = createdByStr,
                IsDeleted         = false
            };

            await _couponRepository.AddAsync(coupon);
            return coupon;
        }

        // ─── WELCOME COUPON ───────────────────────────────────────────────────
        public async Task<Coupon> GiveWelcomeCouponAsync(Guid userId, string userIdStr)
        {
            var welcomeCoupon = await _couponRepository.GetByCodeAsync("NEWUSER50");
            if (welcomeCoupon == null)
            {
                var now = DateTime.UtcNow;
                welcomeCoupon = new Coupon
                {
                    Id = Guid.NewGuid(), Code = "NEWUSER50",
                    Name = "Chào mừng thành viên mới",
                    Description = "Voucher 50.000đ cho đơn hàng đầu tiên",
                    DiscountType = "fixed", DiscountValue = 50000,
                    MinOrderValue = 200000, MaxDiscountAmount = 0,
                    UsageLimit = 1, UsedCount = 0, IsActive = true,
                    ValidFrom = now, ValidUntil = now.AddDays(30),
                    Created = now, CreatedBy = userIdStr,
                    Modified = now, ModifiedBy = userIdStr, IsDeleted = false
                };
                await _couponRepository.AddAsync(welcomeCoupon);
            }

            var success = await _couponRepository.SaveUserCouponAsync(userId, welcomeCoupon.Id);
            if (!success)
                throw new InvalidOperationException("Bạn đã nhận voucher này rồi!");

            return welcomeCoupon;
        }

        // ─── UPDATE ───────────────────────────────────────────────────────────
        public async Task<Coupon> UpdateAsync(Guid id, string modifiedByStr, UpdateCouponDto dto)
        {
            var coupon = await _couponRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Coupon not found");

            if (!string.IsNullOrEmpty(dto.Code) && dto.Code != coupon.Code)
            {
                if (await _couponRepository.IsCodeExistsAsync(dto.Code, id))
                    throw new InvalidOperationException("Mã giảm giá đã tồn tại");
                coupon.Code = dto.Code.ToUpper();
            }

            if (!string.IsNullOrEmpty(dto.Name))        coupon.Name              = dto.Name;
            if (dto.Description      != null)            coupon.Description       = dto.Description;
            if (!string.IsNullOrEmpty(dto.DiscountType)) coupon.DiscountType      = dto.DiscountType;
            if (dto.DiscountValue    .HasValue)          coupon.DiscountValue     = dto.DiscountValue.Value;
            if (dto.MinOrderValue    .HasValue)          coupon.MinOrderValue     = dto.MinOrderValue.Value;
            if (dto.MaxDiscountAmount.HasValue)          coupon.MaxDiscountAmount = dto.MaxDiscountAmount.Value;
            if (dto.UsageLimit       .HasValue)          coupon.UsageLimit        = dto.UsageLimit.Value;
            if (dto.IsActive         .HasValue)          coupon.IsActive          = dto.IsActive.Value;
            if (dto.ValidFrom        .HasValue)          coupon.ValidFrom         = dto.ValidFrom.Value.ToUniversalTime();
            if (dto.ValidUntil       .HasValue)          coupon.ValidUntil        = dto.ValidUntil.Value.ToUniversalTime();

            coupon.Modified   = DateTime.UtcNow;
            coupon.ModifiedBy = modifiedByStr;

            await _couponRepository.UpdateAsync(coupon);
            return coupon;
        }

        // ─── DELETE (soft) ────────────────────────────────────────────────────
        public async Task DeleteAsync(Guid id, string deletedByStr)
        {
            var coupon = await _couponRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Coupon not found");

            coupon.IsDeleted  = true;
            coupon.Modified   = DateTime.UtcNow;
            coupon.ModifiedBy = deletedByStr;

            await _couponRepository.UpdateAsync(coupon);
        }
    }
}