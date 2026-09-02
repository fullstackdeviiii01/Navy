// lib/utils/reports/services/productReportService.ts
import Order from "../../../../app/models/Order";
import Product from "../../../../app/models/Product";
import Category from "../../../../app/models/Category";

export async function generateProductReport(start: Date, end: Date) {
  const orders = await Order.find({
    placed_at: { $gte: start, $lte: end },
    status: { $nin: ["cancelled"] },
  }).lean();

  const productMap = new Map();

  orders.forEach((order) => {
    (order.items || []).forEach((item: any) => {
      const key = item.product_id ? item.product_id.toString() : item.product_name;
      if (!productMap.has(key)) {
        productMap.set(key, {
          product_id: item.product_id,
          name: item.product_name,
          image: item.product_image,
          unitsSold: 0,
          quantity: 0,
          revenue: 0,
          orders: 0,
        });
      }
      const prod = productMap.get(key);
      const qty = item.quantity || 1;
      const sub = item.subtotal || item.price * qty;
      prod.unitsSold += qty;
      prod.quantity += qty;
      prod.revenue += sub;
      prod.orders += 1;
    });
  });

  const rawProducts = Array.from(productMap.values()).sort(
    (a, b) => b.revenue - a.revenue
  );

  // Enrich with category & live product details
  const enrichedProducts = await Promise.all(
    rawProducts.map(async (p) => {
      let live: any = null;
      let categoryName = "Table & Floor Lamps";
      if (p.product_id) {
        try {
          live = await (Product as any)
            .findById(p.product_id)
            .populate("category_id", "name")
            .select("name images category_id sku")
            .lean();
          if (live?.category_id?.name) {
            categoryName = live.category_id.name;
          }
        } catch (_) {}
      }

      return {
        ...p,
        name: live?.name || p.name || "Wooden Lamp",
        image: live?.images?.[0]?.url || p.image || null,
        category: categoryName,
        sku: live?.sku || null,
        isDeleted: !live,
      };
    })
  );

  const totalUnits = enrichedProducts.reduce((sum, p) => sum + p.unitsSold, 0);
  const totalRev = enrichedProducts.reduce((sum, p) => sum + p.revenue, 0);

  return {
    totalProducts: enrichedProducts.length,
    totalUnitsSold: totalUnits,
    totalRevenue: totalRev,
    products: enrichedProducts.slice(0, 50),
    topPerformers: enrichedProducts.slice(0, 10),
  };
}
