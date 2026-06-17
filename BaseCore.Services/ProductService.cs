using BaseCore.DTO.ProductPlatform;
using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepositoryEF _productRepository;
        private readonly ICategoryRepositoryEF _categoryRepository;
        private readonly AppDbContext _context;

        public ProductService(
            IProductRepositoryEF productRepository,
            ICategoryRepositoryEF categoryRepository,
            AppDbContext context)
        {
            _productRepository = productRepository;
            _categoryRepository = categoryRepository;
            _context = context;
        }

        // ─── SEARCH ───────────────────────────────────────────────────────────
        public async Task<ProductListResult> SearchAsync(
            string? keyword, Guid? categoryId,
            decimal? minPrice, decimal? maxPrice,
            int page, int pageSize)
        {
            var (products, totalCount) = await _productRepository
                .SearchAsync(keyword, categoryId, minPrice, maxPrice, page, pageSize);
            return new ProductListResult(products, totalCount);
        }

        // ─── GET BY CATEGORY ──────────────────────────────────────────────────
        public async Task<ProductListResult> GetByCategoryAsync(
            Guid categoryId, int page, int pageSize)
        {
            var (products, totalCount) = await _productRepository
                .GetByCategoryAsync(categoryId, page, pageSize);
            return new ProductListResult(products, totalCount);
        }

        // ─── GET BY ID ────────────────────────────────────────────────────────
        public async Task<Product?> GetByIdAsync(Guid id)
            => await _productRepository.GetByIdAsync(id);

        // ─── CREATE ───────────────────────────────────────────────────────────
        public async Task<Product> CreateAsync(ProductCreateDto dto)
        {
            var category = await _categoryRepository.GetByIdAsync(dto.CategoryId)
                ?? throw new KeyNotFoundException("Category not found");

            // Tạo slug
            var slug = string.IsNullOrEmpty(dto.Slug)
                ? GenerateSlug(dto.Name)
                : dto.Slug;

            // Kiểm tra slug trùng
            var slugExists = await _context.Products
                .IgnoreQueryFilters()
                .AnyAsync(p => p.Slug == slug);
            if (slugExists)
                slug = $"{slug}-{DateTime.Now.Ticks.ToString()[^6..]}";

            var product = new Product
            {
                Id               = Guid.NewGuid(),
                Name             = dto.Name,
                Slug             = slug,
                ShortDescription = dto.ShortDescription ?? "",
                Description      = dto.Description ?? "",
                BasePrice        = dto.BasePrice,
                SalePrice        = dto.SalePrice,
                TotalStock       = dto.TotalStock,
                CategoryId       = dto.CategoryId,
                BrandId          = dto.BrandId,
                MainImageUrl     = dto.MainImageUrl ?? "",
                Sku              = string.IsNullOrEmpty(dto.Sku)
                                    ? $"SKU-{DateTime.Now.Ticks}-{Guid.NewGuid().ToString()[..4]}"
                                    : dto.Sku,
                Status           = dto.Status ?? "active",
                IsFeatured       = dto.IsFeatured,
                IsNewArrival     = dto.IsNewArrival,
                MetaTitle        = dto.MetaTitle ?? dto.Name,
                MetaDescription  = dto.MetaDescription ?? "",
                AvgRating        = 0,
                ReviewCount      = 0,
                SoldCount        = 0,
                Created          = DateTime.UtcNow,
                PublishedAt      = dto.IsPublished ? DateTime.UtcNow : null
            };

            await _productRepository.AddAsync(product);
            return product;
        }

        // ─── UPDATE ───────────────────────────────────────────────────────────
        public async Task<Product> UpdateAsync(Guid id, ProductUpdateDto dto)
        {
            var product = await _productRepository.GetByIdAsync(id)
                ?? throw new KeyNotFoundException("Product not found");

            if (dto.Name != null)
            {
                product.Name = dto.Name;
                if (dto.Slug == null)
                    product.Slug = GenerateSlug(dto.Name) + $"-{DateTime.Now.Ticks.ToString()[^4..]}";
            }

            if (dto.Slug             != null)  product.Slug             = dto.Slug;
            if (dto.ShortDescription != null)  product.ShortDescription = dto.ShortDescription;
            if (dto.Description      != null)  product.Description      = dto.Description;
            if (dto.BasePrice        .HasValue) product.BasePrice        = dto.BasePrice.Value;
            if (dto.SalePrice        .HasValue) product.SalePrice        = dto.SalePrice.Value == 0
                                                                            ? null : dto.SalePrice.Value;
            if (dto.TotalStock       .HasValue) product.TotalStock       = dto.TotalStock.Value;
            if (dto.CategoryId       .HasValue) product.CategoryId       = dto.CategoryId.Value;
            if (dto.BrandId          .HasValue) product.BrandId          = dto.BrandId.Value;
            if (dto.MainImageUrl     != null)   product.MainImageUrl     = dto.MainImageUrl;
            if (dto.Sku              != null)   product.Sku              = dto.Sku;
            if (dto.Status           != null)   product.Status           = dto.Status;
            if (dto.IsFeatured       .HasValue) product.IsFeatured       = dto.IsFeatured.Value;
            if (dto.IsNewArrival     .HasValue) product.IsNewArrival     = dto.IsNewArrival.Value;
            if (dto.MetaTitle        != null)   product.MetaTitle        = dto.MetaTitle;
            if (dto.MetaDescription  != null)   product.MetaDescription  = dto.MetaDescription;
            if (dto.IsPublished      .HasValue)
                product.PublishedAt = dto.IsPublished.Value
                    ? (product.PublishedAt ?? DateTime.UtcNow)
                    : null;

            product.Modified = DateTime.UtcNow;
            await _productRepository.UpdateAsync(product);
            return product;
        }

        // ─── DELETE (soft) ────────────────────────────────────────────────────
        public async Task DeleteAsync(Guid id)
        {
            var product = await _context.Products
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == id)
                ?? throw new KeyNotFoundException("Product not found");

            // Soft delete để tránh FK constraint với OrderItems
            product.IsDeleted = true;
            await _context.SaveChangesAsync();
        }

        // ─── Helper ───────────────────────────────────────────────────────────
        private static string GenerateSlug(string name)
        {
            var slug = name.ToLower()
                .Replace("đ", "d")
                .Replace("à", "a").Replace("á", "a").Replace("ả", "a").Replace("ã", "a").Replace("ạ", "a")
                .Replace("ă", "a").Replace("ằ", "a").Replace("ắ", "a").Replace("ẳ", "a").Replace("ẵ", "a").Replace("ặ", "a")
                .Replace("â", "a").Replace("ầ", "a").Replace("ấ", "a").Replace("ẩ", "a").Replace("ẫ", "a").Replace("ậ", "a")
                .Replace("è", "e").Replace("é", "e").Replace("ẻ", "e").Replace("ẽ", "e").Replace("ẹ", "e")
                .Replace("ê", "e").Replace("ề", "e").Replace("ế", "e").Replace("ể", "e").Replace("ễ", "e").Replace("ệ", "e")
                .Replace("ì", "i").Replace("í", "i").Replace("ỉ", "i").Replace("ĩ", "i").Replace("ị", "i")
                .Replace("ò", "o").Replace("ó", "o").Replace("ỏ", "o").Replace("õ", "o").Replace("ọ", "o")
                .Replace("ô", "o").Replace("ồ", "o").Replace("ố", "o").Replace("ổ", "o").Replace("ỗ", "o").Replace("ộ", "o")
                .Replace("ơ", "o").Replace("ờ", "o").Replace("ớ", "o").Replace("ở", "o").Replace("ỡ", "o").Replace("ợ", "o")
                .Replace("ù", "u").Replace("ú", "u").Replace("ủ", "u").Replace("ũ", "u").Replace("ụ", "u")
                .Replace("ư", "u").Replace("ừ", "u").Replace("ứ", "u").Replace("ử", "u").Replace("ữ", "u").Replace("ự", "u")
                .Replace("ỳ", "y").Replace("ý", "y").Replace("ỷ", "y").Replace("ỹ", "y").Replace("ỵ", "y");

            return System.Text.RegularExpressions.Regex.Replace(slug, @"[^a-z0-9\s-]", "")
                .Replace(" ", "-").Replace("--", "-").Trim('-');
        }
    }
}