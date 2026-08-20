// app/api/products/variants/[productId]/configure/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, getIdTokenFromHeader } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";

interface ConfigureVariantsRequest {
  hasVariants: boolean;
  variantOptions?: any[];
  variants?: any[];
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const token = getIdTokenFromHeader(request);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    const { productId } = await params;
    const body: ConfigureVariantsRequest = await request.json();

    const product = await (Product as any).findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update hasVariants flag
    product.hasVariants = body.hasVariants;

    if (body.hasVariants) {
      // If enabling variants, set options and variants
      product.variantOptions = body.variantOptions || [];
      product.variants = body.variants || [];

      // Explicitly sync aggregated stock and pricing before save
      await product.syncVariantData();
    } else {
      // If disabling, clear all variant data
      product.variantOptions = [];
      product.variants = [];
      product.variantPricing = undefined;
      product.variantInventory = undefined;
    }

    product.updated_by = adminUser._id;
    await product.save();

    return NextResponse.json({
      success: true,
      message: body.hasVariants ? "Variants enabled" : "Variants disabled",
      data: {
        hasVariants: product.hasVariants,
        variantOptions: product.variantOptions,
        variants: product.variants,
        pricing: product.variantPricing,
        inventory: product.variantInventory,
      },
    });
  } catch (error: any) {
    console.error("Failed to configure variants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to configure variants" },
      { status: 500 }
    );
  }
}