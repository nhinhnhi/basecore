using BaseCore.DTO.CouponPlatform;
using BaseCore.Entities;

namespace BaseCore.Services
{
    public record CouponListResult(List<Coupon> Items, int TotalCount);
    
    public record ValidateCouponResult(
        bool IsValid,
        Coupon? Coupon,
        decimal DiscountAmount,
        decimal NewTotal);

    public interface ICouponService
    {
        Task<CouponListResult> GetAllAsync(string? keyword, string? discountType, bool? isActive, int page, int pageSize);
        Task<List<Coupon>> GetAvailableCouponsAsync();
        Task<List<UserCoupon>> GetMyCouponsAsync(Guid userId);
        Task<bool> SaveCouponAsync(Guid userId, Guid couponId);
        Task<ValidateCouponResult> ValidateCouponAsync(string code, decimal orderAmount, Guid? userId);
        Task<List<CouponWithStatusDto>> GetAvailableWithStatusAsync(Guid userId);
        Task<Coupon> CreateAsync(Guid createdByUserId, string createdByStr, CreateCouponDto dto);
        Task<Coupon> GiveWelcomeCouponAsync(Guid userId, string userIdStr);
        Task<Coupon> UpdateAsync(Guid id, string modifiedByStr, UpdateCouponDto dto);
        Task DeleteAsync(Guid id, string deletedByStr);
    }
}