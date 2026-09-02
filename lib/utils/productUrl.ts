// lib/utils/productUrl.ts

export interface ProductUrlInput {
  _id?: string;
  id?: string;
  slug?: string;
  name?: string;
  title?: string;
}

/**
 * Creates an SEO-friendly product URL containing the product title and ID.
 * Example: /product/mushroom-wooden-lamp-64f1234567890abcdef12345
 */
export function getProductUrl(product: ProductUrlInput | string | null | undefined): string {
  if (!product) return "/products";

  if (typeof product === "string") {
    // If it's already an ObjectId or slug
    return `/product/${product}`;
  }

  const id = product._id || product.id || "";
  const name = product.name || product.title || "";
  const rawSlug = product.slug || "";

  // If there's an explicit slug, check if it already has the name
  if (rawSlug && rawSlug.length > 3) {
    // If slug is already a nice name-slug
    return `/product/${rawSlug}`;
  }

  // Generate slugified title
  if (name) {
    const slugifiedName = name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
      .replace(/[^a-z0-9-]/g, "") // Remove non-alphanumeric chars except hyphens
      .replace(/-+/g, "-") // Remove duplicate hyphens
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens

    if (slugifiedName && id) {
      return `/product/${slugifiedName}-${id}`;
    }
    if (slugifiedName) {
      return `/product/${slugifiedName}`;
    }
  }

  return id ? `/product/${id}` : "/products";
}

/**
 * Extracts a MongoDB ObjectId or slug query from an SEO-friendly product URL param.
 * Handles:
 * 1. Exact 24-character hex ObjectId: "64f1234567890abcdef12345"
 * 2. Slug ending with 24-char hex ObjectId: "mushroom-wooden-lamp-64f1234567890abcdef12345"
 * 3. Pure text slug: "mushroom-wooden-lamp"
 */
export function parseProductParam(param: string): {
  objectId?: string;
  slug?: string;
  raw: string;
} {
  if (!param) return { raw: "" };

  const clean = decodeURIComponent(param).trim();

  // Check if entire param is a 24-hex ObjectId
  const isExactObjectId = /^[0-9a-fA-F]{24}$/.test(clean);
  if (isExactObjectId) {
    return { objectId: clean, slug: clean, raw: clean };
  }

  // Check if param ends with -[24-hex ObjectId]
  const endingObjectIdMatch = clean.match(/-([0-9a-fA-F]{24})$/);
  if (endingObjectIdMatch && endingObjectIdMatch[1]) {
    return {
      objectId: endingObjectIdMatch[1],
      slug: clean,
      raw: clean,
    };
  }

  // Otherwise, treat as a slug/name query
  return { slug: clean, raw: clean };
}
