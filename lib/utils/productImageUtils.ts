// lib/utils/productImageUtils.ts

export interface ProductMediaItem {
  type: "image" | "video";
  url: string;
  alt_text?: string;
  thumbnail?: string;
  is_primary?: boolean;
  source?: "general" | "color" | "variant" | "video";
  colorName?: string;
}

/**
 * Extracts a normalized map of color finish images from variantOptions
 */
export function getColorImagesMap(variantOptions?: any[]): Record<string, string[]> {
  if (!variantOptions || !Array.isArray(variantOptions)) return {};

  const colorOpt = variantOptions.find(
    (opt: any) =>
      opt?.name === "color" ||
      opt?.displayName?.toLowerCase() === "color" ||
      opt?.name?.toLowerCase() === "colour"
  );

  if (!colorOpt || !colorOpt.colorImages) return {};

  const result: Record<string, string[]> = {};
  const raw = colorOpt.colorImages;

  if (typeof raw.get === "function") {
    if (colorOpt.values && Array.isArray(colorOpt.values)) {
      colorOpt.values.forEach((val: string) => {
        const imgs = raw.get(val);
        if (Array.isArray(imgs)) {
          result[val] = imgs.filter((u) => typeof u === "string" && u.trim().length > 0);
        }
      });
    }
  } else if (typeof raw === "object" && raw !== null) {
    Object.entries(raw).forEach(([colorName, imgs]) => {
      if (Array.isArray(imgs)) {
        result[colorName] = (imgs as any[]).filter(
          (u) => typeof u === "string" && u.trim().length > 0
        );
      } else if (typeof imgs === "string" && (imgs as string).trim().length > 0) {
        result[colorName] = [imgs];
      }
    });
  }

  return result;
}

/**
 * Returns the primary display image URL for a product, checking:
 * 1. Primary image in product.images (or first image in product.images)
 * 2. Color section images (first available finish image)
 * 3. Variant images (first variant with imageUrl)
 * 4. Fallback placeholder
 */
export function getPrimaryProductImage(
  product: any,
  fallback = "https://placehold.co/400x400?text=No+Photo"
): string {
  if (!product) return fallback;

  // 1. General product images
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find((img: any) => img?.is_primary && img?.url);
    if (primary?.url) return primary.url;

    const first = product.images[0];
    if (typeof first === "string" && first.trim()) return first;
    if (first?.url && typeof first.url === "string" && first.url.trim()) return first.url;
  }

  // 2. Color option images
  const colorMap = getColorImagesMap(product.variantOptions);
  for (const key of Object.keys(colorMap)) {
    const imgs = colorMap[key];
    if (imgs && imgs.length > 0 && imgs[0]) {
      return imgs[0];
    }
  }

  // 3. Variant images
  if (product.variants && Array.isArray(product.variants)) {
    const varWithImg = product.variants.find((v: any) => v?.imageUrl && typeof v.imageUrl === "string");
    if (varWithImg?.imageUrl) return varWithImg.imageUrl;
  }

  // 4. Fallback
  return fallback;
}

/**
 * Aggregates all images for a product (general + color finishes + variants) deduplicated by URL
 */
export function getAllProductImages(
  product: any
): Array<{
  url: string;
  alt_text?: string;
  is_primary?: boolean;
  source: "general" | "color" | "variant";
  colorName?: string;
}> {
  if (!product) return [];

  const items: Array<{
    url: string;
    alt_text?: string;
    is_primary?: boolean;
    source: "general" | "color" | "variant";
    colorName?: string;
  }> = [];
  const seenUrls = new Set<string>();

  // 1. General product images
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      const url = typeof img === "string" ? img : img?.url;
      if (url && typeof url === "string" && !seenUrls.has(url)) {
        seenUrls.add(url);
        items.push({
          url,
          alt_text: img?.alt_text || product.name || "Product image",
          is_primary: Boolean(img?.is_primary),
          source: "general",
        });
      }
    });
  }

  // 2. Color section images
  const colorMap = getColorImagesMap(product.variantOptions);
  Object.entries(colorMap).forEach(([colorName, urls]) => {
    urls.forEach((url) => {
      if (url && typeof url === "string" && !seenUrls.has(url)) {
        seenUrls.add(url);
        items.push({
          url,
          alt_text: `${product.name || "Product"} - ${colorName} finish`,
          is_primary: items.length === 0,
          source: "color",
          colorName,
        });
      }
    });
  });

  // 3. Individual variant images
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v: any) => {
      if (v?.imageUrl && typeof v.imageUrl === "string" && !seenUrls.has(v.imageUrl)) {
        seenUrls.add(v.imageUrl);
        const colorAttr = v.attributes?.find((a: any) => a?.name === "color")?.value;
        items.push({
          url: v.imageUrl,
          alt_text: `${product.name || "Product"} variant`,
          is_primary: items.length === 0,
          source: "variant",
          colorName: colorAttr,
        });
      }
    });
  }

  return items;
}

/**
 * Aggregates all media (images and videos) for a product (matching storefront carousel logic)
 */
export function getAllProductMedia(
  product: any,
  activePreviewUrl?: string
): ProductMediaItem[] {
  if (!product) return [];

  const mediaItems: ProductMediaItem[] = [];
  const seenUrls = new Set<string>();

  // 1. Active selected variant / preview image
  if (activePreviewUrl && typeof activePreviewUrl === "string") {
    mediaItems.push({
      type: "image",
      url: activePreviewUrl,
      alt_text: `${product.name || "Product"} selected finish`,
      source: "color",
    });
    seenUrls.add(activePreviewUrl);
  }

  // 2. Top-level general images
  if (product.images && Array.isArray(product.images)) {
    product.images.forEach((img: any) => {
      const url = typeof img === "string" ? img : img?.url;
      if (url && typeof url === "string" && !seenUrls.has(url)) {
        seenUrls.add(url);
        mediaItems.push({
          type: "image",
          url,
          alt_text: img?.alt_text || `${product.name || "Product"} photo`,
          is_primary: Boolean(img?.is_primary),
          source: "general",
        });
      }
    });
  }

  // 3. Color finish photos
  const colorMap = getColorImagesMap(product.variantOptions);
  Object.entries(colorMap).forEach(([colorName, urls]) => {
    urls.forEach((url) => {
      if (url && typeof url === "string" && !seenUrls.has(url)) {
        seenUrls.add(url);
        mediaItems.push({
          type: "image",
          url,
          alt_text: `${product.name || "Product"} ${colorName} finish`,
          source: "color",
          colorName,
        });
      }
    });
  });

  // 4. Variant images
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v: any) => {
      if (v?.imageUrl && typeof v.imageUrl === "string" && !seenUrls.has(v.imageUrl)) {
        seenUrls.add(v.imageUrl);
        const colorAttr = v.attributes?.find((a: any) => a?.name === "color")?.value;
        mediaItems.push({
          type: "image",
          url: v.imageUrl,
          alt_text: `${product.name || "Product"} variant photo`,
          source: "variant",
          colorName: colorAttr,
        });
      }
    });
  }

  // 5. Product videos
  if (product.videos && Array.isArray(product.videos)) {
    product.videos.forEach((video: any) => {
      const url = typeof video === "string" ? video : video?.url;
      if (url && typeof url === "string" && !seenUrls.has(url)) {
        seenUrls.add(url);
        mediaItems.push({
          type: "video",
          url,
          thumbnail: video?.thumbnail,
          source: "video",
        });
      }
    });
  }

  return mediaItems;
}
