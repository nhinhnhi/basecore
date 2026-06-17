using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Product Repository using Entity Framework Core
    /// </summary>
    public interface IProductRepositoryEF : IRepository<Product>
    {
        Task<(List<Product> Products, int TotalCount)> SearchAsync(
    string? keyword, Guid? categoryId, decimal? minPrice, decimal? maxPrice, int page, int pageSize);
        Task<(List<Product> Products, int TotalCount)> GetByCategoryAsync(Guid categoryId, int page, int pageSize);
        Task<(List<Product> Products, int TotalCount)> GetByBrandAsync(Guid brandId, int page, int pageSize, string? keyword, decimal? minPrice, decimal? maxPrice, Guid? categoryId);
    }

    public class ProductRepositoryEF : Repository<Product>, IProductRepositoryEF
    {
        public ProductRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<(List<Product> Products, int TotalCount)> SearchAsync(
            string? keyword, Guid? categoryId, decimal? minPrice, decimal? maxPrice, int page, int pageSize)
        {
            var query = _dbSet.Include(p => p.Category).AsQueryable();
            if (!string.IsNullOrEmpty(keyword))
            {
               var kw = keyword.ToLower();

                decimal.TryParse(keyword, out decimal kwDecimal);
                int.TryParse(keyword, out int kwInt);

                query = query.Where(p =>
                p.Name.ToLower().Contains(kw) ||
                p.Sku.ToLower().Contains(kw) ||
                p.Id.ToString().ToLower().Contains(kw) ||
                (p.Description != null && p.Description.ToLower().Contains(kw)) ||
                (p.Category != null && p.Category.Name.ToLower().Contains(kw))
                //p.BasePrice.ToString().Contains(kw) ||
               // p.TotalStock.ToString().Contains(kw)
            );
            }
            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
                query = query.Where(p => p.CategoryId == categoryId.Value);
            if (minPrice.HasValue)
                query = query.Where(p => p.BasePrice >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= maxPrice.Value);
            
            var totalCount = await query.CountAsync();
            var products = await query
                .OrderBy(p => p.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (products, totalCount);
        }

        public async Task<(List<Product> Products, int TotalCount)> GetByCategoryAsync(Guid categoryId, int page, int pageSize)
        {
            var query = _dbSet
                .Where(p => p.CategoryId == categoryId)
                .Include(p => p.Category);

            var totalCount = await query.CountAsync();

            var products = await query
                .OrderByDescending(p => p.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (products, totalCount);
        }

        public async Task<(List<Product> Products, int TotalCount)> GetByBrandAsync(Guid brandId, int page, int pageSize, string? keyword, decimal? minPrice, decimal? maxPrice, Guid? categoryId)
        {
            var query = _dbSet.Where(p => p.BrandId == brandId && !p.IsDeleted);

            if (!string.IsNullOrEmpty(keyword))
            {
                keyword = keyword.ToLower();
                query = query.Where(p => p.Name.ToLower().Contains(keyword) ||
                                        (p.ShortDescription != null && p.ShortDescription.ToLower().Contains(keyword)));
            }
            if (minPrice.HasValue)
                query = query.Where(p => p.BasePrice >= minPrice.Value);
            if (maxPrice.HasValue)
                query = query.Where(p => p.BasePrice <= maxPrice.Value);
            if (categoryId.HasValue && categoryId.Value != Guid.Empty)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            var totalCount = await query.CountAsync();
            var items = await query
                .OrderByDescending(p => p.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
            return (items, totalCount);
        }
    }
}
