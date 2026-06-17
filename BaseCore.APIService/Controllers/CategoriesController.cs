using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using Microsoft.EntityFrameworkCore;
using BaseCore.Repository;
using BaseCore.DTO.CategoryPlatform;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly AppDbContext _context;

        public CategoriesController(ICategoryRepositoryEF categoryRepository, AppDbContext context)
        {
            _categoryRepository = categoryRepository;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .AsNoTracking()
                .Include(c => c.Parent)
                .OrderBy(c => c.SortOrder).ThenBy(c => c.Name)
                .Select(c => new {
                    c.Id, c.Name, c.Slug, c.Description, c.ImageUrl,
                    c.IconClass, c.IsActive, c.ShowInMenu, c.SortOrder,
                    c.MetaTitle, c.MetaDescription, c.ParentId, c.BrandId,
                    c.Created, c.Modified,
                    ParentName = c.Parent != null ? c.Parent.Name : null
                })
                .ToListAsync();
            return Ok(categories);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });
            return Ok(category);
        }

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Create([FromBody] CategoryCreateDto dto)
        {
            var slug = string.IsNullOrEmpty(dto.Slug) ? GenerateSlug(dto.Name) : dto.Slug;

            var slugExists = await _context.Categories.AnyAsync(c => c.Slug == slug);
            if (slugExists) slug = $"{slug}-{DateTime.Now.Ticks.ToString()[^4..]}";

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Slug = slug,
                Description = dto.Description ?? "",
                ImageUrl = dto.ImageUrl ?? "",
                IconClass = dto.IconClass ?? "fas fa-tag",
                IsActive = dto.IsActive ?? true,
                ShowInMenu = dto.ShowInMenu ?? true,
                SortOrder = dto.SortOrder ?? 0,
                MetaTitle = dto.MetaTitle ?? dto.Name,
                MetaDescription = dto.MetaDescription ?? "",
                ParentId = dto.ParentId,
                BrandId = dto.BrandId,
                Created = DateTime.UtcNow
            };

            await _categoryRepository.AddAsync(category);
            return Ok(category);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CategoryUpdateDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            if (dto.Name != null) { category.Name = dto.Name; if (dto.Slug == null) category.Slug = GenerateSlug(dto.Name) + $"-{DateTime.Now.Ticks.ToString()[^4..]}"; }
            if (dto.Slug != null)            category.Slug = dto.Slug;
            if (dto.Description != null)     category.Description = dto.Description;
            if (dto.ImageUrl != null)        category.ImageUrl = dto.ImageUrl;
            if (dto.IconClass != null)       category.IconClass = dto.IconClass;
            if (dto.IsActive.HasValue)       category.IsActive = dto.IsActive.Value;
            if (dto.ShowInMenu.HasValue)     category.ShowInMenu = dto.ShowInMenu.Value;
            if (dto.SortOrder.HasValue)      category.SortOrder = dto.SortOrder.Value;
            if (dto.MetaTitle != null)       category.MetaTitle = dto.MetaTitle;
            if (dto.MetaDescription != null) category.MetaDescription = dto.MetaDescription;
            if (dto.ParentId.HasValue)       category.ParentId = dto.ParentId == Guid.Empty ? null : dto.ParentId;
            if (dto.BrandId.HasValue)        category.BrandId = dto.BrandId == Guid.Empty ? null : dto.BrandId;
            category.Modified = DateTime.UtcNow;

            await _categoryRepository.UpdateAsync(category);
            return Ok(category);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
                return NotFound(new { message = "Category not found" });

            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
                return BadRequest(new { message = "Không thể xóa danh mục đang có sản phẩm" });

            var hasChildren = await _context.Categories.AnyAsync(c => c.ParentId == id);
            if (hasChildren)
                return BadRequest(new { message = "Không thể xóa danh mục đang có danh mục con" });

            await _categoryRepository.DeleteAsync(category);
            return Ok(new { message = "Category deleted successfully" });
        }

        private static string GenerateSlug(string name)
        {
            var slug = name.ToLower()
                .Replace("đ", "d")
                .Replace("à","a").Replace("á","a").Replace("ả","a").Replace("ã","a").Replace("ạ","a")
                .Replace("ă","a").Replace("ằ","a").Replace("ắ","a").Replace("ẳ","a").Replace("ẵ","a").Replace("ặ","a")
                .Replace("â","a").Replace("ầ","a").Replace("ấ","a").Replace("ẩ","a").Replace("ẫ","a").Replace("ậ","a")
                .Replace("è","e").Replace("é","e").Replace("ẻ","e").Replace("ẽ","e").Replace("ẹ","e")
                .Replace("ê","e").Replace("ề","e").Replace("ế","e").Replace("ể","e").Replace("ễ","e").Replace("ệ","e")
                .Replace("ì","i").Replace("í","i").Replace("ỉ","i").Replace("ĩ","i").Replace("ị","i")
                .Replace("ò","o").Replace("ó","o").Replace("ỏ","o").Replace("õ","o").Replace("ọ","o")
                .Replace("ô","o").Replace("ồ","o").Replace("ố","o").Replace("ổ","o").Replace("ỗ","o").Replace("ộ","o")
                .Replace("ơ","o").Replace("ờ","o").Replace("ớ","o").Replace("ở","o").Replace("ỡ","o").Replace("ợ","o")
                .Replace("ù","u").Replace("ú","u").Replace("ủ","u").Replace("ũ","u").Replace("ụ","u")
                .Replace("ư","u").Replace("ừ","u").Replace("ứ","u").Replace("ử","u").Replace("ữ","u").Replace("ự","u")
                .Replace("ỳ","y").Replace("ý","y").Replace("ỷ","y").Replace("ỹ","y").Replace("ỵ","y");
            return System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "")
                .Replace(" ", "-").Replace("--", "-").Trim('-');
        }
    }
}
