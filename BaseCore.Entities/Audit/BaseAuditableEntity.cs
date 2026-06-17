namespace BaseCore.Entities.Audit
{
    public abstract class BaseAuditableEntity : IAuditable
    {
        public string CreatedBy { get; set; } = string.Empty;

        public DateTime Created { get; set; }

        public string? ModifiedBy { get; set; }

        public DateTime Modified { get; set; }

        public bool IsDeleted { get; set; }
    }
}