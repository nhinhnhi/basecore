using BaseCore.DTO.ProductPlatform;
using BaseCore.Entities;

namespace BaseCore.Services
{
    public record ProductListResult(List<Product> Items, int TotalCount);

    public interface IProductService
    {
        Task<ProductListResult> SearchAsync(
            string? keyword, Guid? categoryId,
            decimal? minPrice, decimal? maxPrice,
            int page, int pageSize);

        Task<ProductListResult> GetByCategoryAsync(Guid categoryId, int page, int pageSize);

        Task<Product?> GetByIdAsync(Guid id);

        Task<Product> CreateAsync(ProductCreateDto dto);

        Task<Product> UpdateAsync(Guid id, ProductUpdateDto dto);

        Task DeleteAsync(Guid id);
    }
}