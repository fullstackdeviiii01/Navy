// ============================================
// app/api/admin/reports/services/productReportService.ts
// ============================================
import Order from "../../../../app/models/Order";

export async function generateProductReport(start: Date, end: Date) {
  const orders = await Order.find({ placed_at: { $gte: start, $lte: end } }).lean();

  const productMap = new Map();
  orders.forEach((order) => {
    order.items.forEach((item: any) => {
      const key = item.product_id.toString();
      if (!productMap.has(key)) {
        productMap.set(key, {
          product_id: item.product_id,
          name: item.product_name,
          image: item.product_image,
          unitsSold: 0,
          revenue: 0,
          orders: 0,
        });
      }
      const prod = productMap.get(key);
      prod.unitsSold += item.quantity;
      prod.revenue += item.subtotal;
      prod.orders += 1;
    });
  });

  const products = Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);

  return {
    totalProducts: products.length,
    totalUnitsSold: products.reduce((sum, p) => sum + p.unitsSold, 0),
    totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
    products: products.slice(0, 50),
    topPerformers: products.slice(0, 10),
  };
}

