using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCore.Entities.Audit;

namespace BaseCore.Entities
{
    [Table("Users")]
    public class User : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        [MaxLength(100)]
        public string FullName { get; set; }

        public Guid? BrandId { get; set; }
        [ForeignKey(nameof(BrandId))]
        public virtual Brand Brand { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; }

        [Required]
        [MaxLength(150)]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public byte[] Salt { get; set; }

        [MaxLength(20)]
        public string Role { get; set; } = "customer";  // customer, staff, admin

        [MaxLength(500)]
        public string AvatarUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public bool IsEmailVerified { get; set; } = false;

        public DateTime? EmailVerifiedAt { get; set; }

        public DateTime? LastLoginAt { get; set; }

        [MaxLength(200)]
        public string Contact { get; set; } = "";

        [MaxLength(100)]
        public string Position { get; set; } = "";

        // Navigation properties
        public virtual ICollection<UserAddress> Addresses { get; set; } = new List<UserAddress>();
        public virtual ICollection<SocialLogin> SocialLogins { get; set; } = new List<SocialLogin>();
        public virtual ICollection<PasswordReset> PasswordResets { get; set; } = new List<PasswordReset>();
        public virtual ICollection<OtpVerification> OtpVerifications { get; set; } = new List<OtpVerification>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
        //public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
    }

    [Table("UserAddresses")]
    public class UserAddress : BaseAuditableEntity
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(100)]
        public string RecipientName { get; set; }

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; }

        [Required]
        [MaxLength(100)]
        public string Province { get; set; }

        [Required]
        [MaxLength(100)]
        public string District { get; set; }

        [Required]
        [MaxLength(100)]
        public string Ward { get; set; }

        [Required]
        public string StreetAddress { get; set; }

        public decimal? Lat { get; set; }  // tọa độ (optional)

        public decimal? Lng { get; set; }

        public bool IsDefault { get; set; } = false;

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }

    [Table("SocialLogins")]
    public class SocialLogin : BaseAuditableEntity
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Provider { get; set; }  // google, facebook, apple

        [Required]
        [MaxLength(255)]
        public string ProviderUserId { get; set; }

        [MaxLength(500)]
        public string AccessToken { get; set; }

        public DateTime? TokenExpiresAt { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }

    [Table("PasswordResets")]
    public class PasswordReset : BaseAuditableEntity
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(64)]
        public string Token { get; set; }

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;


        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }

    [Table("OtpVerifications")]
    public class OtpVerification : BaseAuditableEntity
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        [MaxLength(200)]
        public string PhoneOrEmail { get; set; }

        [Required]
        [MaxLength(6)]
        public string OtpCode { get; set; }

        [Required]
        [MaxLength(20)]
        public string Purpose { get; set; }  // register, login, reset_password

        public int AttemptCount { get; set; } = 0;

        public DateTime ExpiresAt { get; set; }

        public bool IsUsed { get; set; } = false;

    }

    [Table("RefreshTokens")]
    public class RefreshToken : BaseAuditableEntity
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Token { get; set; }

        public DateTime ExpiresAt { get; set; }

        public bool IsRevoked { get; set; } = false;

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }
}