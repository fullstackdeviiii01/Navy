// app/api/products/variants/[productId]/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyIdToken, getIdTokenFromHeader } from "../../../../../../lib/auth";
import connectDB from "../../../../../../lib/db";
import Product from "../../../../../models/Product";
import User from "../../../../../models/User";
import { ProductVariant } from "../../../../../../types/product-variants";
import { VariantAttribute } from "../../../../../../types/product-variants";
import { VariantOption } from "../../../../../../types/product-variants";

interface GenerateVariantsRequest {
  optionNames: string[];
  basePrice: number;
  baseSku: string;
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

    const adminUser = await (User as any).findOne({ uid: decodedToken.uid });
    if (!adminUser || adminUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { productId } = await params;
    const body: GenerateVariantsRequest = await request.json();

    const product = await (Product as any).findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Validate variant options exist
    const selectedOptions = product.variantOptions.filter((opt) =>
      body.optionNames.includes(opt.name)
    );

    if (selectedOptions.length === 0) {
      return NextResponse.json(
        { error: "No valid variant options selected" },
        { status: 400 }
      );
    }

    // Generate all combinations
    const combinations = generateVariantCombinations(selectedOptions);
    const newVariants: ProductVariant[] = combinations.map(
      (combo, index) => ({
        sku: `${body.baseSku}-V${String(index + 1).padStart(3, "0")}`,
        attributes: combo,
        price: body.basePrice,
        stockQuantity: 0,
        isAvailable: true,
        position: index,
      })
    );

    product.variants = newVariants;
    await product.syncVariantData();
    await product.save();

    return NextResponse.json({
      success: true,
      message: `Generated ${newVariants.length} variants`,
      data: {
        generatedCount: newVariants.length,
        variants: product.variants,
      },
    });
  } catch (error: any) {
    console.error("Failed to generate variants:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate variants" },
      { status: 500 }
    );
  }
}

function generateVariantCombinations(
  options: VariantOption[]
): VariantAttribute[][] {
  if (options.length === 0) return [[]];

  const [first, ...rest] = options;
  const restCombinations = generateVariantCombinations(rest);

  return first.values.flatMap((value) =>
    restCombinations.map((combo) => [
      { name: first.name, value },
      ...combo,
    ])
  );
}