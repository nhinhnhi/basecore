using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public class CouponRepositoryEF : Repository<Coupon>, ICouponRepositoryEF
    {
        private readonly AppDbContext _context;

        public CouponRepositoryEF(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Coupon?> GetByCodeAsync(string code)
        {
            return await _context.Set<Coupon>()
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == code.ToUpper() && !c.IsDeleted);
        }

        public async Task<bool> IsCodeExistsAsync(string code, Guid? excludeId = null)
        {
            var query = _context.Set<Coupon>().Where(c => c.Code.ToUpper() == code.ToUpper() && !c.IsDeleted);
            if (excludeId.HasValue)
                query = query.Where(c => c.Id != excludeId.Value);
            return await query.AnyAsync();
        }

        public async Task<(List<Coupon> Items, int TotalCount)> SearchAsync(string? keyword, string? discountType, bool? isActive, int page, int pageSize)
        {
            var query = _context.Set<Coupon>().Where(c => !c.IsDeleted).AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
            {
                query = query.Where(c => c.Code.Contains(keyword) || c.Name.Contains(keyword));
            }
            if (!string.IsNullOrEmpty(discountType))
            {
                query = query.Where(c => c.DiscountType == discountType.ToLower());
            }

            if (isActive.HasValue)
            {
                query = query.Where(c => c.IsActive == isActive.Value);
            }

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(c => c.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }

        public async Task<List<Coupon>> GetAvailableCouponsAsync()
        {
            var now = DateTime.UtcNow;
            return await _context.Set<Coupon>()
                .Where(c => !c.IsDeleted && c.IsActive && c.ValidFrom <= now && c.ValidUntil >= now)
                .OrderByDescending(c => c.Created)
                .ToListAsync();
        }

        public async Task<bool> ValidateCouponAsync(string code, decimal orderAmount, Guid? userId = null)
        {
            var coupon = await GetByCodeAsync(code);
            if (coupon == null) return false;

            var now = DateTime.UtcNow;

            if (!coupon.IsActive) return false;
            if (now < coupon.ValidFrom || now > coupon.ValidUntil) return false;
            if (coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit) return false;
            if (orderAmount < coupon.MinOrderValue) return false;

            if (userId.HasValue)
            {
                var userCoupon = await GetUserCouponAsync(userId.Value, coupon.Id);
                if (userCoupon != null && userCoupon.IsUsed) return false;
            }

            return true;
        }

        public async Task<bool> ApplyCouponAsync(Guid userId, Guid couponId, string orderId)
        {
            var userCoupon = await GetUserCouponAsync(userId, couponId);
            var now = DateTime.UtcNow;
            
            if (userCoupon == null)
            {
                userCoupon = new UserCoupon
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CouponId = couponId,
                    IsUsed = true,
                    UsedAt = now,
                    // ✅ THÊM audit fields
                    Created = now,
                    CreatedBy = userId.ToString(),
                    Modified = now,
                    ModifiedBy = userId.ToString(),
                    IsDeleted = false
                };
                await _context.Set<UserCoupon>().AddAsync(userCoupon);
            }
            else
            {
                userCoupon.IsUsed = true;
                userCoupon.UsedAt = now;
                userCoupon.Modified = now;
                userCoupon.ModifiedBy = userId.ToString();
                _context.Set<UserCoupon>().Update(userCoupon);
            }

            var coupon = await GetByIdAsync(couponId);
            if (coupon != null)
            {
                coupon.UsedCount++;
                coupon.Modified = now;
                coupon.ModifiedBy = userId.ToString();
                _context.Set<Coupon>().Update(coupon);
            }

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<UserCoupon?> GetUserCouponAsync(Guid userId, Guid couponId)
        {
            return await _context.Set<UserCoupon>()
                .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CouponId == couponId && !uc.IsDeleted);
        }

        public async Task<List<UserCoupon>> GetUserCouponsAsync(Guid userId)
        {
            return await _context.Set<UserCoupon>()
                .Include(uc => uc.Coupon)
                .Where(uc => uc.UserId == userId && !uc.IsUsed && !uc.IsDeleted)
                .OrderByDescending(uc => uc.Created)
                .ToListAsync();
        }

        public async Task<bool> SaveUserCouponAsync(Guid userId, Guid couponId)
        {
            var existing = await GetUserCouponAsync(userId, couponId);
            if (existing != null) return false;

            var now = DateTime.UtcNow;
            var userCoupon = new UserCoupon
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                CouponId = couponId,
                IsUsed = false,
                UsedAt = null,
                // ✅ THÊM audit fields - ĐÂY LÀ PHẦN QUAN TRỌNG NHẤT
                Created = now,
                CreatedBy = userId.ToString(),
                Modified = now,
                ModifiedBy = userId.ToString(),
                IsDeleted = false
            };

            await _context.Set<UserCoupon>().AddAsync(userCoupon);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}