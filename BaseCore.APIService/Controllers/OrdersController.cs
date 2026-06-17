using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Services;
using BaseCore.DTO.OrderPlatform;
using System.Security.Claims;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly IOrderService _orderService;

        public OrdersController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyOrders(
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            var (items, totalCount) = await _orderService.GetMyOrdersAsync(userId, status, page, pageSize);
            return Ok(new { items, totalCount, page, pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize) });
        }

        [HttpGet("all")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllOrders(
            [FromQuery] int page = 1, [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null, [FromQuery] string? keyword = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
        {
            var (items, totalCount) = await _orderService
                .GetAllOrdersAsync(page, pageSize, status, keyword, paymentMethod, fromDate, toDate);
            return Ok(new { items, totalCount, page, pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize) });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _orderService.GetOrderDetailAsync(id);
            return result == null ? NotFound(new { message = "Order not found" }) : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateOrderDto dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            // Validate cơ bản (model state / guard clauses)
            if (dto.Items == null || !dto.Items.Any())
                return BadRequest(new { message = "Đơn hàng phải có ít nhất 1 sản phẩm" });
            if (string.IsNullOrEmpty(dto.RecipientName))
                return BadRequest(new { message = "Vui lòng nhập tên người nhận" });
            if (string.IsNullOrEmpty(dto.RecipientPhone))
                return BadRequest(new { message = "Vui lòng nhập số điện thoại người nhận" });

            try
            {
                var (order, items, discountAmount, couponCode) =
                    await _orderService.CreateOrderAsync(userId, dto);

                var resultItems = items.Select(i => new {
                    i.Id, i.OrderId, i.ProductId,
                    i.ProductNameSnapshot, i.ImageUrlSnapshot,
                    i.Quantity, i.UnitPrice, i.Subtotal
                });

                return CreatedAtAction(nameof(GetById), new { id = order.Id },
                    new { order, items = resultItems, discountAmount, couponCode });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Tạo đơn hàng thất bại",
                    error = ex.Message, inner = ex.InnerException?.Message });
            }
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusDto dto)
        {
            try
            {
                var order = await _orderService.UpdateStatusAsync(id, dto.Status, dto.AdminNote);
                return Ok(new { message = "Cập nhật thành công", order });
            }
            catch (KeyNotFoundException) { return NotFound(new { message = "Order not found" }); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelOrder(Guid id, [FromBody] CancelOrderDto? dto)
        {
            if (!TryGetUserId(out var userId)) return Unauthorized();

            try
            {
                var order = await _orderService.CancelOrderAsync(id, userId, dto?.Reason);
                return Ok(new { message = "Đã hủy đơn hàng thành công", order });
            }
            catch (KeyNotFoundException)          { return NotFound(new { message = "Order not found" }); }
            catch (UnauthorizedAccessException)   { return Forbid(); }
            catch (InvalidOperationException ex)  { return BadRequest(new { message = ex.Message }); }
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteOrder(Guid id)
        {
            try
            {
                await _orderService.DeleteOrderAsync(id);
                return Ok(new { message = "Đã xóa đơn hàng" });
            }
            catch (KeyNotFoundException) { return NotFound(new { message = "Order not found" }); }
        }

        // ─── Helper ───────────────────────────────────────────────────────────
        private bool TryGetUserId(out Guid userId)
            {
                var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value
                        ?? User.FindFirst("nameid")?.Value;

                return Guid.TryParse(claim, out userId);
            }
    }
}