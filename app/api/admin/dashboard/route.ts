// app/api/admin/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import Order from "../../../models/Order";
import Product from "../../../models/Product";
import Category from "../../../models/Category";

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

    const adminUser = await (User as any).findOne({ email: decodedToken.email }).lean();
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const url = new URL(request.url);
    const range = url.searchParams.get("range") || "30d";

    const now = new Date();
    let startDate = new Date();

    switch (range) {
      case "7d":  startDate.setDate(now.getDate() - 7); break;
      case "30d": startDate.setDate(now.getDate() - 30); break;
      case "90d": startDate.setDate(now.getDate() - 90); break;
      case "1y":  startDate.setFullYear(now.getFullYear() - 1); break;
      default:    startDate.setDate(now.getDate() - 30); break;
    }

    const periodMs = now.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodMs);

    // Strict revenue eligibility filter: Only completed/delivered or paid orders
    const completedRevenueFilter = {
      $and: [
        {
          $or: [
            { payment_status: "paid" },
            { status: "delivered" },
          ],
        },
        {
          status: { $nin: ["cancelled", "refunded"] },
        },
        {
          payment_status: { $nin: ["failed", "refunded"] },
        },
      ],
    };

    const [
      totalCustomers,
      activeProducts,
      currentPeriodRevenueAgg,
      previousPeriodRevenueAgg,
      currentPeriodOrdersCount,
      previousPeriodOrdersCount,
      salesDataAgg,
      topProductsAgg,
      categoryRevenueAgg,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments({ status: "active" }),

      // Total Revenue in current period (Strictly paid / delivered only)
      (Order as any).aggregate([
        {
          $match: {
            placed_at: { $gte: startDate },
            ...completedRevenueFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.total" },
          },
        },
      ]),

      // Total Revenue in previous period (Strictly paid / delivered only)
      (Order as any).aggregate([
        {
          $match: {
            placed_at: { $gte: previousStartDate, $lt: startDate },
            ...completedRevenueFilter,
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$pricing.total" },
          },
        },
      ]),

      // Total Orders in current period
      Order.countDocuments({
        placed_at: { $gte: startDate },
        status: { $nin: ["cancelled"] },
      }),

      // Total Orders in previous period
      Order.countDocuments({
        placed_at: { $gte: previousStartDate, $lt: startDate },
        status: { $nin: ["cancelled"] },
      }),

      // Daily Sales Chart Aggregation
      (Order as any).aggregate([
        {
          $match: {
            placed_at: { $gte: startDate },
            status: { $nin: ["cancelled"] },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$placed_at" },
            },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $or: [
                          { $eq: ["$payment_status", "paid"] },
                          { $eq: ["$status", "delivered"] },
                        ],
                      },
                      { $not: { $in: ["$status", ["cancelled", "refunded"]] } },
                      { $not: { $in: ["$payment_status", ["failed", "refunded"]] } },
                    ],
                  },
                  "$pricing.total",
                  0,
                ],
              },
            },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
      ]),

      // Top Selling Products Aggregation
      (Order as any).aggregate([
        {
          $match: {
            status: { $nin: ["cancelled"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product_id",
            name: { $first: "$items.product_name" },
            image: { $first: "$items.product_image" },
            revenue: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $or: [
                          { $eq: ["$payment_status", "paid"] },
                          { $eq: ["$status", "delivered"] },
                        ],
                      },
                    ],
                  },
                  "$items.subtotal",
                  "$items.subtotal",
                ],
              },
            },
            quantity: { $sum: "$items.quantity" },
          },
        },
        { $sort: { quantity: -1, revenue: -1 } },
        { $limit: 10 },
        { $project: { _id: 1, name: 1, image: 1, revenue: 1, quantity: 1 } },
      ]),

      // Category Revenue Aggregation
      (Order as any).aggregate([
        {
          $match: {
            status: { $nin: ["cancelled"] },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "categories",
            localField: "product.category_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: { $ifNull: ["$category.name", "Table & Floor Lamps"] },
            revenue: { $sum: "$items.subtotal" },
          },
        },
        { $sort: { revenue: -1 } },
      ]),

      // Low stock products
      (Product as any)
        .find({
          status: "active",
          $or: [
            {
              hasVariants: false,
              $or: [
                { "inventory.stock_quantity": { $lte: 10 } },
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

      // Recent Orders Feed
      Order.find()
        .sort({ placed_at: -1 })
        .limit(10)
        .populate("user_id", "name email")
        .lean(),
    ]);

    // Calculate totals & growth
    const totalRevenue = currentPeriodRevenueAgg[0]?.totalRevenue || 0;
    const prevRevenue = previousPeriodRevenueAgg[0]?.totalRevenue || 0;

    const totalOrders = currentPeriodOrdersCount || 0;
    const prevOrders = previousPeriodOrdersCount || 0;

    const revenueGrowth =
      prevRevenue > 0
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100 * 10) / 10
        : 0;

    const ordersGrowth =
      prevOrders > 0
        ? Math.round(((totalOrders - prevOrders) / prevOrders) * 100 * 10) / 10
        : 0;

    // Fill missing days in sales chart with zero values
    const salesMap = new Map<string, { date: string; revenue: number; orders: number }>(
      salesDataAgg.map((d: any) => [d.date, d])
    );
    const filledSalesData: Array<{ date: string; revenue: number; orders: number }> = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    while (cursor <= now) {
      const key = cursor.toISOString().split("T")[0];
      filledSalesData.push(
        salesMap.has(key)
          ? salesMap.get(key)!
          : { date: key, revenue: 0, orders: 0 }
      );
      cursor.setDate(cursor.getDate() + 1);
    }

    // Format revenue by category
    const totalCategoryRevenue = categoryRevenueAgg.reduce(
      (s: number, c: any) => s + (c.revenue || 0),
      0
    );

    const formattedRevenueByCategory = categoryRevenueAgg.map((c: any) => ({
      category: c._id || "Handcrafted Lighting",
      revenue: Math.round((c.revenue || 0) * 100) / 100,
      percentage:
        totalCategoryRevenue > 0
          ? Math.round(((c.revenue || 0) / totalCategoryRevenue) * 100 * 10) / 10
          : 0,
    }));

    // Format low stock
    const formattedLowStock = lowStockProducts.map((p: any) => {
      const isVariant = p.hasVariants;
      const totalStock = isVariant
        ? p.variantInventory?.totalStock ?? 0
        : p.inventory?.stock_quantity ?? 0;

      const lowVariant =
        isVariant && p.variants?.length > 0
          ? [...p.variants]
              .filter((v: any) => (v.stockQuantity ?? 0) <= 5)
              .sort((a: any, b: any) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0))[0]
          : null;

      const lowVariantLabel = lowVariant
        ? lowVariant.attributes?.map((a: any) => a.value).join(" / ") || null
        : null;

      return {
        _id: p._id,
        name: p.name,
        stock: totalStock,
        threshold: p.inventory?.low_stock_threshold ?? 10,
        image: p.images?.[0]?.url || "",
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
        productsGrowth: 0,
      },
      salesData: filledSalesData,
      salesChart: filledSalesData,
      recentOrders,
      topProducts: topProductsAgg,
      revenueByCategory: formattedRevenueByCategory,
      lowStockProducts: formattedLowStock,
    });
  } catch (error) {
    console.error("Dashboard fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}