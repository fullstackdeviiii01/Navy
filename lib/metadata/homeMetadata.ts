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
    
    let product = null;
    const isExactObjectId = /^[0-9a-fA-F]{24}$/.test(productId);
    const endingIdMatch = productId.match(/-([0-9a-fA-F]{24})$/);
    const resolvedId = isExactObjectId ? productId : endingIdMatch ? endingIdMatch[1] : null;

    if (resolvedId) {
      product = await (Product as any)
        .findById(resolvedId)
        .select("name description seo images pricing category_id brand is_active")
        .populate("category_id", "name slug")
        .lean();
    }

    if (!product) {
      product = await (Product as any)
        .findOne({ slug: productId })
        .select("name description seo images pricing category_id brand is_active")
        .populate("category_id", "name slug")
        .lean();
    }

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The handcrafted wooden lamp you're looking for is unavailable.",
        product: null,
      };
    }

    const title = product.seo?.meta_title || `${product.name} | Handcrafted Solid Wood Lamp`;
    const description =
      product.seo?.meta_description ||
      (product.description
        ? `${product.description.replace(/<[^>]*>?/gm, "").substring(0, 155)}... Seasoned timber, warm ambient illumination with nationwide Pakistan delivery.`
        : `Handcrafted ${product.name} in solid hardwood by Talal Wooden Lamps. Free delivery across Pakistan.`);

    const mainImage = product.images?.[0]?.url || "/images/hero-atelier-lamp.jpg";

    return {
      title,
      description,
      product,
      image: mainImage,
    };
  } catch (error) {
    console.error("Error fetching product metadata:", error);
    return {
      title: "Handcrafted Wooden Lamp | Talal Wooden Lamps",
      description: "Artisanal solid wood lighting and ambient luminaires.",
      product: null,
      image: "/images/hero-atelier-lamp.jpg",
    };
  }
}

