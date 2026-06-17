namespace BaseCore.DTO.UserPlatform
{
    public class UpdateUserDto
    {
        public string? FullName { get; set; }
        public string? Email { get; set; }
        public string? Phone { get; set; }
        public string? Role { get; set; }
        public string? Password { get; set; }
        public string? AvatarUrl { get; set; }
        public string? Contact { get; set; }
        public string? Position { get; set; }
        public Guid? BrandId { get; set; }
        public bool? IsActive { get; set; }
        public bool? IsEmailVerified { get; set; }
    }
}