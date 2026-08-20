/**
 * lib/cj/transformer.ts
 *
 * CJ API Response → Internal Product Schema Transformer
 * Mirrors lib/aliexpress/transformer.ts exactly.
 *
 * Handles:
 * - Product detail (query endpoint) → TransformedProduct
 * - Variant parsing from CJ variants array
 * - Price mapping (variantSellPrice → price)
 * - Image URL extraction (bigImage + variant images)
 * - Variant option deduplication
 * - CJ vid preservation for order fulfillment
 * - MongoDB-ready payload builder (toMongoProductPayload)
 */

// ============================================================================
// RAW CJ API TYPES
// ============================================================================

export interface CJVariantInventory {
  countryCode: string;
  totalInventory: number;
  cjInventory: number;
  factoryInventory: number;
  verifiedWarehouse: number;
  stock: {
    stockId: string;
    inventory: number;
    factoryInventory: number;
  }[];
}

export interface CJVariant {
  vid: string;
  pid: string;
  variantName: string | null;
  variantNameEn: string;
  variantSku: string;
  variantImage?: string;
  variantStandard?: string;
  variantUnit?: string | null;
  variantProperty?: string | null;
  variantKey: string;         // e.g. "Black" or "[\"XS\",\"Black\"]"
  variantLength?: number;
  variantWidth?: number;
  variantHeight?: number;
  variantVolume?: number;
  variantWeight?: number;
  variantSellPrice?: number;
  variantSugSellPrice?: number;
  createTime?: string;
  inventories?: CJVariantInventory[];
}

export interface CJProductDetail {
  pid: string;
  productName: string;        // JSON array string e.g. "[\"name1\",\"name2\"]"
  productNameEn: string;
  productSku: string;
  productImage: string;
  productWeight?: string;
  productUnit?: string;
  productType?: string;
  categoryId?: string;
  categoryName?: string;
  entryCode?: string;
  entryNameEn?: string;
  materialNameEn?: string;
  packingKey?: string;
  packingNameEn?: string;
  productKey?: string;
  productKeyEn?: string;
  productProEnSet?: string[];
  sellPrice?: number;
  suggestSellPrice?: string;
  description?: string;
  listedNum?: number;
  status?: string;
  supplierName?: string;
  supplierId?: string;
  customizationVersion?: number;
  createrTime?: string;
  variants?: CJVariant[];
}

// ============================================================================
// TRANSFORMED OUTPUT TYPES (identical shape to aliexpress transformer)
// ============================================================================

export interface TransformedVariantAttribute {
  name: string;
  value: string;
}

export interface TransformedVariant {
  sku: string;
  cjVid: string;               // CJ variant ID — required for order placement
  cjVariantSku: string;        // CJ variantSku — required for order placement
  attributes: TransformedVariantAttribute[];
  price: number;
  compareAtPrice: number;
  stockQuantity: number;
  isAvailable: boolean;
  position: number;
  imageUrl?: string;
}

export interface TransformedVariantOption {
  name: string;
  displayName: string;
  values: string[];
  position: number;
}

