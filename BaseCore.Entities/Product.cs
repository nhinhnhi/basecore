using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using BaseCore.Entities.Audit;


namespace BaseCore.Entities
{
    [Table("PRODUCTS")]
    public class Product : BaseAuditableEntity
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid CategoryId { get; set; }
        public Guid? BrandId { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [MaxLength(220)]
        public string Slug { get; set; }

        public string ShortDescription { get; set; }
        public string Description { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BasePrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SalePrice { get; set; }

        [MaxLength(50)]
        public string Sku { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "active"; // draft|active|inactive|archived

        public bool IsFeatured { get; set; }
        public bool IsNewArrival { get; set; }

        public int TotalStock { get; set; }
        public int SoldCount { get; set; }
        public float AvgRating { get; set; }
        public int ReviewCount { get; set; }

        [MaxLength(255)]
        public string MainImageUrl { get; set; }

        [MaxLength(160)]
        public string MetaTitle { get; set; }
        
        [ForeignKey(nameof(BrandId))]
        public virtual Brand Brand { get; set; }

        [MaxLength(300)]
        public string MetaDescription { get; set; }

        public DateTime? PublishedAt { get; set; }

        // Navigation properties
        [ForeignKey(nameof(CategoryId))]
        public virtual Category Category { get; set; }

        public virtual ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
        public virtual ICollection<ProductTag> ProductTags { get; set; } = new List<ProductTag>();
        public virtual ICollection<RelatedProduct> RelatedProducts { get; set; } = new List<RelatedProduct>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    [Table("ProductImages")]
    public class ProductImage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ProductId { get; set; }

        public Guid? VariantId { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; }

        [MaxLength(255)]
        public string AltText { get; set; }

        public int SortOrder { get; set; }

        public bool IsPrimary { get; set; }

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; }

        [ForeignKey(nameof(VariantId))]
        public virtual ProductVariant Variant { get; set; }
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }

    [Table("ProductVariants")]
    public class ProductVariant : BaseAuditableEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid ProductId { get; set; }

        [MaxLength(50)]
        public string SkuVariant { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PriceOverride { get; set; }

        public int StockQty { get; set; }

        public int LowStockThreshold { get; set; }

        public float WeightKg { get; set; }

        [MaxLength(500)]
        public string ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; }

        public virtual ICollection<VariantAttributeValue> VariantAttributeValues { get; set; }
        public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }

    [Table("AttributeGroups")]
    public class AttributeGroup : BaseAuditableEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(80)]
        public string Name { get; set; }  // Màu sắc, Kích thước, Chất liệu...

        [MaxLength(50)]
        public string InputType { get; set; }  // select, color, text

        public int SortOrder { get; set; }

        public virtual ICollection<AttributeValue> AttributeValues { get; set; }
    }

    [Table("AttributeValues")]
    public class AttributeValue : BaseAuditableEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int GroupId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Value { get; set; }  // Đỏ, XL, Gỗ sồi...

        [MaxLength(7)]
        public string ColorHex { get; set; }

        [MaxLength(500)]
        public string ImageUrl { get; set; }

        public int SortOrder { get; set; }

        [ForeignKey(nameof(GroupId))]
        public virtual AttributeGroup Group { get; set; }

        public virtual ICollection<VariantAttributeValue> VariantAttributeValues { get; set; }
    }

    [Table("VariantAttributeValues")]
    public class VariantAttributeValue
    {
        [Key]
        [Column(Order = 0)]
        public Guid? VariantId { get; set; }

        [Key]
        [Column(Order = 1)]
        public int AttributeValueId { get; set; }

        [ForeignKey(nameof(VariantId))]
        public virtual ProductVariant Variant { get; set; }

        [ForeignKey(nameof(AttributeValueId))]
        public virtual AttributeValue AttributeValue { get; set; }
    }

    [Table("Tags")]
    public class Tag
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(80)]
        public string Name { get; set; }

        [MaxLength(90)]
        public string Slug { get; set; }

        [MaxLength(20)]
        public string ColorHex { get; set; }

        public virtual ICollection<ProductTag> ProductTags { get; set; }
    }

    [Table("ProductTags")]
    public class ProductTag
    {
        [Key]
        [Column(Order = 0)]
        public Guid ProductId { get; set; }

        [Key]
        [Column(Order = 1)]
        public int TagId { get; set; }

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; }

        [ForeignKey(nameof(TagId))]
        public virtual Tag Tag { get; set; }
    }

    [Table("Brands")]
    public class Brand
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(100)]
        public string Name { get; set; }

        [Required, MaxLength(120)]
        public string Slug { get; set; }

        [MaxLength(255)]
        public string LogoUrl { get; set; }

        public string Description { get; set; }

        [MaxLength(200)]
        public string WebsiteUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
        public virtual ICollection<BrandCategory> BrandCategories { get; set; } = new List<BrandCategory>();
    }

    [Table("RELATED_PRODUCTS")]
    public class RelatedProduct
    {
        public Guid ProductId { get; set; }
        public Guid RelatedProductId { get; set; }

        [MaxLength(20)]
        public string RelationType { get; set; } = "similar"; // similar|bundle|upsell

        public int SortOrder { get; set; }

        [ForeignKey(nameof(ProductId))]
        public virtual Product Product { get; set; }

        [ForeignKey(nameof(RelatedProductId))]
        public virtual Product RelatedProductRef { get; set; }
    }
    [Table("BrandCategories")]
    public class BrandCategory
    {
        public Guid BrandId { get; set; }
        public Guid CategoryId { get; set; }

        [ForeignKey(nameof(BrandId))]
        public virtual Brand Brand { get; set; }

        [ForeignKey(nameof(CategoryId))]
        public virtual Category Category { get; set; }
        
    }
}