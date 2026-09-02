// lib/utils/reports/services/salesReportService.ts
import Order from "../../../../app/models/Order";
import Product from "../../../../app/models/Product";
import { generateDailyBreakdown, groupOrdersByStatus, calculateGrowth } from "../aggregationUtils";

export async function generateSalesReport(
  start: Date,
  end: Date,
  prevStart: Date,
  prevEnd: Date
) {
  const [currentOrders, previousOrders] = await Promise.all([
    Order.find({
      placed_at: { $gte: start, $lte: end },
      status: { $nin: ["cancelled"] },
    }).lean(),
    Order.find({
      placed_at: { $gte: prevStart, $lt: prevEnd },
      status: { $nin: ["cancelled"] },
    }).lean(),
  ]);

  const currentRevenue = currentOrders.reduce(
    (sum, o) => sum + (o.pricing?.total || 0),
    0
  );
  const previousRevenue = previousOrders.reduce(
    (sum, o) => sum + (o.pricing?.total || 0),
    0
  );

  const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
  const ordersGrowth = calculateGrowth(currentOrders.length, previousOrders.length);

  const dailyData = generateDailyBreakdown(currentOrders, start, end);
  const topProducts = await extractTopProducts(currentOrders);

  return {
    summary: {
      totalRevenue: currentRevenue,
      totalOrders: currentOrders.length,
      averageOrderValue:
        currentOrders.length > 0 ? currentRevenue / currentOrders.length : 0,
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

async function extractTopProducts(orders: any[]) {
  const productSales = new Map();

  orders.forEach((order) => {
    (order.items || []).forEach((item: any) => {
      const key = item.product_id ? item.product_id.toString() : item.product_name;
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
      prod.quantity += item.quantity || 1;
      prod.revenue += item.subtotal || item.price * (item.quantity || 1);
    });
  });

  const rawList = Array.from(productSales.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 15);

  // Enrich with live product details if available
  return await Promise.all(
    rawList.map(async (p) => {
      let live = null;
      if (p.product_id) {
        try {
          live = await (Product as any).findById(p.product_id).select("name images").lean();
        } catch (_) {}
      }
      return {
        ...p,
        name: live?.name || p.name || "Wooden Lamp",
        image: live?.images?.[0]?.url || p.image || null,
        isDeleted: !live,
      };
    })
  );
}
