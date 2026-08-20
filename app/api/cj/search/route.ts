/**
 * GET /api/cj/search
 *
 * Search CJ Dropshipping products using the listV2 elasticsearch endpoint.
 *
 * Query params:
 *   keyword       - Search keyword
 *   page          - Page number (default: 1)
 *   pageSize      - Results per page (default: 20, max: 100)
 *   categoryId    - Filter by third-level category ID
 *   countryCode   - Filter by warehouse country (e.g. "US", "CN")
 *   minPrice      - Min price filter
 *   maxPrice      - Max price filter
 *   freeShipping  - "1" for free shipping only
 */

import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import { cjGet } from "../../../../lib/cj";

export async function GET(request: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decodedToken = await verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // ── Parse query params ────────────────────────────────────────────────────
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 100);
    const categoryId = searchParams.get("categoryId") || undefined;
    const countryCode = searchParams.get("countryCode") || undefined;
    const minPrice = searchParams.get("minPrice") || undefined;
    const maxPrice = searchParams.get("maxPrice") || undefined;
    const freeShipping = searchParams.get("freeShipping") === "1" ? 1 : undefined;

    if (!keyword) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    // ── Call CJ listV2 ────────────────────────────────────────────────────────
    const data = await cjGet("/product/listV2", {
      keyWord: keyword,
      page,
      size: pageSize,
      categoryId,
      countryCode,
      startSellPrice: minPrice,
      endSellPrice: maxPrice,
      addMarkStatus: freeShipping,
      sort: "desc",
      orderBy: 0, // best match
    });

    // data shape: { pageSize, pageNumber, totalRecords, totalPages, content: [{ productList, relatedCategoryList, keyWord }] }
    const content = data?.content?.[0] || {};
    const productList = content.productList || [];
    const relatedCategories = content.relatedCategoryList || [];

    return NextResponse.json({
      success: true,
      keyword,
      pagination: {
        page: data?.pageNumber || page,
        pageSize: data?.pageSize || pageSize,
        totalRecords: data?.totalRecords || 0,
        totalPages: data?.totalPages || 0,
      },
      products: productList.map((p: any) => ({
        pid: p.id,
        productSku: p.sku || p.spu,
        nameEn: p.nameEn,
        bigImage: p.bigImage,
        sellPrice: parseFloat(p.sellPrice) || 0,
        nowPrice: parseFloat(p.nowPrice || p.discountPrice || p.sellPrice) || 0,
        categoryId: p.categoryId,
        threeCategoryName: p.threeCategoryName,
        addMarkStatus: p.addMarkStatus, // 1 = free shipping
        listedNum: p.listedNum,
        warehouseInventoryNum: p.warehouseInventoryNum,
        verifiedWarehouse: p.verifiedWarehouse,
        isVideo: p.isVideo,
        productType: p.productType,
        createAt: p.createAt,
      })),
      relatedCategories,
    });
  } catch (error: any) {
    console.error("[CJ Search] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}