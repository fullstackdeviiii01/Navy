// app/api/products/variants/[productId]/sync/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, getIdTokenFromHeader } from "../../../../../../lib/firebase/auth";
import connectDB from "../../../../../../lib/db";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";

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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { productId } = await params;
    const product = await (Product as any).findById(productId);

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

    await product.syncVariantData();
    await product.save();

    return NextResponse.json({
      success: true,
      message: "Variant data synced successfully",
      data: {
        pricing: product.variantPricing,
        inventory: product.variantInventory,
      },
    });
  } catch (error: any) {
    console.error("Failed to sync variants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync variants" },
      { status: 500 }
    );
  }
}