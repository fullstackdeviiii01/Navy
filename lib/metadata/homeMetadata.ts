// lib/metadata/homeMetadata.ts
export async function checkPageVisibility(_pageKey: string): Promise<boolean> {
  return true;
}

// lib/metadata/productMetadata.ts
import connectDB from "../db";
import Product from "../../app/models/Product";

export async function getProductMetadata(productId: string) {
  try {
    await connectDB();
    
    const product = await (Product as any)
      .findById(productId)
      .select("name description seo")
      .lean();

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The product you're looking for doesn't exist.",
      };
    }

    return {
      title: product.seo?.meta_title || product.name,
      description: product.seo?.meta_description || product.description?.substring(0, 160),
    };
  } catch (error) {
    console.error("Error fetching product metadata:", error);
    return {
      title: "Product",
      description: "View product details",
    };
  }
}
