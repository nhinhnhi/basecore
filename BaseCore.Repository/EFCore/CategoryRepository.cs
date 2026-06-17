using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    public interface ICategoryRepositoryEF : IRepository<Category>
    {
        Task<Category?> GetByNameAsync(string name);
    }

    public class CategoryRepositoryEF : Repository<Category>, ICategoryRepositoryEF
    {
        public CategoryRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<Category?> GetByNameAsync(string name)
        {
            return await _dbSet
            .Include(c => c.Brand)
            .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower());
        }
        public override async Task<IEnumerable<Category>> GetAllAsync()
            {
                return await _dbSet
                    .Include(c => c.Brand)
                    .OrderBy(c => c.Name)
                    .ToListAsync();
            }

            // Override GetByIdAsync để include Brand
            public override async Task<Category?> GetByIdAsync(object id)
            {
                return await _dbSet
                    .Include(c => c.Brand)
                    .FirstOrDefaultAsync(c => c.Id == (Guid)id);
            }
    }
}
