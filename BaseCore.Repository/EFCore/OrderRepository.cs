using Microsoft.EntityFrameworkCore;
using BaseCore.Entities;

namespace BaseCore.Repository.EFCore
{
    /// <summary>
    /// Order Repository using Entity Framework Core
    /// </summary>
    public interface IOrderRepositoryEF : IRepository<Order>
    {
        Task<List<Order>> GetByUserAsync(Guid userId);
        Task<Order?> GetWithDetailsAsync(Guid orderId);
    }

    public class OrderRepositoryEF : Repository<Order>, IOrderRepositoryEF
    {
        public OrderRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<List<Order>> GetByUserAsync(Guid userId)
        {
            return await _dbSet
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order?> GetWithDetailsAsync(Guid orderId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(o => o.Id == orderId);
        }
    }

    /// <summary>
    /// OrderDetail Repository using Entity Framework Core
    /// </summary>
    public interface IOrderItemRepositoryEF : IRepository<OrderItem>
    {
        Task<List<OrderItem>> GetByOrderIdAsync(Guid orderId);
        Task<List<OrderItem>> GetByProductIdAsync(Guid productId);
    }

    public class OrderItemRepositoryEF : Repository<OrderItem>, IOrderItemRepositoryEF
    {
        public OrderItemRepositoryEF(AppDbContext context) : base(context)
        {
        }

        public async Task<List<OrderItem>> GetByOrderIdAsync(Guid orderId)
        {
            return await _dbSet
                .Where(oi => oi.OrderId == orderId)
                .Include(oi => oi.Product)
                .Include(oi => oi.Images)
                .ToListAsync();
        }

        public async Task<List<OrderItem>> GetByProductIdAsync(Guid productId)
        {
            return await _dbSet
                .Where(oi => oi.ProductId == productId)
                .ToListAsync();
        }
    }
}
