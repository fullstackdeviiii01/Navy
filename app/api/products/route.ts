// app/api/products/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../lib/auth";
import connectDB from "../../../lib/db";
import Product from "../../models/Product";
import User from "../../models/User";
import Category from "../../models/Category";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const status = url.searchParams.get("status") || "active";
    const category = url.searchParams.get("category");
    const categorySlug = url.searchParams.get("categorySlug");
    const search = url.searchParams.get("search");
    const sortBy = url.searchParams.get("sortBy") || "created_at";
    const sortOrder = url.searchParams.get("sortOrder") || "desc";
    const inStock = url.searchParams.get("inStock") === "true";

    const query: any = {};

    if (status && status !== "all") {
      query.status = status;
    }

    // If category or categorySlug provided, find the category ID(s)
    const targetCat = categorySlug || category;
    if (targetCat) {
      const catList = targetCat.split(",").map((s) => s.trim()).filter(Boolean);
      if (catList.length === 1) {
        const single = catList[0];
        if (/^[0-9a-fA-F]{24}$/.test(single)) {
          query.category_id = single;
        } else {
          const catDoc = await (Category as any).findOne({
            $or: [
              { slug: single },
              { name: { $regex: `^${single.replace(/-/g, " ")}$`, $options: "i" } },
            ],
          });
          if (catDoc) {
            query.category_id = catDoc._id;
          }
        }
      } else if (catList.length > 1) {
        const catDocs = await (Category as any).find({
          $or: catList.map((item) =>
            /^[0-9a-fA-F]{24}$/.test(item)
              ? { _id: item }
              : { slug: item }
          ),
        });
        if (catDocs.length > 0) {
          query.category_id = { $in: catDocs.map((c: any) => c._id) };
        }
      }
    }

    // Direct product IDs filter (e.g. ?products=id1,id2)
    const productsParam = url.searchParams.get("products") || url.searchParams.get("productIds");
    if (productsParam) {
      const pIds = productsParam
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[0-9a-fA-F]{24}$/.test(s));
      if (pIds.length > 0) {
        query._id = { $in: pIds };
      }
    }

    // Coupon-based product filter (e.g. ?coupon=CANDLE500)
    const couponCode = url.searchParams.get("coupon");
    if (couponCode) {
      const CouponModel = (await import("../../models/Coupon")).default;
      const couponDoc = await (CouponModel as any).findOne({
        code: couponCode.toUpperCase(),
        is_active: true,
      });

      if (couponDoc) {
        if (couponDoc.applicable_to?.type !== "all") {
          const conditions: any[] = [];
          if (couponDoc.applicable_to?.product_ids?.length) {
            conditions.push({ _id: { $in: couponDoc.applicable_to.product_ids } });
          }
          if (couponDoc.applicable_to?.category_ids?.length) {
            conditions.push({ category_id: { $in: couponDoc.applicable_to.category_ids } });
          }
          if (conditions.length === 1) {
            Object.assign(query, conditions[0]);
          } else if (conditions.length > 1) {
            query.$or = conditions;
          }
        }
      }
    }

    // Stock filter
    if (inStock) {
      query["inventory.stock_quantity"] = { $gt: 0 };
      query["inventory.stock_status"] = { $ne: "out_of_stock" };
    }

    const titleOnly = url.searchParams.get("titleOnly") === "true";

    // Search filter
    if (search) {
      const cleanSearch = search.trim();
      if (titleOnly) {
        query.name = { $regex: cleanSearch, $options: "i" };
      } else {
        query.$or = [
          { name: { $regex: cleanSearch, $options: "i" } },
          { brand: { $regex: cleanSearch, $options: "i" } },
          { description: { $regex: cleanSearch, $options: "i" } },
        ];
      }
    }

    const skip = (page - 1) * limit;
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [products, total, totalCatalog, activeCount, draftCount, variableCount, lowStockCount] = await Promise.all([
      (Product as any)
        .find(query)
        .populate("category_id", "name slug")
        .populate("created_by", "name email")
        .select("+images +variantInventory +variantPricing")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
      Product.countDocuments({}),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "draft" }),
      Product.countDocuments({ hasVariants: true }),
      Product.countDocuments({ "inventory.stock_quantity": { $lte: 10 } }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        total: totalCatalog,
        active: activeCount,
        drafts: draftCount,
        variable: variableCount,
        lowStock: lowStockCount,
      },
    });
  } catch (error) {
    console.error("Products fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const adminUser = await (User as any).findOne({ email: decodedToken.email });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();

    // Generate slug from name if not provided
    if (!body.seo?.slug) {
      const slug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      if (!body.seo) body.seo = {};
      body.seo.slug = slug;
    }

    if (!body.shipping) {
      body.shipping = {
        requires_shipping: true,
        is_fragile: false,
        weight: 1,
        weight_unit: "kg",
      };
    }

    if (!body.pricing) {
      const prices = (body.variants || [])
        .map((v: any) => v.price)
        .filter((p: any) => typeof p === "number" && !isNaN(p));
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      body.pricing = { price: minPrice, currency: "PKR" };
    }

    if (!body.inventory) {
      const totalStock = (body.variants || []).reduce(
        (sum: number, v: any) => sum + (v.stockQuantity || 0),
        0
      );
      body.inventory = {
        stock_quantity: totalStock,
        low_stock_threshold: 10,
        stock_status: totalStock > 0 ? "in_stock" : "out_of_stock",
        track_inventory: true,
      };
    }

    // Set created_by
    body.created_by = adminUser._id;

    const product = new Product(body);
    await product.save();

    // Update category product count
    const category = await Category.findById(body.category_id);
    if (category) {
      await (category as any).updateProductCount();
    }

    return NextResponse.json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error: any) {
    console.error("Product creation failed:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Product with this title or slug already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to create product", details: error.errors },
      { status: 500 }
    );
  }
}