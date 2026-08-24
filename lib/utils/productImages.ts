// lib/utils/productImages.ts

export function extractImageUrl(img: any): string | null {
  if (!img) return null;
  if (typeof img === "string" && img.trim().length > 0) return img.trim();
  if (typeof img === "object") {
    if (typeof img.url === "string" && img.url.trim().length > 0) return img.url.trim();
    if (typeof img.src === "string" && img.src.trim().length > 0) return img.src.trim();
    if (typeof img.path === "string" && img.path.trim().length > 0) return img.path.trim();
  }
  return null;
}

/**
 * Resolves the best available image URL for a product, checking:
 * 1. Specific variant image if variantId provided
 * 2. Specific variant image matching variantAttributes
 * 3. Color/finish option images matching any variant attribute value
 * 4. Primary / first product image
 * 5. Any variant image
 * 6. Any color/finish option image
 */
export function getProductMainImage(
  product: any,
  variantId?: string | { _id?: string } | any,
  variantAttributes?: Record<string, string> | Map<string, string> | any
): string | null {
  if (!product) return null;

  // Normalize variantId string
  const targetVarId =
    typeof variantId === "object" && variantId !== null
      ? (variantId._id?.toString?.() || String(variantId._id || variantId))
      : variantId
      ? variantId.toString()
      : null;

  // Normalize variantAttributes if provided
  const attrObj: Record<string, string> = {};
  if (variantAttributes) {
    if (variantAttributes instanceof Map) {
      variantAttributes.forEach((v, k) => {
        if (typeof v === "string" && v.trim()) attrObj[k.toLowerCase()] = v.trim();
      });
    } else if (typeof variantAttributes === "object") {
      Object.entries(variantAttributes).forEach(([k, v]) => {
        if (typeof v === "string" && v.trim()) attrObj[k.toLowerCase()] = v.trim();
      });
    }
  }

  // 1. If variantId provided, check matching variant's image
  if (targetVarId && Array.isArray(product.variants)) {
    const matchingVariant = product.variants.find(
      (v: any) => (v._id?.toString?.() || String(v._id || "")) === targetVarId
    );
    const varImg = extractImageUrl(matchingVariant?.imageUrl || matchingVariant?.image);
    if (varImg) return varImg;
  }

  // 2. If variantAttributes provided, find matching variant
  if (Object.keys(attrObj).length > 0 && Array.isArray(product.variants)) {
    const matchedByAttrs = product.variants.find((v: any) => {
      if (!v.attributes || !Array.isArray(v.attributes)) return false;
      return v.attributes.every(
        (a: any) =>
          attrObj[a.name?.toLowerCase()] &&
          attrObj[a.name?.toLowerCase()].toLowerCase() === a.value?.toLowerCase()
      );
    });
    if (matchedByAttrs) {
      const varImg = extractImageUrl(matchedByAttrs.imageUrl || matchedByAttrs.image);
      if (varImg) return varImg;
    }
  }

  // 3. Check colorImages for any matching attribute value across all variantOptions
  const attrValues = Object.values(attrObj).map((v) => v.toLowerCase());
  if (Array.isArray(product.variantOptions)) {
    for (const opt of product.variantOptions) {
      if (opt.colorImages) {
        let colorMap = opt.colorImages;
        if (colorMap instanceof Map) {
          colorMap = Object.fromEntries(colorMap);
        }
        if (typeof colorMap === "object" && colorMap !== null) {
          // Check if any key matches any selected attribute value
          for (const [key, val] of Object.entries(colorMap)) {
            const keyLower = key.toLowerCase();
            const isMatch =
              attrValues.includes(keyLower) ||
              Object.keys(attrObj).some((k) => attrObj[k].toLowerCase() === keyLower);

            if (isMatch) {
              if (Array.isArray(val) && val.length > 0) {
                const url = extractImageUrl(val[0]);
                if (url) return url;
              }
              const url = extractImageUrl(val);
              if (url) return url;
            }
          }
        }
      }
    }
  }

  // 4. Direct product images (primary first, then first available)
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find(
      (img: any) => img && (img.is_primary === true || img.isPrimary === true)
    );
    const primaryUrl = extractImageUrl(primary);
    if (primaryUrl) return primaryUrl;

    for (const img of product.images) {
      const url = extractImageUrl(img);
      if (url) return url;
    }
  }

  // 5. First available variant image
  if (Array.isArray(product.variants)) {
    for (const v of product.variants) {
      const url = extractImageUrl(v?.imageUrl || v?.image);
      if (url) return url;
    }
  }

  // 6. Color option images (any first available from any option)
  if (Array.isArray(product.variantOptions)) {
    for (const opt of product.variantOptions) {
      if (opt.colorImages) {
        let colorMap = opt.colorImages;
        if (colorMap instanceof Map) {
          colorMap = Object.fromEntries(colorMap);
        }
        if (typeof colorMap === "object" && colorMap !== null) {
          for (const val of Object.values(colorMap)) {
            if (Array.isArray(val) && val.length > 0) {
              const url = extractImageUrl(val[0]);
              if (url) return url;
            }
            const url = extractImageUrl(val);
            if (url) return url;
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

  // Check direct snapshot (on cart items and order items)
  const directImg = extractImageUrl(
    item.product_image || item.image_url || item.image || item.imageUrl
  );
  if (directImg) return directImg;

  // Resolve from populated product_id object
  const product = item.product_id;
  if (product && typeof product === "object") {
    const variantId = item.variant_id?._id || item.variant_id;
    return getProductMainImage(product, variantId, item.variant_attributes);
  }

  return null;
}
