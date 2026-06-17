// OrderService.cs
using BaseCore.DTO.OrderPlatform;
using BaseCore.Entities;
using BaseCore.Repository;
using Microsoft.EntityFrameworkCore;

namespace BaseCore.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;

        // Dùng AppDbContext cho các query phức tạp có projection/transaction.
        // Nếu muốn thuần Repository, inject thêm các IRepositoryEF tương ứng.
        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        private static readonly string[] ValidStatuses =
        {
            "pending", "confirmed", "processing",
            "ready_to_ship", "shipped", "delivered",
            "cancelled", "refund_requested", "refunded"
        };

        // ─── GET MY ORDERS ────────────────────────────────────────────────────
        public async Task<(List<object> items, int totalCount)> GetMyOrdersAsync(
            Guid userId, string? status, int page, int pageSize)
        {
            var query = _context.Orders.AsNoTracking().Where(o => o.UserId == userId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status.ToLower());

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize).Take(pageSize)
                .Select(o => (object)new {
                    o.Id, o.OrderDate, o.Subtotal, o.ShippingFee,
                    o.DiscountAmount, o.Total, o.Status,
                    o.PaymentMethod, o.PaymentStatus,
                    o.RecipientName, o.RecipientPhone, o.ShippingAddress,
                    o.CustomerNote, o.Created, o.CancelledAt,
                    o.ConfirmedAt, o.ShippedAt, o.DeliveredAt, o.EstimatedDelivery,
                    ItemCount = o.OrderItems.Count()
                }).ToListAsync();

            return (items, totalCount);
        }

        // ─── GET ALL ORDERS (admin) ───────────────────────────────────────────
        public async Task<(List<object> items, int totalCount)> GetAllOrdersAsync(
            int page, int pageSize, string? status, string? keyword,
            string? paymentMethod, DateTime? fromDate, DateTime? toDate)
        {
            var query = _context.Orders.AsNoTracking().AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(o => o.Status == status.ToLower());
            if (!string.IsNullOrEmpty(paymentMethod))
                query = query.Where(o => o.PaymentMethod == paymentMethod.ToLower());
            if (!string.IsNullOrEmpty(keyword))
                query = query.Where(o =>
                    o.Id.ToString().Contains(keyword) ||
                    o.UserId.ToString().Contains(keyword) ||
                    (o.RecipientName != null && o.RecipientName.Contains(keyword)) ||
                    (o.RecipientPhone != null && o.RecipientPhone.Contains(keyword)) ||
                    (o.ShippingAddress != null && o.ShippingAddress.Contains(keyword)));
            if (fromDate.HasValue) query = query.Where(o => o.Created >= fromDate.Value);
            if (toDate.HasValue)   query = query.Where(o => o.Created <= toDate.Value.AddDays(1));

            var totalCount = await query.CountAsync();

            var items = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((page - 1) * pageSize).Take(pageSize)
                .Select(o => (object)new {
                    o.Id, o.UserId, o.OrderDate, o.Subtotal, o.ShippingFee,
                    o.DiscountAmount, o.Total, o.Status, o.PaymentMethod, o.PaymentStatus,
                    o.RecipientName, o.RecipientPhone, o.ShippingAddress,
                    o.Created, o.Modified, o.CouponId, o.ConfirmedAt,
                    ItemCount = o.OrderItems.Count()
                }).ToListAsync();

            return (items, totalCount);
        }

        // ─── GET ORDER DETAIL ─────────────────────────────────────────────────
        public async Task<object?> GetOrderDetailAsync(Guid orderId)
        {
            var order = await _context.Orders.AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == orderId);
            if (order == null) return null;

            var items = await _context.OrderItems.AsNoTracking()
                .Where(oi => oi.OrderId == orderId)
                .Select(oi => new {
                    oi.Id, oi.OrderId, oi.ProductId, oi.VariantId,
                    oi.ProductNameSnapshot, oi.VariantInfoSnapshot, oi.ImageUrlSnapshot,
                    oi.Quantity, oi.UnitPrice, oi.Subtotal, oi.IsReviewed, oi.Created,
                    Product = _context.Products.IgnoreQueryFilters()
                        .Where(p => p.Id == oi.ProductId)
                        .Select(p => new { p.Id, p.Name, p.MainImageUrl, p.BasePrice, p.Slug })
                        .FirstOrDefault()
                }).ToListAsync();

            var shipment = await _context.Shipments.AsNoTracking()
                .Include(s => s.Provider).Include(s => s.Events)
                .FirstOrDefaultAsync(s => s.OrderId == orderId);

            var payments = await _context.Payments.AsNoTracking()
                .Where(p => p.OrderId == orderId)
                .Select(p => new { p.Id, p.PaymentMethod, p.Amount, p.Status, p.Created })
                .ToListAsync();

            object? couponResult = null;
            if (order.CouponId.HasValue)
            {
                var coupon = await _context.Coupons.AsNoTracking()
                    .FirstOrDefaultAsync(c => c.Id == order.CouponId);
                if (coupon != null)
                    couponResult = new { coupon.Code, coupon.DiscountType };
            }

            return new { order, items, shipment, payments, coupon = couponResult };
        }

        // ─── CREATE ORDER ─────────────────────────────────────────────────────
        public async Task<(Order order, List<OrderItem> items, decimal discountAmount, string? couponCode)>
            CreateOrderAsync(Guid userId, CreateOrderDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                decimal subtotal = 0;
                var orderItems = new List<OrderItem>();

                // 1. Kiểm tra sản phẩm & tính tiền
                foreach (var item in dto.Items)
                {
                    var product = await _context.Products.IgnoreQueryFilters()
                        .FirstOrDefaultAsync(p => p.Id == item.ProductId)
                        ?? throw new InvalidOperationException(
                            $"Sản phẩm {item.ProductId} không tồn tại");

                    if (product.TotalStock < item.Quantity)
                        throw new InvalidOperationException(
                            $"Sản phẩm '{product.Name}' không đủ hàng (còn {product.TotalStock})");

                    var unitPrice    = product.SalePrice ?? product.BasePrice;
                    var itemSubtotal = unitPrice * item.Quantity;
                    subtotal += itemSubtotal;

                    orderItems.Add(new OrderItem {
                        Id                  = Guid.NewGuid(),
                        ProductId           = item.ProductId,
                        VariantId           = item.VariantId,
                        ProductNameSnapshot = product.Name,
                        VariantInfoSnapshot = item.VariantInfo ?? "",
                        ImageUrlSnapshot    = product.MainImageUrl ?? "",
                        Quantity            = item.Quantity,
                        UnitPrice           = unitPrice,
                        Subtotal            = itemSubtotal,
                        IsReviewed          = false,
                        Created             = DateTime.UtcNow,
                        CreatedBy           = userId.ToString(),
                        Modified            = DateTime.UtcNow,
                        ModifiedBy          = userId.ToString(),
                        IsDeleted           = false
                    });

                    product.TotalStock -= item.Quantity;
                    product.SoldCount  += item.Quantity;
                    product.Modified    = DateTime.UtcNow;
                    _context.Products.Update(product);
                }

                // 2. Áp dụng coupon
                decimal discountAmount = 0;
                Guid?   couponId       = null;
                string? couponCode     = null;

                if (!string.IsNullOrEmpty(dto.CouponCode))
                {
                    var coupon = await _context.Coupons
                        .FirstOrDefaultAsync(c =>
                            c.Code == dto.CouponCode.ToUpper() && c.IsActive &&
                            c.ValidFrom <= DateTime.UtcNow && c.ValidUntil >= DateTime.UtcNow &&
                            (c.UsageLimit == 0 || c.UsedCount < c.UsageLimit))
                        ?? throw new InvalidOperationException(
                            "Mã giảm giá không hợp lệ hoặc đã hết hạn");

                    if (subtotal < coupon.MinOrderValue)
                        throw new InvalidOperationException(
                            $"Đơn hàng tối thiểu {coupon.MinOrderValue:N0}đ để dùng mã này");

                    discountAmount = coupon.DiscountType == "percentage"
                        ? Math.Min(subtotal * coupon.DiscountValue / 100,
                                   coupon.MaxDiscountAmount > 0 ? coupon.MaxDiscountAmount : decimal.MaxValue)
                        : Math.Min(coupon.DiscountValue, subtotal);

                    coupon.UsedCount++;
                    coupon.Modified = DateTime.UtcNow;
                    _context.Coupons.Update(coupon);
                    couponId   = coupon.Id;
                    couponCode = coupon.Code;
                }

                // 3. Tạo Order
                var order = new Order {
                    Id             = Guid.NewGuid(),
                    UserId         = userId,
                    OrderDate      = DateTime.UtcNow,
                    Subtotal       = subtotal,
                    ShippingFee    = dto.ShippingFee > 0 ? dto.ShippingFee : 30000,
                    DiscountAmount = discountAmount,
                    Total          = subtotal + (dto.ShippingFee > 0 ? dto.ShippingFee : 30000) - discountAmount,
                    Status         = "pending",
                    RecipientName  = dto.RecipientName,
                    RecipientPhone = dto.RecipientPhone,
                    ShippingAddress = dto.ShippingAddress,
                    CustomerNote   = dto.CustomerNote ?? "",
                    AdminNote      = "",
                    PaymentMethod  = dto.PaymentMethod?.ToLower() ?? "cod",
                    PaymentStatus  = dto.PaymentMethod?.ToLower() is "momo" or "vnpay" or "zalopay"
                                        ? "paid" : "unpaid",
                    CouponId       = couponId,
                    Created        = DateTime.UtcNow,
                    CreatedBy      = userId.ToString(),
                    Modified       = DateTime.UtcNow,
                    ModifiedBy     = userId.ToString(),
                    IsDeleted      = false
                };

                _context.Orders.Add(order);

                foreach (var item in orderItems)
                {
                    item.OrderId = order.Id;
                    _context.OrderItems.Add(item);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return (order, orderItems, discountAmount, couponCode);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw; // Để Controller bắt và trả HTTP 400/500
            }
        }

        // ─── UPDATE STATUS ────────────────────────────────────────────────────
        public async Task<Order> UpdateStatusAsync(Guid orderId, string newStatus, string? adminNote)
        {
            if (!ValidStatuses.Contains(newStatus))
                throw new ArgumentException("Trạng thái không hợp lệ");

            var order = await _context.Orders.FindAsync(orderId)
                ?? throw new KeyNotFoundException("Order not found");

            order.Status   = newStatus;
            order.Modified = DateTime.UtcNow;
            if (adminNote != null) order.AdminNote = adminNote;

            switch (newStatus)
            {
                case "confirmed": order.ConfirmedAt = DateTime.UtcNow; break;
                case "shipped":   order.ShippedAt   = DateTime.UtcNow; break;
                case "delivered": order.DeliveredAt = DateTime.UtcNow; break;
                case "cancelled": order.CancelledAt = DateTime.UtcNow; break;
            }

            await _context.SaveChangesAsync();
            return order;
        }

        // ─── CANCEL ORDER ─────────────────────────────────────────────────────
        public async Task<Order> CancelOrderAsync(Guid orderId, Guid userId, string? reason)
        {
            var order = await _context.Orders.FindAsync(orderId)
                ?? throw new KeyNotFoundException("Order not found");

            if (order.UserId != userId)
                throw new UnauthorizedAccessException();

            if (!new[] { "pending", "confirmed" }.Contains(order.Status))
                throw new InvalidOperationException(
                    "Chỉ có thể hủy đơn đang chờ hoặc đã xác nhận");

            // Hoàn kho
            var items = await _context.OrderItems.Where(oi => oi.OrderId == orderId).ToListAsync();
            foreach (var item in items.Where(i => i.ProductId.HasValue))
            {
                var product = await _context.Products.IgnoreQueryFilters()
                    .FirstOrDefaultAsync(p => p.Id == item.ProductId!.Value);
                if (product != null)
                {
                    product.TotalStock += item.Quantity;
                    product.SoldCount   = Math.Max(0, product.SoldCount - item.Quantity);
                    _context.Products.Update(product);
                }
            }

            // Hoàn coupon
            if (order.CouponId.HasValue)
            {
                var coupon = await _context.Coupons.FindAsync(order.CouponId.Value);
                if (coupon != null) { coupon.UsedCount--; _context.Coupons.Update(coupon); }
            }

            order.Status      = "cancelled";
            order.CancelledAt = DateTime.UtcNow;
            order.Modified    = DateTime.UtcNow;
            if (reason != null) order.CustomerNote += $"\n[Lý do hủy: {reason}]";

            await _context.SaveChangesAsync();
            return order;
        }

        // ─── DELETE ORDER ─────────────────────────────────────────────────────
        public async Task DeleteOrderAsync(Guid orderId)
        {
            var order = await _context.Orders.FindAsync(orderId)
                ?? throw new KeyNotFoundException("Order not found");

            var items = await _context.OrderItems.Where(oi => oi.OrderId == orderId).ToListAsync();
            _context.OrderItems.RemoveRange(items);
            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
        }
    }
}