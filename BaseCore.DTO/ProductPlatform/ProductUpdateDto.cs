namespace BaseCore.DTO.ProductPlatform
{
    public class ProductUpdateDto
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? ShortDescription { get; set; }
        public string? Description { get; set; }
        public decimal? BasePrice { get; set; }
        public decimal? SalePrice { get; set; }
        public int? TotalStock { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? BrandId { get; set; }
        public string? Sku { get; set; }
        public string? MainImageUrl { get; set; }
        public string? Status { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsNewArrival { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public bool? IsPublished { get; set; }
    }
}