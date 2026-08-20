// app/api/products/variants/[productId]/update/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, getIdTokenFromHeader } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";
import { ProductVariant } from "../../../../../../types/product-variants";

interface UpdateVariantRequest {
  variantId: string;
  updates: Partial<ProductVariant>;
}

export async function PUT(
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
    const body: UpdateVariantRequest = await request.json();

    const product = await (Product as any).findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const variantIndex = product.variants.findIndex(
      (v: ProductVariant) => v._id?.toString() === body.variantId
    );

    if (variantIndex === -1) {
      return NextResponse.json(
        { error: "Variant not found" },
        { status: 404 }
      );
    }

    // Merge updates into the target variant
    product.variants[variantIndex] = {
      ...product.variants[variantIndex].toObject(),
      ...body.updates,
    };

    // Explicitly re-sync aggregated stock and pricing after the variant mutation
    await product.syncVariantData();

    product.updated_by = adminUser._id;
    await product.save();

    return NextResponse.json({
      success: true,
      message: "Variant updated successfully",
      data: {
        variant: product.variants[variantIndex],
        inventory: product.variantInventory,
      },
    });
  } catch (error: any) {
    console.error("Failed to update variant:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update variant" },
      { status: 500 }
    );
  }
}