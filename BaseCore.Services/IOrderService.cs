// IOrderService.cs
using BaseCore.DTO.OrderPlatform;
using BaseCore.Entities;

namespace BaseCore.Services
{
    public interface IOrderService
    {
        Task<(List<object> items, int totalCount)> GetMyOrdersAsync(
            Guid userId, string? status, int page, int pageSize);

        Task<(List<object> items, int totalCount)> GetAllOrdersAsync(
            int page, int pageSize, string? status, string? keyword,
            string? paymentMethod, DateTime? fromDate, DateTime? toDate);

        Task<object?> GetOrderDetailAsync(Guid orderId);

        Task<(Order order, List<OrderItem> items, decimal discountAmount, string? couponCode)>
            CreateOrderAsync(Guid userId, CreateOrderDto dto);

        Task<Order> UpdateStatusAsync(Guid orderId, string newStatus, string? adminNote);

        Task<Order> CancelOrderAsync(Guid orderId, Guid userId, string? reason);

        Task DeleteOrderAsync(Guid orderId);
    }
}