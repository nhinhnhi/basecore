using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("ModuleFunctions")]
    public partial class ModuleFunction : Entity, IAuditable
    {
        public ModuleFunction()
        {
            RoleModuleFunction = new HashSet<RoleModuleFunction>();
        }

        public Guid Guid { get; set; } = Guid.NewGuid();

        [Required]
        public string ModuleId { get; set; }   // string, tham chiếu đến Module.Id (nếu Module dùng string)

        [Required]
        public string FunctionId { get; set; } // string, tham chiếu đến Function.Id

        // IAuditable yêu cầu CreatedBy, Created, ModifiedBy, Modified, IsDeleted
        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }

        [ForeignKey(nameof(FunctionId))]
        public virtual Function Function { get; set; }

        [ForeignKey(nameof(ModuleId))]
        public virtual Module Module { get; set; }

        public virtual ICollection<RoleModuleFunction> RoleModuleFunction { get; set; }
    }
}