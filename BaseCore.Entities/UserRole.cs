using BaseCore.Common;
using BaseCore.Entities.Audit;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("UserRoles")]
    public partial class UserRole : Entity, IAuditable
    {
        public UserRole()
        {
            Roles = new HashSet<Role>();
            Users = new HashSet<User>();
        }

        public Guid Guid { get; set; } = Guid.NewGuid();

        [Required]
        public string UserId { get; set; }

        [Required]
        public string RoleId { get; set; }

        public bool IsActive { get; set; }

        public string RoleUserId { get; set; }  // bỏ ObjectId?, dùng string

        public string CreatedBy { get; set; }
        public DateTime Created { get; set; } = DateTime.Now;
        public string ModifiedBy { get; set; }
        public DateTime Modified { get; set; }
        public bool IsDeleted { get; set; }

        [ForeignKey(nameof(RoleId))]
        public virtual ICollection<Role> Roles { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual ICollection<User> Users { get; set; }
    }
}