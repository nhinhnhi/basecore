using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("UserModules")]
    public partial class UserModule : Entity, IAuditable
    {
        public Guid Guid { get; set; } = Guid.NewGuid();

        [Required]
        public string UserId { get; set; }   // tham chiếu đến User.Id (string)

        [Required]
        public string ModuleId { get; set; } // tham chiếu đến Module.Id

        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }

        [ForeignKey(nameof(ModuleId))]
        public virtual Module Module { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }
}