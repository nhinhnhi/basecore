namespace BaseCore.DTO.OrderPlatform
{
    
    public class OrderItemDto
    {
        public Guid ProductId { get; set; }
        public Guid? VariantId { get; set; }
        public string? VariantInfo { get; set; }
        public int Quantity { get; set; }
    }
}