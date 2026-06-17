namespace BaseCore.DTO.BrandPlatform
{
    public class BrandUpdateDto
    {
        public string? Name { get; set; }
        public string? LogoUrl { get; set; }
        public string? Description { get; set; }
        public string? WebsiteUrl { get; set; }
        public bool? IsActive { get; set; }
    }
}