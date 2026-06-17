using BaseCore.Entities;
using BaseCore.DTO.BrandPlatform;

namespace BaseCore.Services
{
    public interface IBrandService
    {
        Task<(List<Brand> Items, int TotalCount)> GetAllAsync(
            string? keyword, bool? isActive, int page, int pageSize);

        Task<Brand?> GetByIdAsync(Guid id);
        Task<Brand?> GetBySlugAsync(string slug);
        Task<List<Brand>> GetActiveAsync();
        Task<Brand> CreateAsync(BrandCreateDto dto);
        Task<Brand> UpdateAsync(Guid id, BrandUpdateDto dto);
        Task DeleteAsync(Guid id);
    }
}