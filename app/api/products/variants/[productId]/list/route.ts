// app/api/products/variants/[productId]/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../../../../lib/db";
import Product from "../../../../../models/Product";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    await connectDB();

    const product = await (Product as any).findById(productId).select(
      "hasVariants variants variantOptions variantPricing variantInventory"
    );

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (!product.hasVariants) {
      return NextResponse.json(
        { error: "Product does not have variants" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        variantOptions: product.getVariantOptions(),
        variants: product.variants,
        pricing: product.variantPricing,
        inventory: product.variantInventory,
        totalVariants: product.variants.length,
        availableVariants: product.getAvailableVariants().length,
      },
    });
  } catch (error) {
    console.error("Failed to fetch variants:", error);
    return NextResponse.json(
      { error: "Failed to fetch variants" },
      { status: 500 }
    );
  }
}