using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCore.Entities.Audit;

namespace BaseCore.Entities
{
    [Table("Categories")]
    public class Category : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid? ParentId { get; set; }

        public Guid? BrandId { get; set; }
        public Brand? Brand { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [MaxLength(120)]
        public string Slug { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [MaxLength(255)]
        public string ImageUrl { get; set; }

        [MaxLength(100)]
        public string IconClass { get; set; }  // icon font-awesome, material, etc.

        public bool IsActive { get; set; } = true;

        public bool ShowInMenu { get; set; } = true;  // hiển thị trên menu navbar

        public int SortOrder { get; set; } = 0;

        [MaxLength(160)]
        public string MetaTitle { get; set; }  // SEO

        [MaxLength(300)]
        public string MetaDescription { get; set; }  // SEO

        // Navigation properties
        [ForeignKey(nameof(ParentId))]
        public virtual Category Parent { get; set; }

        public virtual ICollection<Category> Children { get; set; } = new List<Category>();

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}