
namespace BaseCore.DTO.OrderPlatform
{
    public class CreateOrderDto
    {
        public List<OrderItemDto> Items { get; set; } = new();
        public string RecipientName { get; set; } = "";
        public string RecipientPhone { get; set; } = "";
        public string? ShippingAddress { get; set; }
        public string? CustomerNote { get; set; }
        public decimal ShippingFee { get; set; } = 30000;
        public string? PaymentMethod { get; set; }
        public string? CouponCode { get; set; }
    }
}