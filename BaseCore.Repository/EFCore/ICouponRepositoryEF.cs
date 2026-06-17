using BaseCore.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Repository.EFCore
{
    public interface ICouponRepositoryEF : IRepository<Coupon>
    {
        Task<Coupon?> GetByCodeAsync(string code);
        Task<bool> IsCodeExistsAsync(string code, Guid? excludeId = null);
        Task<(List<Coupon> Items, int TotalCount)> SearchAsync(string? keyword, string? discountType, bool? isActive, int page, int pageSize);
        Task<List<Coupon>> GetAvailableCouponsAsync();
        Task<bool> ValidateCouponAsync(string code, decimal orderAmount, Guid? userId = null);
        Task<bool> ApplyCouponAsync(Guid userId, Guid couponId, string orderId);
        Task<UserCoupon?> GetUserCouponAsync(Guid userId, Guid couponId);
        Task<List<UserCoupon>> GetUserCouponsAsync(Guid userId);
        Task<bool> SaveUserCouponAsync(Guid userId, Guid couponId);
    }
}