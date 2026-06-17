using BaseCore.Common;

namespace BaseCore.Entities
{
    public class SeedConfiguration : Entity
    {
        public decimal RightSeed { get; set; }
        public decimal LeftSeed { get; set; }
        public decimal BackwardSeed { get; set; }
        public decimal ForwardSeed { get; set; }
    }
}
