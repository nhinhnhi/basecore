namespace BaseCore.DTO.CategoryPlatform
{
    public class CategoryUpdateDto
    {
        public string? Name { get; set; }
        public string? Slug { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string? IconClass { get; set; }
        public bool? IsActive { get; set; }
        public bool? ShowInMenu { get; set; }
        public int? SortOrder { get; set; }
        public string? MetaTitle { get; set; }
        public string? MetaDescription { get; set; }
        public Guid? ParentId { get; set; }
        public Guid? BrandId { get; set; }
    }
}