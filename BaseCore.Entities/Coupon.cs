
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCore.Entities.Audit;

namespace BaseCore.Entities
{
    [Table("Coupons")]
    public class Coupon : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string DiscountType { get; set; } = "percentage"; // percentage, fixed

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MinOrderValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal MaxDiscountAmount { get; set; } // Chỉ áp dụng cho percentage

        public int UsageLimit { get; set; } // Tổng số lượt sử dụng
        public int UsedCount { get; set; } // Số lượt đã sử dụng

        public bool IsActive { get; set; } = true;

        public DateTime ValidFrom { get; set; }
        public DateTime ValidUntil { get; set; }

        // Navigation properties
        public virtual ICollection<UserCoupon> UserCoupons { get; set; } = new List<UserCoupon>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    [Table("UserCoupons")]
    public class UserCoupon : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        public Guid CouponId { get; set; }

        public bool IsUsed { get; set; } = false;
        public DateTime? UsedAt { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }

        [ForeignKey(nameof(CouponId))]
        public virtual Coupon Coupon { get; set; }
    }
}