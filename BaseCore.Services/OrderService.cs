using BaseCore.Entities;
using BaseCore.Repository.EFCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BaseCore.Services
{
    public class OrderService : IOrderService
    {
        private readonly IOrderRepositoryEF _orderRepository;
        private readonly IOrderDetailRepositoryEF _orderDetailRepository;
        private readonly IProductRepositoryEF _productRepository;

        public OrderService(
            IOrderRepositoryEF orderRepository,
            IOrderDetailRepositoryEF orderDetailRepository,
            IProductRepositoryEF productRepository)
        {
            _orderRepository = orderRepository;
            _orderDetailRepository = orderDetailRepository;
            _productRepository = productRepository;
        }

        public async Task<Order> CreateOrderAsync(Order order)
        {
            order.OrderDate = DateTime.UtcNow;
            order.Status = "Pending";
            // Id tự tăng
            var createdOrder = await _orderRepository.AddAsync(order);

            // Nếu có OrderDetails, thêm từng detail (gán OrderId)
            if (order.OrderDetails != null)
            {
                foreach (var detail in order.OrderDetails)
                {
                    detail.OrderId = createdOrder.Id;
                    await _orderDetailRepository.AddAsync(detail);
                }
            }

            return createdOrder;
        }

        public async Task<List<Order>> GetOrdersByUserIdAsync(Guid userId)
        {
            var orders = await _orderRepository.GetByUserAsync(userId);
            // Load details và product cho mỗi order
            foreach (var order in orders)
            {
                order.OrderDetails = await _orderDetailRepository.GetByOrderAsync(order.Id);
                foreach (var detail in order.OrderDetails)
                {
                    detail.Product = await _productRepository.GetByIdAsync(detail.ProductId);
                }
            }
            return orders;
        }

        public async Task<Order?> GetOrderByIdAsync(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order != null)
            {
                order.OrderDetails = await _orderDetailRepository.GetByOrderAsync(order.Id);
                foreach (var detail in order.OrderDetails)
                {
                    detail.Product = await _productRepository.GetByIdAsync(detail.ProductId);
                }
            }
            return order;
        }
    }
}