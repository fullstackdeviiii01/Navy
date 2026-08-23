// lib/utils/productImages.ts

/**
 * Resolves the best available image URL for a product, checking:
 * 1. Specific variant image if variantId provided
 * 2. Primary / first product image
 * 3. Any variant image
 * 4. Color option images
 */
export function getProductMainImage(product: any, variantId?: string): string | null {
  if (!product) return null;

  // 1. If variantId provided, check matching variant's image
  if (variantId && Array.isArray(product.variants)) {
    const matchingVariant = product.variants.find(
      (v: any) => (v._id?.toString?.() || v._id) === (variantId?.toString?.() || variantId)
    );
    if (matchingVariant?.imageUrl) {
      return matchingVariant.imageUrl;
    }
  }

  // 2. Direct product images
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find((img: any) => img.is_primary);
    if (primary?.url) return primary.url;
    if (product.images[0]?.url) return product.images[0].url;
  }

  // 3. First available variant image
  if (Array.isArray(product.variants)) {
    const firstVariantWithImg = product.variants.find((v: any) => v.imageUrl);
    if (firstVariantWithImg?.imageUrl) {
      return firstVariantWithImg.imageUrl;
    }
  }

  // 4. Color option images
  if (Array.isArray(product.variantOptions)) {
    for (const opt of product.variantOptions) {
      if (opt.colorImages && typeof opt.colorImages === "object") {
        const values = Object.values(opt.colorImages);
        for (const val of values) {
          if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
            return val[0];
          }
          if (typeof val === "string" && val.length > 0) {
            return val;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Resolves the image for a cart item or order line item.
 */
export function getItemImage(item: any): string | null {
  if (!item) return null;

  // Check direct snapshot (common on order items)
  if (item.product_image && typeof item.product_image === "string") {
    return item.product_image;
  }

  // Resolve from populated product_id object
  const product = item.product_id;
  if (product && typeof product === "object") {
    const variantId = item.variant_id?._id || item.variant_id;
    return getProductMainImage(product, variantId);
  }

  return null;
}
