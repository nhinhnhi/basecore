using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCore.Entities.Audit;

namespace BaseCore.Entities
{
    [Table("OrderImages")]
    public class OrderImage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid OrderItemId { get; set; }  // liên kết đến chi tiết đơn hàng

        [MaxLength(500)]
        public string ImageUrl { get; set; }  // ảnh sản phẩm tại thời điểm đặt hàng (snapshot)

        [MaxLength(255)]
        public string ImagePublicId { get; set; }  // nếu dùng cloud storage (Cloudinary, etc.)

        [MaxLength(50)]
        public string ImageType { get; set; }  // 'product_snapshot', 'user_upload', 'proof'

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        [ForeignKey(nameof(OrderItemId))]
        public virtual OrderItem OrderItem { get; set; }
    }
    
    [Table("ORDER_STATUS_LOGS")]
    public class OrderStatusLog : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid OrderId { get; set; }
        public Guid ChangedBy { get; set; }

        [MaxLength(30)]
        public string FromStatus { get; set; }

        [MaxLength(30)]
        public string ToStatus { get; set; }

        public string Note { get; set; }

        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; }

        [ForeignKey(nameof(ChangedBy))]
        public virtual User ChangedByUser { get; set; }
    }

    [Table("PAYMENTS")]
    public class Payment : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid OrderId { get; set; }

        [MaxLength(20)]
        public string PaymentMethod { get; set; } // cod|bank_transfer|vnpay|momo|zalopay

        [MaxLength(100)]
        public string TransactionId { get; set; }

        [MaxLength(50)]
        public string PaymentGateway { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending|success|failed|refunded

        public string RawResponse { get; set; } // JSON response từ gateway

        [MaxLength(255)]
        public string QrCodeUrl { get; set; }

        public DateTime? PaidAt { get; set; }


        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; }

        public virtual ICollection<Refund> Refunds { get; set; } = new List<Refund>();
    }

    [Table("REFUNDS")]
    public class Refund : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid OrderId { get; set; }
        public Guid PaymentId { get; set; }
        public Guid ProcessedBy { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MaxLength(30)]
        public string Reason { get; set; } // damaged|wrong_item|cancelled|other

        public string Note { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "pending"; // pending|approved|rejected|completed

        [MaxLength(100)]
        public string BankAccountName { get; set; }

        [MaxLength(30)]
        public string BankAccountNo { get; set; }

        [MaxLength(100)]
        public string BankName { get; set; }

        public DateTime? ProcessedAt { get; set; }

        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; }

        [ForeignKey(nameof(PaymentId))]
        public virtual Payment Payment { get; set; }

        [ForeignKey(nameof(ProcessedBy))]
        public virtual User ProcessedByUser { get; set; }
    }

    [Table("SHIPPING_PROVIDERS")]
    public class ShippingProvider
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(80)]
        public string Name { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } // ghn|ghtk|viettelpost

        [MaxLength(255)]
        public string ApiEndpoint { get; set; }

        [MaxLength(255)]
        public string ApiKey { get; set; }

        public bool IsActive { get; set; } = true;

        public virtual ICollection<Shipment> Shipments { get; set; } = new List<Shipment>();
    }

    [Table("SHIPMENTS")]
    public class Shipment : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid OrderId { get; set; }
        public Guid ProviderId { get; set; }

        [MaxLength(50)]
        public string TrackingNumber { get; set; }

        [MaxLength(100)]
        public string CarrierOrderId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingFeeActual { get; set; }

        public DateTime EstimatedDelivery { get; set; }


        [ForeignKey(nameof(OrderId))]
        public virtual Order Order { get; set; }

        [ForeignKey(nameof(ProviderId))]
        public virtual ShippingProvider Provider { get; set; }

        public virtual ICollection<ShipmentEvent> Events { get; set; } = new List<ShipmentEvent>();
    }

    [Table("SHIPMENT_EVENTS")]
    public class ShipmentEvent
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ShipmentId { get; set; }

        [MaxLength(100)]
        public string Location { get; set; }

        public string Description { get; set; }

        [MaxLength(30)]
        public string Status { get; set; } // picked_up|in_transit|out_for_delivery|delivered|failed_attempt|returned

        public DateTime EventAt { get; set; }

        [ForeignKey(nameof(ShipmentId))]
        public virtual Shipment Shipment { get; set; }
    }
}