using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public class BrandRepository : Repository<Brand>, IBrandRepository
    {
        public BrandRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<Brand?> GetBySlugAsync(string slug)
        {
            return await _dbSet
                .AsNoTracking()
                .FirstOrDefaultAsync(b => b.Slug == slug);
        }

        public async Task<List<Brand>> GetActiveAsync()
        {
            return await _dbSet
                .AsNoTracking()
                .Where(b => b.IsActive)
                .OrderBy(b => b.Name)
                .ToListAsync();
        }

        public async Task<(List<Brand> Items, int TotalCount)> GetPagedAsync(
            string? keyword, bool? isActive, int page, int pageSize)
        {
            var query = _dbSet.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(b =>
                    b.Name.Contains(keyword) ||
                    (b.Description != null && b.Description.Contains(keyword)));

            if (isActive.HasValue)
                query = query.Where(b => b.IsActive == isActive.Value);

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderBy(b => b.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (items, totalCount);
        }
    }
}