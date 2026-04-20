using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Common
{
    public class Entity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; } = Guid.NewGuid(); // hoặc để DB tự sinh, không cần gán mặc định

        public DateTime CreatedDateTime { get; set; } = DateTime.UtcNow;
        public string? CreatedUser { get; set; } // nullable vì có thể null
    }
}