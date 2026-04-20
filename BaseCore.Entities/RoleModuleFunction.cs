using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("RoleModuleFunctions")]
    public partial class RoleModuleFunction : Entity, IAuditable
    {
        public Guid Guid { get; set; } = Guid.NewGuid();

        [Required]
        public string RoleId { get; set; }

        [Required]
        public string ModuleFunctionId { get; set; }

        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }
        public bool IsActive { get; set; }
    }
}