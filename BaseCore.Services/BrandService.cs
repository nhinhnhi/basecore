using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.DTO.BrandPlatform;

namespace BaseCore.Services
{
    public class BrandService : IBrandService
    {
        private readonly IBrandRepository _brandRepository;

        public BrandService(IBrandRepository brandRepository)
        {
            _brandRepository = brandRepository;
        }

        public async Task<(List<Brand> Items, int TotalCount)> GetAllAsync(
            string? keyword, bool? isActive, int page, int pageSize)
        {
            return await _brandRepository.GetPagedAsync(keyword, isActive, page, pageSize);
        }

        public async Task<Brand?> GetByIdAsync(Guid id)
        {
            return await _brandRepository.GetByIdAsync(id);
        }

        public async Task<Brand?> GetBySlugAsync(string slug)
        {
            return await _brandRepository.GetBySlugAsync(slug);
        }

        public async Task<List<Brand>> GetActiveAsync()
        {
            return await _brandRepository.GetActiveAsync();
        }

        public async Task<Brand> CreateAsync(BrandCreateDto dto)
        {
            // Kiểm tra tên trùng
            var existing = await _brandRepository.GetBySlugAsync(
                dto.Name.ToLower().Replace(" ", "-"));
            if (existing != null)
                throw new InvalidOperationException($"Thương hiệu '{dto.Name}' đã tồn tại");

            var brand = new Brand
            {
                Id          = Guid.NewGuid(),
                Name        = dto.Name.Trim(),
                Slug        = dto.Name.ToLower().Trim().Replace(" ", "-"),
                Description = dto.Description?.Trim() ?? "",
                LogoUrl     = dto.LogoUrl?.Trim()     ?? "",
                WebsiteUrl  = dto.WebsiteUrl?.Trim()  ?? "",
                IsActive    = true
            };

            await _brandRepository.AddAsync(brand);
            return brand;
        }

        public async Task<Brand> UpdateAsync(Guid id, BrandUpdateDto dto)
        {
            var brand = await _brandRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Không tìm thấy thương hiệu với id {id}");

            if (dto.Name != null)
            {
                brand.Name = dto.Name.Trim();
                brand.Slug = dto.Name.ToLower().Trim().Replace(" ", "-");
            }
            if (dto.Description != null) brand.Description = dto.Description.Trim();
            if (dto.LogoUrl     != null) brand.LogoUrl     = dto.LogoUrl.Trim();
            if (dto.WebsiteUrl  != null) brand.WebsiteUrl  = dto.WebsiteUrl.Trim();
            if (dto.IsActive    != null) brand.IsActive    = dto.IsActive.Value;

            await _brandRepository.UpdateAsync(brand);
            return brand;
        }

        public async Task DeleteAsync(Guid id)
        {
            var brand = await _brandRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException($"Không tìm thấy thương hiệu với id {id}");

            await _brandRepository.DeleteAsync(brand);
        }
    }
}