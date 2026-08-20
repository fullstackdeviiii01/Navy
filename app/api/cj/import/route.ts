/**
 * POST /api/cj/import
 *
 * Full CJ Dropshipping import pipeline.
 * Mirrors POST /api/aliexpress/import exactly.
 *
 * Steps:
 * 1. Validate admin auth
 * 2. Fetch product detail from CJ API (with inventory)
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
import { cjGet } from "../../../../lib/cj";
import {
  transformCJProduct,
  toMongoProductPayload,
  CJProductDetail }
  from "../../../../lib/cj/transformer"
import {
  downloadProductImages,
  downloadVariantImages,
  downloadAndSaveImage,
} from "../../../../lib/cj/imageDownloader";

interface ImportRequestBody {
  productId: string;       // CJ pid (UUID) or productSku
  categoryId: string;      // MongoDB Category _id
  markupPercent?: number;  // e.g. 30 for 30%
  downloadImages?: boolean; // Default: true
}

/**
 * Find all <img src="..."> in description HTML, download each image locally,
 * and replace the src with the local path.
 */
async function localiseDescriptionImages(
  description: string,
  productId: string
): Promise<string> {
  if (!description) return description;

  const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const matches = [...description.matchAll(imgRegex)];

  if (matches.length === 0) return description;

  console.log(`[CJ Import] Localising ${matches.length} description images...`);

  let localised = description;

  for (let i = 0; i < matches.length; i++) {
    const originalUrl = matches[i][1];
    // Skip already-local URLs
    if (originalUrl.startsWith("/") || originalUrl.startsWith("data:")) continue;

    try {
      const result = await downloadAndSaveImage(originalUrl, `${productId}_desc`, i);
      if (result.success) {
        localised = localised.replace(originalUrl, result.url);
        console.log(`[CJ Import] ✓ Description image ${i + 1} localised`);
      } else {
        console.warn(`[CJ Import] ✗ Description image ${i + 1} failed, keeping original`);
      }
    } catch (err: any) {
      console.warn(`[CJ Import] ✗ Description image ${i + 1} error: ${err.message}`);
      // Leave original URL — don't break the import
    }
  }

  return localised;
}

export async function POST(request: NextRequest) {
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

    // ── Parse request ─────────────────────────────────────────────────────────
    const body: ImportRequestBody = await request.json();
    const {
      productId,
      categoryId,
      markupPercent = 0,
      downloadImages = true,
    } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }
    if (!categoryId) {
      return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
    }

    // ── Validate category ─────────────────────────────────────────────────────
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: `Category not found: ${categoryId}` },
        { status: 400 }
      );
    }

    // ── Check for duplicate import ────────────────────────────────────────────
    const existing = await (Product as any).findOne({
      $or: [{ "cj.productId": productId }, { "cj.productSku": productId }],
    });
    if (existing) {
      return NextResponse.json(
        { error: "Product already imported", existingProductId: existing._id },
        { status: 409 }
      );
    }

    // ── Fetch from CJ API ─────────────────────────────────────────────────────
    console.log(`[CJ Import] Fetching product ${productId}...`);
    const isUUID = /^[0-9a-fA-F-]{36}$/.test(productId);

    const rawData: CJProductDetail = await cjGet("/product/query", {
      ...(isUUID ? { pid: productId } : { productSku: productId }),
      features: "enable_inventory",
    });

    // ── Transform ─────────────────────────────────────────────────────────────
    let transformed;
    try {
      transformed = transformCJProduct(rawData);
    } catch (err: any) {
      return NextResponse.json(
        { error: `Transform failed: ${err.message}` },
        { status: 422 }
      );
    }

    // ── Download images ───────────────────────────────────────────────────────
    let finalImages = transformed.images;
    let variantImageUrlMap = new Map<string, string>();

    if (downloadImages && transformed.images.length > 0) {
      console.log(`[CJ Import] Downloading ${transformed.images.length} images...`);

      const downloadedImages = await downloadProductImages(
        transformed.images.map((img) => img.url),
        transformed.cjProductId
      );
      finalImages = downloadedImages;

      // Download unique variant swatch images
      const swatchUrls = transformed.variants
        .map((v) => v.imageUrl)
        .filter(Boolean) as string[];

      if (swatchUrls.length > 0) {
        console.log(`[CJ Import] Downloading ${swatchUrls.length} variant swatch images...`);
        variantImageUrlMap = await downloadVariantImages(swatchUrls, transformed.cjProductId);
      }

      // ── Localise description images ────────────────────────────────────────
      transformed.description = await localiseDescriptionImages(
        transformed.description,
        transformed.cjProductId
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
    console.log(`[CJ Import] Saving product to database...`);
    const product = new Product(payload);
    await product.save();

    // Update category product count
    await (category as any).updateProductCount();

    console.log(
      `[CJ Import] ✓ Product ${transformed.cjProductId} imported as ${product._id}`
    );

    return NextResponse.json({
      success: true,
      message: "Product imported successfully",
      product: {
        _id: product._id,
        name: product.name,
        cjProductId: transformed.cjProductId,
        cjProductSku: transformed.cjProductSku,
        variantCount: transformed.variants.length,
        imageCount: finalImages.length,
      },
    });
  } catch (error: any) {
    console.error("[CJ Import] Failed:", error);
    return NextResponse.json(
      { error: error.message || "Import failed" },
      { status: 500 }
    );
  }
}