// ============================================
// app/api/admin/reports/services/salesReportService.ts
// ============================================
import Order from "../../../../app/models/Order";
import { generateDailyBreakdown, groupOrdersByStatus, calculateGrowth } from "../aggregationUtils";

export async function generateSalesReport(
  start: Date,
  end: Date,
  prevStart: Date,
  prevEnd: Date
) {
  const [currentOrders, previousOrders] = await Promise.all([
    Order.find({ placed_at: { $gte: start, $lte: end } }).lean(),
    Order.find({ placed_at: { $gte: prevStart, $lt: prevEnd } }).lean(),
  ]);

  const currentRevenue = currentOrders.reduce((sum, o) => sum + o.pricing.total, 0);
  const previousRevenue = previousOrders.reduce((sum, o) => sum + o.pricing.total, 0);

  const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
  const ordersGrowth = calculateGrowth(currentOrders.length, previousOrders.length);

  const dailyData = generateDailyBreakdown(currentOrders, start, end);
  const topProducts = extractTopProducts(currentOrders);

  return {
    summary: {
      totalRevenue: currentRevenue,
      totalOrders: currentOrders.length,
      averageOrderValue: currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0,
      revenueGrowth,
      ordersGrowth,
      previousRevenue,
      previousOrders: previousOrders.length,
    },
    dailyData,
    topProducts,
    ordersByStatus: groupOrdersByStatus(currentOrders),
  };
}

function extractTopProducts(orders: any[]) {
  const productSales = new Map();
  
  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      const key = item.product_id.toString();
      if (!productSales.has(key)) {
        productSales.set(key, {
          product_id: item.product_id,
          name: item.product_name,
          image: item.product_image,
          quantity: 0,
          revenue: 0,
        });
      }
      const prod = productSales.get(key);
      prod.quantity += item.quantity;
      prod.revenue += item.subtotal;
    });
  });

  return Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

