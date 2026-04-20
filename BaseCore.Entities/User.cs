using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("Users")]
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();  // giữ string như cũ, hoặc đổi thành Guid

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; }

        [Required]
        public string Password { get; set; }  // lưu hash

        public byte[] Salt { get; set; }

        [MaxLength(200)]
        public string Contact { get; set; }

        [MaxLength(200)]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(20)]
        public string Phone { get; set; }

        [MaxLength(100)]
        public string Position { get; set; }

        [MaxLength(500)]
        public string Image { get; set; }

        public bool IsActive { get; set; }

        public int UserType { get; set; }

        public DateTime Created { get; set; } = DateTime.Now;
    }
}