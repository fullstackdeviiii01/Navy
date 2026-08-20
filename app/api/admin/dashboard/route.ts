// app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import Order from "../../../models/Order";
import Product from "../../../models/Product";

export async function GET(request: NextRequest) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid }).lean();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "7d";

    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7d":  startDate.setDate(now.getDate() - 7); break;
      case "30d": startDate.setDate(now.getDate() - 30); break;
      case "90d": startDate.setDate(now.getDate() - 90); break;
      case "1y":  startDate.setFullYear(now.getFullYear() - 1); break;
    }

    const periodMs = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodMs);

    const [
      totalCustomers,
      activeProducts,
      currentPeriodAgg,
      previousPeriodAgg,
      salesData,
      topProducts,
      revenueByCategory,
      lowStockProducts,
      recentOrders,
      newCustomers,
      returningCustomers,
      clvAgg,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments({ status: "active" }),

      (Order as any).aggregate([
        { $match: { placed_at: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),

      (Order as any).aggregate([
        { $match: { placed_at: { $gte: previousStartDate, $lt: startDate } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),

      (Order as any).aggregate([
        { $match: { placed_at: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$placed_at" },
            },
            revenue: { $sum: "$pricing.total" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
      ]),

      (Order as any).aggregate([
        { $match: { placed_at: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $group: {
            _id:      "$items.product_id",
            name:     { $first: "$items.product_name" },
            image:    { $first: "$items.product_image" },
            revenue:  { $sum: "$items.subtotal" },
            quantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
        { $project: { _id: 1, name: 1, image: 1, revenue: 1, quantity: 1 } },
      ]),

      (Order as any).aggregate([
        { $match: { placed_at: { $gte: startDate } } },
        { $unwind: "$items" },
        {
          $lookup: {
            from:         "products",
            localField:   "items.product_id",
            foreignField: "_id",
            as:           "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from:         "categories",
            localField:   "product.category_id",
            foreignField: "_id",
            as:           "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id:     "$category.name",
            revenue: { $sum: "$items.subtotal" },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      // Low stock — handle simple and variant products separately
      (Product as any)
        .find({
          $or: [
            // Simple products: low or zero stock
            {
              hasVariants: false,
              $or: [
                { "inventory.stock_quantity": { $lte: 0 } },
                {
                  $expr: {
                    $lte: [
                      "$inventory.stock_quantity",
                      "$inventory.low_stock_threshold",
                    ],
                  },
                },
              ],
            },
            // Variant products: total stock across all variants is low
            {
              hasVariants: true,
              $or: [
                { "variantInventory.totalStock": { $lte: 10 } },
                { "variantInventory.totalStock": { $exists: false } },
              ],
            },
          ],
        })
        .sort({ "inventory.stock_quantity": 1 })
        .limit(10)
        .select(
          "name hasVariants inventory.stock_quantity inventory.low_stock_threshold variantInventory variants images"
        )
        .lean(),

      Order.find()
        .sort({ placed_at: -1 })
        .limit(10)
        .populate("user_id", "name email")
        .lean(),

      User.countDocuments({ created_at: { $gte: startDate } }),

      User.countDocuments({
        order_count:   { $gt: 1 },
        last_order_at: { $gte: startDate },
      }),

      (User as any).aggregate([
        { $match: { order_count: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: "$total_spent" } } },
      ]),
    ]);

    // ─── Derived values ───────────────────────────────────────────────────────
    const { totalRevenue = 0, totalOrders = 0 } = currentPeriodAgg[0] ?? {};
    const { totalRevenue: prevRevenue = 0, totalOrders: prevOrders = 0 } = previousPeriodAgg[0] ?? {};

    const revenueGrowth = prevRevenue > 0
      ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const ordersGrowth = prevOrders > 0
      ? ((totalOrders - prevOrders) / prevOrders) * 100 : 0;

    const averageOrderValue     = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const customerLifetimeValue = clvAgg[0]?.avg ?? 0;

    // Fill missing days with zeros
    const salesMap = new Map<string, { date: string; revenue: number; orders: number }>(
      salesData.map((d: any) => [d.date, d])
    );
    const filledSalesData: Array<{ date: string; revenue: number; orders: number }> = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= now) {
      const key = cursor.toISOString().split("T")[0];
      filledSalesData.push(
        salesMap.has(key) ? salesMap.get(key)! : { date: key, revenue: 0, orders: 0 }
      );
      cursor.setDate(cursor.getDate() + 1);
    }

    // Revenue by category
    const totalCategoryRevenue = revenueByCategory.reduce(
      (s: number, c: any) => s + c.revenue, 0
    );
    const formattedRevenueByCategory = revenueByCategory.map((c: any) => ({
      category:   c._id,
      revenue:    Math.round(c.revenue * 100) / 100,
      percentage: totalCategoryRevenue > 0
        ? (c.revenue / totalCategoryRevenue) * 100 : 0,
    }));

    // Low stock — correctly handle variant vs simple products
    const formattedLowStock = lowStockProducts.map((p: any) => {
      const isVariant = p.hasVariants;

      const totalStock = isVariant
        ? (p.variantInventory?.totalStock ?? 0)
        : (p.inventory?.stock_quantity ?? 0);

      // Find the out-of-stock or lowest-stock variant for display
      const lowVariant = isVariant && p.variants?.length > 0
        ? [...p.variants]
            .filter((v: any) => v.stockQuantity <= 5)
            .sort((a: any, b: any) => a.stockQuantity - b.stockQuantity)[0]
        : null;

      const lowVariantLabel = lowVariant
        ? lowVariant.attributes?.map((a: any) => a.value).join(" / ") || null
        : null;

      return {
        _id:       p._id,
        name:      p.name,
        stock:     totalStock,
        threshold: p.inventory?.low_stock_threshold ?? 10,
        image:     p.images?.[0]?.url || "",
        isVariant,
        lowVariantLabel,
      };
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        activeProducts,
        revenueGrowth,
        ordersGrowth,
        customersGrowth: 0,
        productsGrowth:  0,
      },
      salesData: filledSalesData,
      recentOrders,
      topProducts,
      customerMetrics: {
        newCustomers,
        returningCustomers,
        averageOrderValue,
        customerLifetimeValue,
      },
      revenueByCategory: formattedRevenueByCategory,
      lowStockProducts:  formattedLowStock,
    });
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}