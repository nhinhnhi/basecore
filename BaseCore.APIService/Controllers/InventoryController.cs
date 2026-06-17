using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BaseCore.DTO.InventoryPlatform;

namespace BaseCore.APIService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class InventoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoryController(AppDbContext context)
        {
            _context = context;
        }

        // ── GET /api/Inventory ── Danh sách tồn kho tất cả sản phẩm
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? keyword,
            [FromQuery] string? status,   // "low" | "out" | "ok"
            [FromQuery] Guid? categoryId,
            [FromQuery] int lowStockThreshold = 10,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var query = _context.Products
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Include(p => p.Category)
                .Include(p => p.Brand)
                .AsQueryable();

            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(p => p.Name.Contains(keyword) || p.Sku.Contains(keyword));

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId);

            // Filter theo tình trạng tồn kho
            if (status == "out")
                query = query.Where(p => p.TotalStock == 0);
            else if (status == "low")
                query = query.Where(p => p.TotalStock > 0 && p.TotalStock <= lowStockThreshold);
            else if (status == "ok")
                query = query.Where(p => p.TotalStock > lowStockThreshold);

            var totalCount = await query.CountAsync();

            // Stats tổng quan
            var allProducts = await _context.Products.IgnoreQueryFilters().ToListAsync();
            var stats = new
            {
                TotalProducts  = allProducts.Count,
                OutOfStock     = allProducts.Count(p => p.TotalStock == 0),
                LowStock       = allProducts.Count(p => p.TotalStock > 0 && p.TotalStock <= lowStockThreshold),
                TotalStockValue = allProducts.Sum(p => p.TotalStock * p.BasePrice)
            };

            var items = await query
                .OrderBy(p => p.TotalStock)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new {
                    p.Id, p.Name, p.Sku, p.MainImageUrl,
                    p.TotalStock, p.SoldCount,
                    p.BasePrice, p.SalePrice,
                    CategoryName = p.Category != null ? p.Category.Name : null,
                    BrandName    = p.Brand    != null ? p.Brand.Name    : null,
                    p.Status, p.IsDeleted,
                    StockStatus = p.TotalStock == 0 ? "out"
                                : p.TotalStock <= lowStockThreshold ? "low"
                                : "ok"
                })
                .ToListAsync();

            return Ok(new {
                items, totalCount, page, pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                stats
            });
        }

        // ── GET /api/Inventory/{productId}/logs ── Lịch sử tồn kho 1 sản phẩm
        [HttpGet("{productId}/logs")]
        public async Task<IActionResult> GetLogs(
            Guid productId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            var product = await _context.Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == productId);
            if (product == null) return NotFound(new { message = "Product not found" });

            var totalCount = await _context.InventoryLogs
                .CountAsync(l => l.ProductId == productId);

            var logs = await _context.InventoryLogs
                .AsNoTracking()
                .Where(l => l.ProductId == productId)
                .OrderByDescending(l => l.Created)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(l => new {
                    l.Id, l.Type, l.QuantityChanged,
                    l.StockAfter, l.Note,
                    l.CreatedByName, l.Created
                })
                .ToListAsync();

            return Ok(new {
                product = new { product.Id, product.Name, product.Sku, product.TotalStock },
                logs, totalCount, page, pageSize,
                totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
            });
        }

        // ── POST /api/Inventory/import ── Nhập kho
        [HttpPost("import")]
        public async Task<IActionResult> Import([FromBody] InventoryActionDto dto)
        {
            return await ChangeStock(dto, "import");
        }

        // ── POST /api/Inventory/export ── Xuất kho thủ công
        [HttpPost("export")]
        public async Task<IActionResult> Export([FromBody] InventoryActionDto dto)
        {
            return await ChangeStock(dto, "export");
        }

        // ── POST /api/Inventory/adjust ── Điều chỉnh về số cụ thể
        [HttpPost("adjust")]
        public async Task<IActionResult> Adjust([FromBody] InventoryAdjustDto dto)
        {
            var product = await _context.Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null) return NotFound(new { message = "Product not found" });

            var oldStock  = product.TotalStock;
            var diff      = dto.NewStock - oldStock;
            product.TotalStock = dto.NewStock;
            product.Modified  = DateTime.UtcNow;

            var userName = User.FindFirst(ClaimTypes.Name)?.Value
                        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? "Admin";

            var log = new InventoryLog
            {
                ProductId       = product.Id,
                Type            = "adjust",
                QuantityChanged = diff,
                StockAfter      = dto.NewStock,
                Note            = dto.Note ?? $"Điều chỉnh từ {oldStock} → {dto.NewStock}",
                CreatedByName   = userName,
                Created      = DateTime.UtcNow
            };

            _context.Products.Update(product);
            _context.InventoryLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new {
                message = "Điều chỉnh tồn kho thành công",
                productId = product.Id, productName = product.Name,
                oldStock, newStock = dto.NewStock, diff
            });
        }

        // ── GET /api/Inventory/alerts ── Danh sách sắp hết hàng
        [HttpGet("alerts")]
        public async Task<IActionResult> GetAlerts([FromQuery] int threshold = 10)
        {
            var alerts = await _context.Products
                .AsNoTracking()
                .IgnoreQueryFilters()
                .Where(p => p.TotalStock <= threshold && p.IsDeleted == null)
                .OrderBy(p => p.TotalStock)
                .Select(p => new {
                    p.Id, p.Name, p.Sku, p.MainImageUrl,
                    p.TotalStock, p.SoldCount,
                    CategoryName = p.Category != null ? p.Category.Name : null,
                    StockStatus  = p.TotalStock == 0 ? "out" : "low"
                })
                .ToListAsync();

            return Ok(new {
                count = alerts.Count,
                outOfStock = alerts.Count(a => a.TotalStock == 0),
                lowStock   = alerts.Count(a => a.TotalStock > 0),
                items = alerts
            });
        }

        // ── Helper ────────────────────────────────────────────────────────────
        private async Task<IActionResult> ChangeStock(InventoryActionDto dto, string type)
        {
            if (dto.Quantity <= 0)
                return BadRequest(new { message = "Số lượng phải lớn hơn 0" });

            var product = await _context.Products.IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Id == dto.ProductId);
            if (product == null)
                return NotFound(new { message = "Product not found" });

            var oldStock = product.TotalStock;

            if (type == "export" && product.TotalStock < dto.Quantity)
                return BadRequest(new { message = $"Tồn kho không đủ (còn {product.TotalStock})" });

            product.TotalStock += type == "import" ? dto.Quantity : -dto.Quantity;
            product.Modified   = DateTime.UtcNow;

            var userName = User.FindFirst(ClaimTypes.Name)?.Value
                        ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                        ?? "Admin";

            var log = new InventoryLog
            {
                ProductId       = product.Id,
                Type            = type,
                QuantityChanged = type == "import" ? dto.Quantity : -dto.Quantity,
                StockAfter      = product.TotalStock,
                Note            = dto.Note,
                CreatedByName   = userName,
                Created     = DateTime.UtcNow
            };

            _context.Products.Update(product);
            _context.InventoryLogs.Add(log);
            await _context.SaveChangesAsync();

            return Ok(new {
                message = type == "import" ? "Nhập kho thành công" : "Xuất kho thành công",
                productId   = product.Id,
                productName = product.Name,
                oldStock,
                newStock    = product.TotalStock,
                changed     = log.QuantityChanged
            });
        }
    }

}