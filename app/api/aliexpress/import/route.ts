/**
 * POST /api/aliexpress/import
 *
 * Full import pipeline:
 * 1. Accept AliExpress product ID + category + markup
 * 2. Fetch product data from AliExpress API
 * 3. Transform into internal schema
 * 4. Download & localise all images (including description HTML images)
 * 5. Save to MongoDB
 * 6. Return created product
 */

import { NextRequest, NextResponse } from "next/server";
import { getIdTokenFromHeader, verifyIdToken } from "../../../../lib/auth";
import connectDB from "../../../../lib/db";
import Product from "../../../models/Product";
import Category from "../../../models/Category";
import User from "../../../models/User";
import { aliexpressRequest } from "../../../../lib/aliexpress";
import {
  transformAliexpressProduct,
  toMongoProductPayload,
  AliexpressApiResponse,
} from "../../../../lib/aliexpress/transformer";
import {
  downloadProductImages,
  downloadVariantImages,
  downloadAndSaveImage,
} from "../../../../lib/aliexpress/imageDownloader";

interface ImportRequestBody {
  productId: string | number;
  categoryId: string;
  markupPercent?: number;
  downloadImages?: boolean;
}

/**
 * Find all <img src="..."> in description HTML, download each image locally,
 * and replace the src with the local path.
 */
async function localiseDescriptionImages(
  description: string,
  productId: string | number
): Promise<string> {
  if (!description) return description;

  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const matches = [...description.matchAll(imgRegex)];

  if (matches.length === 0) return description;

  console.log(`[AliExpress Import] Localising ${matches.length} description images...`);

  let localised = description;

  for (let i = 0; i < matches.length; i++) {
    const originalUrl = matches[i][1];
    // Skip already-local URLs
    if (originalUrl.startsWith("/") || originalUrl.startsWith("data:")) continue;

    try {
      const result = await downloadAndSaveImage(originalUrl, `${productId}_desc`, i);
      if (result.success) {
        localised = localised.replace(originalUrl, result.url);
        console.log(`[AliExpress Import] ✓ Description image ${i + 1} localised`);
      } else {
        console.warn(`[AliExpress Import] ✗ Description image ${i + 1} failed, keeping original`);
      }
    } catch (err: any) {
      console.warn(`[AliExpress Import] ✗ Description image ${i + 1} error: ${err.message}`);
      // Leave original URL — don't break the import
    }
  }

  return localised;
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ────────────────────────────────────────────────────────────────
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

    // ── Parse request ────────────────────────────────────────────────────────
    const body: ImportRequestBody = await request.json();
    const {
      productId,
      categoryId,
      markupPercent = 0,
      downloadImages = true,
    } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }
    if (!categoryId) {
      return NextResponse.json(
        { error: "categoryId is required" },
        { status: 400 }
      );
    }

    // ── Validate category ────────────────────────────────────────────────────
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: `Category not found: ${categoryId}` },
        { status: 400 }
      );
    }

    // ── Check for duplicate import ───────────────────────────────────────────
    const existing = await (Product as any).findOne({
      "aliexpress.productId": Number(productId),
    });
    if (existing) {
      return NextResponse.json(
        {
          error: `Product already imported`,
          existingProductId: existing._id,
        },
        { status: 409 }
      );
    }

    // ── Fetch from AliExpress API ─────────────────────────────────────────────
    console.log(`[AliExpress Import] Fetching product ${productId}...`);
    const rawData = await aliexpressRequest(
      "aliexpress.ds.product.get",
      {
        product_id: String(productId),
        ship_to_country: "PK",
        target_currency: "USD",
        target_language: "EN",
      }
    ) as AliexpressApiResponse;

    // ── Transform ─────────────────────────────────────────────────────────────
    let transformed;
    try {
      transformed = transformAliexpressProduct(rawData);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Transform failed: ${err.message}` },
        { status: 422 }
      );
    }

    // ── Download images ───────────────────────────────────────────────────────
    let finalImages = transformed.images;
    let variantImageUrlMap = new Map<string, string>();

    if (downloadImages) {
      console.log(
        `[AliExpress Import] Downloading ${transformed.images.length} product images...`
      );

      const downloadedImages = await downloadProductImages(
        transformed.images.map((img) => img.url),
        transformed.aliexpressProductId
      );
      finalImages = downloadedImages;

      // Download unique variant swatch images
      const swatchUrls = transformed.variants
        .map((v) => v.imageUrl)
        .filter(Boolean) as string[];

      if (swatchUrls.length > 0) {
        console.log(
          `[AliExpress Import] Downloading ${swatchUrls.length} variant swatch images...`
        );
        variantImageUrlMap = await downloadVariantImages(
          swatchUrls,
          transformed.aliexpressProductId
        );
      }

      // ── Localise description images ────────────────────────────────────────
      transformed.description = await localiseDescriptionImages(
        transformed.description,
        transformed.aliexpressProductId
      );
    }

    // ── Build MongoDB payload ─────────────────────────────────────────────────
    const payload = toMongoProductPayload(
      transformed,
      categoryId,
      adminUser._id.toString(),
      markupPercent
    );

    // Swap in localised images
    payload.images = finalImages;

    // Swap in localised variant swatch URLs
    if (variantImageUrlMap.size > 0) {
      payload.variants = payload.variants.map((v: any) => ({
        ...v,
        imageUrl: v.imageUrl
          ? (variantImageUrlMap.get(v.imageUrl) ?? v.imageUrl)
          : undefined,
      }));
    }

    // ── Save to MongoDB ───────────────────────────────────────────────────────
    console.log(`[AliExpress Import] Saving product to database...`);
    const product = new Product(payload);
    await product.save();

    // Update category product count
    await (category as any).updateProductCount();

    console.log(
      `[AliExpress Import] ✓ Product ${transformed.aliexpressProductId} imported as ${product._id}`
    );

    return NextResponse.json({
      success: true,
      message: "Product imported successfully",
      product: {
        _id: product._id,
        name: product.name,
        aliexpressProductId: transformed.aliexpressProductId,
        variantCount: transformed.variants.length,
        imageCount: finalImages.length,
      },
    });
  } catch (error: any) {
    console.error("[AliExpress Import] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Import failed" },
      { status: 500 }
    );
  }
}