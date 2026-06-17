using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository;
using BaseCore.Repository.EFCore;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using BaseCore.DTO.ProductPlatform;

namespace BaseCore.APIService.Controllers
{
    [Route("api/manufacturer/products")]
    [ApiController]
    [Authorize(Roles = "manufacturer")]
    public class ManufacturerProductsController : ControllerBase
    {
        private readonly IProductRepositoryEF _productRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly AppDbContext _context; // thêm để truy vấn BrandCategories

        public ManufacturerProductsController(
            IProductRepositoryEF productRepository,
            ICategoryRepositoryEF categoryRepository,
            AppDbContext context)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _context = context;
        }

        private Guid GetBrandId()
        {
            var brandIdClaim = User.FindFirst("BrandId")?.Value;
            if (string.IsNullOrEmpty(brandIdClaim) || !Guid.TryParse(brandIdClaim, out var brandId))
                throw new UnauthorizedAccessException("Brand not found for this user");
            return brandId;
        }

        private async Task<List<Guid>> GetAllowedCategoryIdsAsync(Guid brandId)
        {
            return await _context.BrandCategories
                .Where(bc => bc.BrandId == brandId)
                .Select(bc => bc.CategoryId)
                .ToListAsync();
        }

        [HttpGet]
        public async Task<IActionResult> GetMyProducts(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] string? keyword = null,
            [FromQuery] decimal? minPrice = null,
            [FromQuery] decimal? maxPrice = null,
            [FromQuery] Guid? categoryId = null
        )
        {
            var brandId = GetBrandId();
            var (products, totalCount) = await _productRepository.GetByBrandAsync(brandId, page, pageSize, keyword, minPrice, maxPrice, categoryId);
            return Ok(new { items = products, totalCount, page, pageSize, totalPages = (int)Math.Ceiling((double)totalCount / pageSize) });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || product.BrandId != GetBrandId())
                return NotFound();
            return Ok(product);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
        {
            var brandId = GetBrandId();
            var allowedCategoryIds = await GetAllowedCategoryIdsAsync(brandId);
            if (!allowedCategoryIds.Contains(dto.CategoryId))
                return BadRequest(new { message = "You are not allowed to add products to this category." });

            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId);
            if (category == null) return BadRequest("Category not found");

            var product = new Product
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Slug = dto.Name.ToLower().Replace(" ", "-"),
                BasePrice = dto.BasePrice,
                TotalStock = dto.TotalStock,
                CategoryId = dto.CategoryId,
                BrandId = brandId,
                Description = dto.Description ?? "",
                MainImageUrl = dto.MainImageUrl ?? "",
                Sku = $"SKU-{DateTime.Now.Ticks}-{Guid.NewGuid().ToString().Substring(0,4)}",
                Status = "active",
                Created = DateTime.UtcNow,
                ShortDescription = dto.Description?.Length > 500 ? dto.Description[..497] + "..." : dto.Description ?? "",
                MetaTitle = dto.Name,
                MetaDescription = dto.Description?.Length > 300 ? dto.Description[..297] + "..." : dto.Description ?? ""
            };
            await _productRepository.AddAsync(product);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || product.BrandId != GetBrandId())
                return Forbid();

            if (dto.CategoryId.HasValue)
            {
                var allowedCategoryIds = await GetAllowedCategoryIdsAsync(GetBrandId());
                if (!allowedCategoryIds.Contains(dto.CategoryId.Value))
                    return BadRequest(new { message = "You are not allowed to change to this category." });

                var newCategory = await _categoryRepository.GetByIdAsync(dto.CategoryId.Value);
                if (newCategory == null) return BadRequest("Category not found");
                product.CategoryId = dto.CategoryId.Value;
            }

            if (dto.Name != null) product.Name = dto.Name;
            if (dto.BasePrice.HasValue) product.BasePrice = dto.BasePrice.Value;
            if (dto.TotalStock.HasValue) product.TotalStock = dto.TotalStock.Value;
            if (dto.Description != null) product.Description = dto.Description;
            if (dto.MainImageUrl != null) product.MainImageUrl = dto.MainImageUrl;
            product.Modified = DateTime.UtcNow;

            await _productRepository.UpdateAsync(product);
            return Ok(product);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null || product.BrandId != GetBrandId())
                return Forbid();

            product.IsDeleted = true;
            await _productRepository.UpdateAsync(product);
            return Ok(new { message = "Product deleted" });
        }
    }
}