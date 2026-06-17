namespace BaseCore.DTO.InventoryPlatform
{
     public class InventoryActionDto
    {
        public Guid   ProductId { get; set; }
        public int    Quantity  { get; set; }
        public string? Note     { get; set; }
    }
}