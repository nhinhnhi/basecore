using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCore.Entities.Audit;

namespace BaseCore.Entities
{
    [Table("Orders")]
    public class Order : BaseAuditableEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();  // ← SỬA: int thành Guid
    
        public Guid UserId { get; set; }  // Đổi từ Guid sang string

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }  // Tổng tiền hàng

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFee { get; set; } = 30000;  // Phí vận chuyển

        [Column(TypeName = "decimal(18,2)")]
        public decimal Total { get; set; }  // Tổng = Subtotal + ShippingFee

        [MaxLength(50)]
        public string Status { get; set; } = "pending";

        [MaxLength(500)]
        public string ShippingAddress { get; set; } = string.Empty;

        public Guid? CouponId { get; set; }

        [MaxLength(500)]
        public string CustomerNote { get; set; } = string.Empty;  // Ghi chú khách hàng

        [MaxLength(500)]
        public string AdminNote { get; set; } = string.Empty;  // Ghi chú admin

        [MaxLength(50)]
        public string PaymentMethod { get; set; } = "cod";

        [MaxLength(30)]
        public string PaymentStatus { get; set; } = "unpaid";

        public string? RecipientName { get; set; }
        public string? RecipientPhone { get; set; }

        public decimal DiscountAmount { get; set; } = 0;

        public DateTime? EstimatedDelivery { get; set; }

        public DateTime? ConfirmedAt { get; set; }
        public DateTime? ShippedAt { get; set; }
        public DateTime? DeliveredAt { get; set; }
        public DateTime? CancelledAt { get; set; }

        // Navigation properties
        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public virtual Coupon Coupon { get; set; }
        public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
        public virtual ICollection<Refund> Refunds { get; set; } = new List<Refund>();
        public virtual ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
        public virtual ICollection<OrderStatusLog> StatusLogs { get; set; } = new List<OrderStatusLog>();
    }
    [Table("OrderItems")]
    public class OrderItem : BaseAuditableEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required]
        public Guid OrderId { get; set; }

        public Guid? ProductId { get; set; }

        public Guid? VariantId { get; set; }

        [Required]
        [MaxLength(200)]
        public string ProductNameSnapshot { get; set; }  // tên sản phẩm tại thời điểm đặt

        [MaxLength(100)]
        public string VariantInfoSnapshot { get; set; }  // thông tin biến thể (Size, Color...)

        [MaxLength(500)]
        public string ImageUrlSnapshot { get; set; }  // ảnh sản phẩm tại thời điểm đặt

        [Required]
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Subtotal { get; set; }

        public bool IsReviewed { get; set; } = false;

        // Navigation properties
        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; }

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; }

        [ForeignKey(nameof(VariantId))]
        public virtual ProductVariant Variant { get; set; }

        // Collection of images for this order item
        public virtual ICollection<OrderImage> Images { get; set; } = new List<OrderImage>();
    }
}