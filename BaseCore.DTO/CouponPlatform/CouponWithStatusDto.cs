namespace BaseCore.DTO.CouponPlatform
{
    /// <summary>
    /// Coupon kèm trạng thái cá nhân của từng khách:
    /// đã lưu chưa, có đủ điều kiện lưu không, cần mua thêm bao nhiêu.
    /// </summary>
    public class CouponWithStatusDto
    {
        public Guid     Id                { get; set; }
        public string   Code              { get; set; } = "";
        public string   Name              { get; set; } = "";
        public string   Description       { get; set; } = "";
        public string   DiscountType      { get; set; } = "";   // "percentage" | "fixed"
        public decimal  DiscountValue     { get; set; }
        public decimal  MinOrderValue     { get; set; }
        public decimal  MaxDiscountAmount { get; set; }
        public int      UsageLimit        { get; set; }
        public int      UsedCount         { get; set; }
        public DateTime ValidFrom         { get; set; }
        public DateTime ValidUntil        { get; set; }

        // ─── Trạng thái cá nhân ───
        public bool    IsSaved         { get; set; }  // Đã lưu rồi
        public bool    CanSave         { get; set; }  // Đủ điều kiện để lưu
        public string  ConditionNote   { get; set; } = ""; // "Đã lưu" | "Đủ điều kiện" | "Cần mua thêm Xđ"
        public decimal UserTotalSpent  { get; set; }  // Tổng tiền khách đã mua (để hiển thị progress)
    }
}