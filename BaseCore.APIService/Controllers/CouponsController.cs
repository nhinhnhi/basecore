using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Services;
using BaseCore.DTO.CouponPlatform;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CouponsController : ControllerBase
    {
        private readonly ICouponService _couponService;

        public CouponsController(ICouponService couponService)
        {
            _couponService = couponService;
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] string? discountType,
            [FromQuery] bool? isActive,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _couponService.GetAllAsync(keyword, discountType, isActive, page, pageSize);
            return Ok(new {
                items = result.Items, totalCount = result.TotalCount,
                page, pageSize,
                totalPages = (int)Math.Ceiling((double)result.TotalCount / pageSize)
            });
        }

        [HttpGet("available")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableCoupons()
            => Ok(await _couponService.GetAvailableCouponsAsync());

        [HttpGet("available-with-status")]
        [Authorize]
        public async Task<IActionResult> GetAvailableWithStatus()
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            var result = await _couponService.GetAvailableWithStatusAsync(userId);
            return Ok(result);
        }
 

        [HttpGet("my-coupons")]
        [Authorize]
        public async Task<IActionResult> GetMyCoupons()
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            return Ok(await _couponService.GetMyCouponsAsync(userId));
        }

        [HttpPost("save")]
        [Authorize]
        public async Task<IActionResult> SaveCoupon([FromBody] SaveCouponDto dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            try
            {
                await _couponService.SaveCouponAsync(userId, dto.CouponId);
                return Ok(new { message = "Coupon saved successfully" });
            }
            catch (KeyNotFoundException ex)       { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex)  { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("validate")]
        [Authorize]
        public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponDto dto)
        {
            TryGetUserId(out var userId); // nullable ok
            try
            {
                var result = await _couponService.ValidateCouponAsync(
                    dto.Code, dto.OrderAmount, userId == Guid.Empty ? null : userId);

                return Ok(new {
                    isValid = true,
                    coupon = new {
                        result.Coupon!.Id, result.Coupon.Code, result.Coupon.Name,
                        result.Coupon.DiscountType, result.Coupon.DiscountValue,
                        result.Coupon.MinOrderValue, result.Coupon.MaxDiscountAmount
                    },
                    discountAmount = result.DiscountAmount,
                    newTotal = result.NewTotal
                });
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CreateCouponDto dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            try
            {
                var coupon = await _couponService.CreateAsync(userId, userId.ToString(), dto);
                return Ok(coupon);
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPost("welcome-coupon")]
        [Authorize]
        public async Task<IActionResult> GiveWelcomeCoupon()
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            try
            {
                await _couponService.GiveWelcomeCouponAsync(userId, userId.ToString());
                return Ok(new { success = true,
                    message = "Chúc mừng bạn nhận được voucher 50.000đ cho đơn hàng đầu tiên!" });
            }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCouponDto dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            try
            {
                var coupon = await _couponService.UpdateAsync(id, userId.ToString(), dto);
                return Ok(coupon);
            }
            catch (KeyNotFoundException ex)      { return NotFound(new { message = ex.Message }); }
            catch (InvalidOperationException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();
            try
            {
                await _couponService.DeleteAsync(id, userId.ToString());
                return Ok(new { message = "Coupon deleted successfully" });
            }
            catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        }

        // ─── Helper ───────────────────────────────────────────────────────────
        private bool TryGetUserId(out Guid userId)
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(claim, out userId);
        }
    }
}