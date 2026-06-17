using BaseCore.Entities.Audit;

namespace BaseCore.Entities
{
    /// <summary>
    /// Lịch sử thay đổi tồn kho — mỗi lần nhập/xuất/điều chỉnh tạo 1 dòng
    /// </summary>
    public class InventoryLog : BaseAuditableEntity
    {
        public Guid Id { get; set; } = Guid.NewGuid();
 
        public Guid ProductId { get; set; }
        public Product Product { get; set; } = null!;
 
        // "import" = nhập kho, "export" = xuất kho, "adjust" = điều chỉnh thủ công
        public string Type { get; set; } = null!;
 
        // Số lượng thay đổi (dương = tăng, âm = giảm)
        public int QuantityChanged { get; set; }
 
        // Tồn kho sau khi thay đổi
        public int StockAfter { get; set; }
 
        // Lý do / ghi chú
        public string? Note { get; set; }
 
        // Người thực hiện
        public Guid? CreatedByUserId { get; set; }
        public string? CreatedByName { get; set; }
    }
}