namespace BaseCore.DTO.CouponPlatform
{
    public class CreateCouponDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DiscountType { get; set; } = "percentage";
        public decimal DiscountValue { get; set; }
        public decimal MinOrderValue { get; set; }
        public decimal MaxDiscountAmount { get; set; }
        public int UsageLimit { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }
    }
}