/**
 * GET /api/aliexpress/product?id=PRODUCT_ID
 *
 * Fetches and returns a TRANSFORMED preview of an AliExpress product
 * without saving it to the database.
 * Used by the import UI to show a preview before the admin confirms import.
 */

import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/firebase/auth";
import connectDB from "../../../../lib/db";
import User from "../../../models/User";
import Product from "../../../models/Product";
import { aliexpressRequest } from "../../../../lib/aliexpress";
import {
  transformAliexpressProduct,
  AliexpressApiResponse,
} from "../../../../lib/aliexpress/transformer";

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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    // Check if already imported
    const alreadyImported = await (Product as any).findOne({
      "aliexpress.productId": Number(productId),
    }).select("_id name");

    // Fetch raw data from AliExpress
    const rawData = await aliexpressRequest(
      "aliexpress.ds.product.get",
      {
        product_id: productId,
        ship_to_country: "PK",
        target_currency: "USD",
        target_language: "EN",
      }
    ) as AliexpressApiResponse;
    console.log("[AliExpress RAW]", JSON.stringify(rawData, null, 2));

    // Transform for preview
    const transformed = transformAliexpressProduct(rawData);

    return NextResponse.json({
      success: true,
      alreadyImported: alreadyImported
        ? {
            _id: alreadyImported._id,
            name: alreadyImported.name,
          }
        : null,
      data: transformed,
    });
  } catch (error: any) {
    console.error("[AliExpress Preview] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}