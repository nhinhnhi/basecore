namespace BaseCore.DTO.InventoryPlatform
{
    public class InventoryAdjustDto
    {
        public Guid   ProductId { get; set; }
        public int    NewStock  { get; set; }
        public string? Note     { get; set; }
    }
}