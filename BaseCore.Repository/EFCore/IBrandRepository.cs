using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public interface IBrandRepository : IRepository<Brand>
    {
        Task<Brand?> GetBySlugAsync(string slug);
        Task<List<Brand>> GetActiveAsync();
        Task<(List<Brand> Items, int TotalCount)> GetPagedAsync(
            string? keyword, bool? isActive, int page, int pageSize);
    }
}