export interface TransformedProductImage {
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface TransformedProduct {
  // Source reference
  cjProductId: string;         // CJ pid
  cjProductSku: string;        // CJ productSku / SPU
  cjSupplierId?: string;
  cjSupplierName?: string;

  // Basic info
  name: string;
  description: string;
  short_description: string;
  brand: string;

  // Media
  images: TransformedProductImage[];

  // Pricing
  basePrice: number;
  baseCompareAtPrice: number;
  currency: string;

  // Variants
  hasVariants: boolean;
  variantOptions: TransformedVariantOption[];
  variants: TransformedVariant[];

  // Shipping
  shipping: {
    weight: number;
    weightUnit: string;
    dimensions: {
      length: number;
      width: number;
      height: number;
      unit: string;
    };
    requiresShipping: boolean;
  };

  // Attributes
  attributes: Record<string, string | string[]>;

  // CJ metadata
  listedNum: number;
  categoryName: string;

  // Inventory summary
  totalStock: number;
  inStockVariantCount: number;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Normalise display name to internal snake_case key.
 * "Color Name" → "color_name"
 */
function toInternalName(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/**
 * Parse CJ productNameEn — it's always a clean English string.
 */
function parseProductName(productNameEn: string): string {
  return productNameEn?.trim() || "CJ Product";
}

/**
 * Parse CJ variantKey into individual attribute key-value pairs.
 *
 * CJ uses different formats:
 *   - "Black"                         → single value, option name from productKeyEn
 *   - "[\"XS\",\"Black\"]"            → multiple values, but no per-value names
 *   - JSON object                      → edge cases
 *
 * Strategy:
 *   - Use productKeyEn (e.g. "Color") as option name if only 1 option axis
 *   - If multiple axes, split by option count and map positionally
 */
function parseVariantAttributes(
  variantKey: string,
  variantNameEn: string,
  optionNames: string[]
): TransformedVariantAttribute[] {
  if (!variantKey) return [];

  let values: string[] = [];

  // Try JSON parse first
  try {
    const parsed = JSON.parse(variantKey);
    if (Array.isArray(parsed)) {
      values = parsed.map((v) => String(v).trim()).filter(Boolean);
    } else if (typeof parsed === "string") {
      values = [parsed.trim()];
    }
  } catch {
    // Not JSON — plain string value
    values = [variantKey.trim()];
  }

  if (values.length === 0) {
    // Fallback: extract from variantNameEn (e.g. "Product Black XS" → last words)
    values = [variantNameEn.trim()];
  }

  // Map values to option names positionally
  return values.map((value, idx) => ({
    name: optionNames[idx] || `option_${idx + 1}`,
    value,
  }));
}

/**
 * Build base SKU from CJ product SKU.
 */
function buildBaseSku(productSku: string): string {
  return `CJ-${productSku}`;
}

/**
 * Extract a clean short description from the CJ description HTML.
 */
function extractShortDescription(description?: string): string {
  if (!description) return "";
  const stripped = description
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.substring(0, 500);
}

/**
 * Parse CJ productKeyEn into an array of option axis names.
 * productKeyEn examples: "Color", "Color,Size", "Size"
 *
 * CJ also uses productKey (Chinese) as backup.
 * We normalise each to snake_case.
 */
function parseOptionNames(productKeyEn?: string): string[] {
  if (!productKeyEn) return ["option"];
  return productKeyEn
    .split(",")
    .map((k) => toInternalName(k.trim()))
    .filter(Boolean);
}

// ============================================================================
// CORE VARIANT PARSER
// ============================================================================

function parseVariants(
  cjVariants: CJVariant[],
  baseSku: string,
  optionNames: string[]
): {
  variantOptions: TransformedVariantOption[];
  variants: TransformedVariant[];
} {
  // Collect unique values per option axis
  const optionValueMap: Map<string, Set<string>> = new Map();

  for (const optName of optionNames) {
    optionValueMap.set(optName, new Set());
  }

  const variants: TransformedVariant[] = [];

  cjVariants.forEach((cjV, index) => {
    const attributes = parseVariantAttributes(
      cjV.variantKey || "",
      cjV.variantNameEn || "",
      optionNames
    );

    // Collect option values
    for (const attr of attributes) {
      if (!optionValueMap.has(attr.name)) {
        optionValueMap.set(attr.name, new Set());
      }
      optionValueMap.get(attr.name)!.add(attr.value);
    }

    // Calculate stock from inventories array, or default to 0
    const totalStock = cjV.inventories
      ? cjV.inventories.reduce((sum, inv) => sum + (inv.totalInventory || 0), 0)
      : 0;

    const price = typeof cjV.variantSellPrice === "number" ? cjV.variantSellPrice : 0;

    variants.push({
      sku: `${baseSku}-V${String(index + 1).padStart(3, "0")}`,
      cjVid: cjV.vid,
      cjVariantSku: cjV.variantSku,
      attributes,
      price,
      compareAtPrice: 0, // CJ doesn't provide original price per variant
      stockQuantity: totalStock,
      isAvailable: totalStock > 0,
      position: index,
      imageUrl: cjV.variantImage || undefined,
    });
  });

  // Build variant options array
  const variantOptions: TransformedVariantOption[] = Array.from(
    optionValueMap.entries()
  )
    .filter(([, values]) => values.size > 0)
    .map(([name, values], idx) => ({
      name,
      displayName:
        name
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
      values: Array.from(values),
      position: idx,
    }));

  return { variantOptions, variants };
}

// ============================================================================
// MAIN TRANSFORMER
// ============================================================================

/**
 * Transform a raw CJ product detail API response into the internal
 * product schema — identical shape to transformAliexpressProduct().
 */
export function transformCJProduct(productDetail: CJProductDetail): TransformedProduct {
  if (!productDetail || !productDetail.pid) {
    throw new Error("Invalid CJ product data: missing pid");
  }

  const baseSku = buildBaseSku(productDetail.productSku);
  const optionNames = parseOptionNames(productDetail.productKeyEn);

  // ── Images ────────────────────────────────────────────────────────────────
  // CJ returns productImage as a JSON array string: "[\"url1\",\"url2\",...]"
  const images: TransformedProductImage[] = [];
  const rawImage = productDetail.productImage;
  if (rawImage) {
    let imageUrls: string[] = [];
    try {
      const parsed = JSON.parse(rawImage);
      imageUrls = Array.isArray(parsed) ? parsed : [rawImage];
    } catch {
      imageUrls = [rawImage];
    }
    imageUrls.forEach((url, i) => {
      if (url) {
        images.push({
          url,
          alt_text: `${productDetail.productNameEn} - Image ${i + 1}`,
          is_primary: i === 0,
          sort_order: i,
        });
      }
    });
  }

  // ── Variants ──────────────────────────────────────────────────────────────
  const cjVariants = productDetail.variants || [];
  const { variantOptions, variants } = parseVariants(cjVariants, baseSku, optionNames);
  const hasVariants = variants.length > 1 || variantOptions.length > 0;

  // ── Pricing ───────────────────────────────────────────────────────────────
  const availableVariants = variants.filter((v) => v.isAvailable);
  const pricingSource = availableVariants.length > 0 ? availableVariants : variants;
  const allPrices = pricingSource.map((v) => v.price).filter((p) => p > 0);

  // Fallback to product-level sellPrice if no variant prices
  const basePrice =
    allPrices.length > 0
      ? Math.min(...allPrices)
      : typeof productDetail.sellPrice === "number"
      ? productDetail.sellPrice
      : 0;

  // ── Inventory summary ─────────────────────────────────────────────────────
  const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const inStockVariantCount = variants.filter((v) => v.stockQuantity > 0).length;

  // ── Attributes ────────────────────────────────────────────────────────────
  const attributes: Record<string, string | string[]> = {};
  if (productDetail.materialNameEn) {
    attributes.material = productDetail.materialNameEn;
  }
  if (productDetail.entryNameEn) {
    attributes.customs_name = productDetail.entryNameEn;
  }
  if (productDetail.entryCode) {
    attributes.hs_code = productDetail.entryCode;
  }
  if (productDetail.productProEnSet && productDetail.productProEnSet.length > 0) {
    attributes.logistics_property = productDetail.productProEnSet;
  }

  // ── Shipping ──────────────────────────────────────────────────────────────
  const weight = parseFloat(productDetail.productWeight || "0") || 0;

  // ── Description ───────────────────────────────────────────────────────────
  const shortDescription = extractShortDescription(productDetail.description);

  return {
    cjProductId: productDetail.pid,
    cjProductSku: productDetail.productSku,
    cjSupplierId: productDetail.supplierId || undefined,
    cjSupplierName: productDetail.supplierName || undefined,

    name: parseProductName(productDetail.productNameEn),
    description: productDetail.description || "",
    short_description: shortDescription,
    brand: "",  // CJ doesn't expose brand via product detail API

    images,

    basePrice,
    baseCompareAtPrice: 0,
    currency: "USD",

    hasVariants,
    variantOptions,
    variants,

    shipping: {
      weight,
      weightUnit: "g",
      dimensions: { length: 0, width: 0, height: 0, unit: "cm" },
      requiresShipping: true,
    },

    attributes,

    listedNum: productDetail.listedNum || 0,
    categoryName: productDetail.categoryName || "",

    totalStock,
    inStockVariantCount,
  };
}

// ============================================================================
// MONGODB-READY CONVERTER
// ============================================================================

/**
 * Convert a TransformedProduct into the exact shape expected by the
 * Product MongoDB model.
 *
 * Mirrors toMongoProductPayload() from lib/aliexpress/transformer.ts.
 *
 * @param transformed  - Output from transformCJProduct()
 * @param categoryId   - MongoDB Category _id
 * @param adminUserId  - MongoDB User _id of the importing admin
 * @param markupPercent - Price markup % (default: 0)
 */
export function toMongoProductPayload(
  transformed: TransformedProduct,
  categoryId: string,
  adminUserId: string,
  markupPercent: number = 0
): Record<string, any> {
  const applyMarkup = (price: number) =>
    markupPercent > 0
      ? Math.ceil(price * (1 + markupPercent / 100) * 100) / 100
      : price;

  // Apply markup to all variant prices
  const variants = transformed.variants.map((v) => ({
    sku: v.sku,
    cjVid: v.cjVid,
    cjVariantSku: v.cjVariantSku,
    attributes: v.attributes,
    price: applyMarkup(v.price),
    compareAtPrice: v.compareAtPrice > 0 ? applyMarkup(v.compareAtPrice) : undefined,
    stockQuantity: v.stockQuantity,
    lowStockThreshold: 10,
    isAvailable: v.isAvailable,
    position: v.position,
    imageUrl: v.imageUrl,
  }));

  // Generate slug
  const baseSlug = transformed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slug = `${baseSlug}-${transformed.cjProductSku.toLowerCase()}-${Math.random()
    .toString(36)
    .substring(2, 7)}`;

  const markedUpBasePrice = applyMarkup(transformed.basePrice);

  // Inventory for simple products
  const stockQty = transformed.totalStock;
  const lowThreshold = 10;
  let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
  if (stockQty === 0) stockStatus = "out_of_stock";
  else if (stockQty <= lowThreshold) stockStatus = "low_stock";

  const baseInventorySku = transformed.hasVariants
    ? `${buildBaseSku(transformed.cjProductSku)}-BASE`
    : buildBaseSku(transformed.cjProductSku);

  return {
    // CJ source metadata — stored for dropshipping order placement
    cj: {
      productId: transformed.cjProductId,
      productSku: transformed.cjProductSku,
      supplierId: transformed.cjSupplierId,
      supplierName: transformed.cjSupplierName,
    },

    name: transformed.name,
    description: transformed.description,
    short_description: transformed.short_description,
    brand: transformed.brand || undefined,

    category_id: categoryId,
    subcategory_ids: [],
    tags: [],

    pricing: {
      price: markedUpBasePrice,
      compare_at_price: undefined,
      currency: "USD",
    },

    inventory: {
      sku: baseInventorySku,
      stock_quantity: stockQty,
      low_stock_threshold: lowThreshold,
      track_inventory: true,
      allow_backorder: false,
      stock_status: stockStatus,
    },

    unit_of_measure: undefined,
    stripe_tax_code: "txcd_99999999",

    hasVariants: transformed.hasVariants,
    variantOptions: transformed.variantOptions,
    variants,

    shipping: {
      weight: transformed.shipping.weight,
      weight_unit: transformed.shipping.weightUnit,
      dimensions: transformed.shipping.dimensions,
      requires_shipping: transformed.shipping.requiresShipping,
      is_fragile: false,
    },

    seo: {
      slug,
      meta_title: transformed.name.substring(0, 60),
      meta_description: transformed.short_description.substring(0, 160),
      meta_keywords: [],
    },

    attributes: transformed.attributes,

    status: "active",
    badges: {
      is_featured: false,
      is_bestseller: false,
      is_on_sale: false,
      is_trending: false,
    },
    is_visible: true,
    visibility: "public",

    images: transformed.images,
    videos: [],

    created_by: adminUserId,
  };
}