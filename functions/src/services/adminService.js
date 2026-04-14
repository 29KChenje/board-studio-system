import { boardRepository } from "../repositories/boardRepository.js";
import { orderRepository } from "../repositories/orderRepository.js";
import { productRepository } from "../repositories/productRepository.js";
import { projectRepository } from "../repositories/projectRepository.js";
import { userRepository } from "../repositories/userRepository.js";

export const adminService = {
  getDashboard: async () => {
    const [customers, projects, orders, boards, products] = await Promise.all([
      userRepository.findCustomers(),
      projectRepository.findAll(),
      orderRepository.findAllDetailed(),
      boardRepository.findAll(),
      productRepository.list({ onlyActive: false })
    ]);

    const revenue = orders.reduce((sum, order) => sum + Number(order.total_cost), 0);
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    const ordersByType = orders.reduce((acc, order) => {
      acc[order.order_type] = (acc[order.order_type] || 0) + 1;
      return acc;
    }, {});
    const lowStockProducts = products
      .filter((product) => Number(product.stock_quantity) <= 5)
      .sort((a, b) => Number(a.stock_quantity) - Number(b.stock_quantity));
    const monthlyRevenue = orders.reduce((acc, order) => {
      const month = new Date(order.created_at).toISOString().slice(0, 7);
      acc[month] = (acc[month] || 0) + Number(order.total_cost);
      return acc;
    }, {});

    return {
      metrics: {
        customers: customers.length,
        projects: projects.length,
        orders: orders.length,
        products: products.length,
        revenue: Number(revenue.toFixed(2))
      },
      analytics: {
        ordersByStatus,
        ordersByType,
        lowStockProducts,
        monthlyRevenue
      },
      customers,
      projects,
      orders,
      boards,
      products
    };
  },

  getSystemHealth: async () => ({
    uptimeSeconds: Math.floor(process.uptime()),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    status: "ok"
  })
};
