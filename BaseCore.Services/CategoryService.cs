using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepositoryEF _categoryRepository;

        public CategoryService(ICategoryRepositoryEF categoryRepository)
        {
            _categoryRepository = categoryRepository;
        }

        public async Task<List<Category>> GetAllAsync()
        {
            var categories = await _categoryRepository.GetAllAsync();
            return categories.ToList();
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _categoryRepository.GetByIdAsync(id);
        }

        public async Task<Category> CreateAsync(Category category)
        {
            // Id sẽ tự động tăng trong database (IDENTITY), không cần tự sinh
            return await _categoryRepository.AddAsync(category);
        }

        public async Task UpdateAsync(Category category)
        {
            await _categoryRepository.UpdateAsync(category);
        }

        public async Task DeleteAsync(int id)
        {
            await _categoryRepository.DeleteByIdAsync(id);
        }
    }
}