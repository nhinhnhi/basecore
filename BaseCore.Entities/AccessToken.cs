using BaseCore.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BaseCore.Entities
{
    [Table("AccessTokens")]
    public partial class AccessToken : Entity
    {
        public Guid Guid { get; set; } = Guid.NewGuid();

        [Required]
        public string UserId { get; set; }

        [Required]
        public string Token { get; set; }

        public DateTime Expirated { get; set; }

        public virtual ICollection<Role> Roles { get; set; } = new HashSet<Role>();

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }
}