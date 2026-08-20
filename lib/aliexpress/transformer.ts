//
/**
 * AliExpress API Response → Internal Product Schema Transformer
 */

// ============================================================================
// RAW ALIEXPRESS TYPES
// ============================================================================

export interface AliexpressSkuProperty {
  sku_property_id: number;
  sku_property_name: string;
  property_value_id: number;
  property_value_definition_name: string;
  sku_property_value: string;
  sku_image?: string;
}

export interface AliexpressSkuInfo {
  sku_id: string;
  sku_attr: string;
  sku_price: string;
  offer_sale_price: string;
  offer_bulk_sale_price: string;
  sku_available_stock: number;
  currency_code: string;
  price_include_tax: boolean;
  sku_bulk_order: number;
  id: string;
  ae_sku_property_dtos: {
    ae_sku_property_d_t_o: AliexpressSkuProperty[];
  };
}

export interface AliexpressVideoDto {
  media_id: number;
  media_url: string;
  poster_url: string;
  media_status: string;
  media_type: string;
  ali_member_id: number;
}

export interface AliexpressMultimediaInfo {
  image_urls: string;
  ae_video_dtos?: {
    ae_video_d_t_o: AliexpressVideoDto[];
  };
}

export interface AliexpressItemProperty {
  attr_name_id?: number;
  attr_value_id?: number;
  attr_name: string;
  attr_value: string;
}

export interface AliexpressBaseInfo {
  product_id: number;
  subject: string;
  detail: string;
  mobile_detail: string;
  currency_code: string;
  category_id: number;
  product_status_type: string;
  evaluation_count: string;
  sales_count: string;
  avg_evaluation_rating: string;
  separated_listing: boolean;
  sl_product: boolean;
}

export interface AliexpressPackageInfo {
  package_width: number;
  package_height: number;
  package_length: number;
  gross_weight: string;
  package_type: boolean;
  product_unit: number;
}

export interface AliexpressStoreInfo {
  store_id: number;
  store_name: string;
  store_country_code: string;
  shipping_speed_rating: string;
  communication_rating: string;
  item_as_described_rating: string;
}

export interface AliexpressProductResult {
  ae_item_sku_info_dtos: {
    ae_item_sku_info_d_t_o: AliexpressSkuInfo[];
  };
  ae_multimedia_info_dto: AliexpressMultimediaInfo;
  ae_item_base_info_dto: AliexpressBaseInfo;
  ae_item_properties: {
    ae_item_property: AliexpressItemProperty[];
  };
  package_info_dto: AliexpressPackageInfo;
  ae_store_info: AliexpressStoreInfo;
  product_id_converter_result: {
    main_product_id: number;
    sub_product_id: string;
  };
}

export interface AliexpressApiResponse {
  aliexpress_ds_product_get_response: {
    result: AliexpressProductResult;
    rsp_code: number;
    rsp_msg: string;
    request_id: string;
  };
}

// ============================================================================
// TRANSFORMED OUTPUT TYPES
// ============================================================================

export interface TransformedVariantAttribute {
  name: string;
  value: string;
}

export interface TransformedVariant {
  sku: string;
  aliexpressSkuId: string;
  aliexpressSkuAttr: string;
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

export interface TransformedProductVideo {
  url: string;
  thumbnail: string;
  is_primary: boolean;
  sort_order: number;
}

export interface TransformedAttribute {
  [key: string]: string | string[];
}

export interface TransformedProduct {
  aliexpressProductId: number;
  aliexpressStoreId: number;
  aliexpressStoreName: string;
  aliexpressSubProductId: string;

  name: string;
  description: string;
  short_description: string;
  brand: string;

  images: TransformedProductImage[];
  videos: TransformedProductVideo[];

  basePrice: number;
  baseCompareAtPrice: number;
  currency: string;

  hasVariants: boolean;
  variantOptions: TransformedVariantOption[];
  variants: TransformedVariant[];

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

  attributes: TransformedAttribute;

  salesCount: number;
  evaluationCount: number;
  avgRating: number;
  categoryId: number;

  totalStock: number;
  inStockVariantCount: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SKIP_PROPERTY_IDS = new Set([200007763, 200007764, 200000204]);

const SKIP_PROPERTY_NAMES = new Set(["ships from", "quantity"]);

// ============================================================================
// HELPERS
// ============================================================================

function toInternalName(displayName: string): string {
  return displayName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function parseImageUrls(imageUrlsString: string): string[] {
  if (!imageUrlsString) return [];
  return imageUrlsString
    .split(";")
    .map((url) => url.trim())
    .filter(Boolean);
}

function shouldSkipProperty(prop: AliexpressSkuProperty): boolean {
  if (SKIP_PROPERTY_IDS.has(prop.sku_property_id)) return true;
  if (SKIP_PROPERTY_NAMES.has(prop.sku_property_name.toLowerCase().trim()))
    return true;
  return false;
}

function getVariantValue(prop: AliexpressSkuProperty): string {
  const definitionName = prop.property_value_definition_name?.trim();
  const propertyValue = prop.sku_property_value?.trim();
  if (definitionName && definitionName.length > 0) {
    return definitionName;
  }
  return propertyValue || String(prop.property_value_id);
}

function buildBaseSku(productId: number): string {
  return `ALI-${productId}`;
}

function extractShortDescription(
  htmlDetail: string,
  mobileDetail: string,
): string {
  try {
    const mobile = JSON.parse(mobileDetail);
    if (mobile?.moduleList) {
      for (const module of mobile.moduleList) {
        if (module.type === "text" && module.data?.content) {
          const text = module.data.content.trim();
          if (text.length > 10) {
            return text.substring(0, 500);
          }
        }
      }
    }
  } catch {
    // Fall through to HTML stripping
  }

  const stripped = htmlDetail
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return stripped.substring(0, 500);
}

function parseAttributes(
  properties: AliexpressItemProperty[],
): TransformedAttribute {
  const SKIP_ATTR_NAMES = new Set([
    "high-concerned chemical",
    "cn",
    "choice",
    "size_info",
    "1",
    "2",
    "3",
    "4",
    "5",
  ]);

  const attrs: TransformedAttribute = {};

  for (const prop of properties) {
    const name = prop.attr_name?.trim();
    const value = prop.attr_value?.trim();

    if (!name || !value) continue;
    if (SKIP_ATTR_NAMES.has(name.toLowerCase())) continue;
    if (!prop.attr_name_id || prop.attr_name_id === -1) continue;

    const key = toInternalName(name);

    if (attrs[key]) {
      const existing = attrs[key];
      if (Array.isArray(existing)) {
        if (!existing.includes(value)) {
          existing.push(value);
        }
      } else {
        if (existing !== value) {
          attrs[key] = [existing as string, value];
        }
      }
    } else {
      attrs[key] = value;
    }
  }

  return attrs;
}

function extractBrand(properties: AliexpressItemProperty[]): string {
  const brandProp = properties.find(
    (p) => p.attr_name_id === 2 || p.attr_name?.toLowerCase() === "brand name",
  );
  if (!brandProp) return "";
  const brand = brandProp.attr_value?.trim();
  if (!brand || brand.toUpperCase() === "NONE") return "";
  return brand;
}

// ============================================================================
// CORE VARIANT PARSER
// ============================================================================

interface VariantOptionMap {
  [propertyId: number]: {
    propertyId: number;
    displayName: string;
    internalName: string;
    values: Map<number, { value: string; image?: string }>;
    position: number;
  };
}

function parseVariants(
  skuList: AliexpressSkuInfo[],
  baseSku: string,
): {
  variantOptions: TransformedVariantOption[];
  variants: TransformedVariant[];
} {
  const optionMap: VariantOptionMap = {};
  let optionPosition = 0;

  for (const sku of skuList) {
    const properties = sku.ae_sku_property_dtos?.ae_sku_property_d_t_o ?? [];

    for (const prop of properties) {
      if (shouldSkipProperty(prop)) continue;

      const propId = prop.sku_property_id;

      if (!optionMap[propId]) {
        optionMap[propId] = {
          propertyId: propId,
          displayName: prop.sku_property_name.trim(),
          internalName: toInternalName(prop.sku_property_name),
          values: new Map(),
          position: optionPosition++,
        };
      }

      const valueId = prop.property_value_id;
      if (!optionMap[propId].values.has(valueId)) {
        optionMap[propId].values.set(valueId, {
          value: getVariantValue(prop),
          image: prop.sku_image,
        });
      }
    }
  }

  const variantOptions: TransformedVariantOption[] = (
    Object.values(optionMap) as Array<(typeof optionMap)[number]>
  )
    .sort((a, b) => a.position - b.position)
    .map((opt) => ({
      name: opt.internalName,
      displayName: opt.displayName,
      values: Array.from(opt.values.values()).map((v) => v.value),
      position: opt.position,
    }));

  const variants: TransformedVariant[] = skuList.map((sku, index) => {
    const properties = sku.ae_sku_property_dtos?.ae_sku_property_d_t_o ?? [];

    const attributes: TransformedVariantAttribute[] = [];
    let variantImageUrl: string | undefined;

    for (const prop of properties) {
      if (shouldSkipProperty(prop)) continue;

      const internalName = toInternalName(prop.sku_property_name);
      const value = getVariantValue(prop);

      attributes.push({ name: internalName, value });

      if (prop.sku_image && !variantImageUrl) {
        variantImageUrl = prop.sku_image;
      }
    }

    const offerPrice = parseFloat(sku.offer_sale_price) || 0;
    const fullPrice = parseFloat(sku.sku_price) || 0;

    return {
      sku: `${baseSku}-V${String(index + 1).padStart(3, "0")}`,
      aliexpressSkuId: sku.sku_id,
      aliexpressSkuAttr: sku.sku_attr,
      attributes,
      price: offerPrice,
      compareAtPrice: fullPrice > offerPrice ? fullPrice : 0,
      stockQuantity: sku.sku_available_stock || 0,
      isAvailable: (sku.sku_available_stock || 0) > 0,
      position: index,
      imageUrl: variantImageUrl,
    };
  });

  return { variantOptions, variants };
}

// ============================================================================
// MAIN TRANSFORMER
// ============================================================================

// AFTER
export function transformAliexpressProduct(
  apiResponse: any,
): TransformedProduct {
  // Handle top-level API errors (e.g. IncompleteSignature, invalid token)
  if (apiResponse.error_response) {
    throw new Error(
      `AliExpress API error: ${apiResponse.error_response.msg} (code: ${apiResponse.error_response.code})`,
    );
  }

  const response = apiResponse.aliexpress_ds_product_get_response;

  if (!response || response.rsp_code !== 200) {
    throw new Error(
      `AliExpress API error: ${response?.rsp_msg || "Unknown error"} (code: ${response?.rsp_code})`,
    );
  }

  const result = response.result;
  const baseInfo = result.ae_item_base_info_dto;
  const multimedia = result.ae_multimedia_info_dto;
  const packageInfo = result.package_info_dto;
  const storeInfo = result.ae_store_info;
  const properties = result.ae_item_properties?.ae_item_property ?? [];
  const skuList = result.ae_item_sku_info_dtos?.ae_item_sku_info_d_t_o ?? [];

  const productId = baseInfo.product_id;
  const baseSku = buildBaseSku(productId);

  const imageUrls = parseImageUrls(multimedia.image_urls);
  const images: TransformedProductImage[] = imageUrls.map((url, index) => ({
    url,
    alt_text: `${baseInfo.subject} - Image ${index + 1}`,
    is_primary: index === 0,
    sort_order: index,
  }));

  const videos: TransformedProductVideo[] = [];
  const videoDtos = multimedia.ae_video_dtos?.ae_video_d_t_o ?? [];
  for (let i = 0; i < videoDtos.length; i++) {
    const v = videoDtos[i];
    if (v.media_status === "approved" && v.media_url) {
      videos.push({
        url: v.media_url,
        thumbnail: v.poster_url || "",
        is_primary: i === 0,
        sort_order: i,
      });
    }
  }

  const { variantOptions, variants } = parseVariants(skuList, baseSku);
  const hasVariants = variants.length > 1 || variantOptions.length > 0;

  const availableVariants = variants.filter(
    (v) => v.isAvailable && v.stockQuantity > 0,
  );
  const pricingSource =
    availableVariants.length > 0 ? availableVariants : variants;

  const allPrices = pricingSource.map((v) => v.price).filter((p) => p > 0);
  const allComparePrices = pricingSource
    .map((v) => v.compareAtPrice)
    .filter((p) => p > 0);

  const basePrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const baseCompareAtPrice =
    allComparePrices.length > 0 ? Math.min(...allComparePrices) : 0;
  const currency = skuList[0]?.currency_code || "USD";

  const totalStock = variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const inStockVariantCount = variants.filter(
    (v) => v.stockQuantity > 0,
  ).length;

  const attributes = parseAttributes(properties);
  const brand = extractBrand(properties);

  const weight = parseFloat(packageInfo?.gross_weight || "0") || 0;
  const shipping = {
    weight,
    weightUnit: "kg",
    dimensions: {
      length: packageInfo?.package_length || 0,
      width: packageInfo?.package_width || 0,
      height: packageInfo?.package_height || 0,
      unit: "cm",
    },
    requiresShipping: true,
  };

  const shortDescription = extractShortDescription(
    baseInfo.detail || "",
    baseInfo.mobile_detail || "",
  );

  let aliexpressSubProductId = "";
  try {
    const subIdMap = JSON.parse(
      result.product_id_converter_result?.sub_product_id || "{}",
    );
    aliexpressSubProductId = String(subIdMap.US || "");
  } catch {
    aliexpressSubProductId = "";
  }

  return {
    aliexpressProductId: productId,
    aliexpressStoreId: storeInfo.store_id,
    aliexpressStoreName: storeInfo.store_name,
    aliexpressSubProductId,

    name: baseInfo.subject.trim(),
    description: baseInfo.detail || "",
    short_description: shortDescription,
    brand,

    images,
    videos,

    basePrice,
    baseCompareAtPrice,
    currency,

    hasVariants,
    variantOptions,
    variants,

    shipping,
    attributes,

    salesCount: parseInt(baseInfo.sales_count) || 0,
    evaluationCount: parseInt(baseInfo.evaluation_count) || 0,
    avgRating: parseFloat(baseInfo.avg_evaluation_rating) || 0,
    categoryId: baseInfo.category_id,

    totalStock,
    inStockVariantCount,
  };
}

// ============================================================================
// MONGODB-READY CONVERTER
// ============================================================================

export function toMongoProductPayload(
  transformed: TransformedProduct,
  categoryId: string,
  adminUserId: string,
  markupPercent: number = 0,
): Record<string, any> {
  const applyMarkup = (price: number) =>
    markupPercent > 0
      ? Math.ceil(price * (1 + markupPercent / 100) * 100) / 100
      : price;

  const variants = transformed.variants.map((v) => ({
    sku: v.sku,
    aliexpressSkuId: v.aliexpressSkuId,
    aliexpressSkuAttr: v.aliexpressSkuAttr,
    attributes: v.attributes,
    price: applyMarkup(v.price),
    compareAtPrice:
      v.compareAtPrice > 0 ? applyMarkup(v.compareAtPrice) : undefined,
    stockQuantity: v.stockQuantity,
    lowStockThreshold: 10,
    isAvailable: v.isAvailable,
    position: v.position,
    imageUrl: v.imageUrl,
  }));

  const baseSlug = transformed.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const slug = `${baseSlug}-${transformed.aliexpressProductId}-${Math.random()
    .toString(36)
    .substring(2, 7)}`;

  const markedUpBasePrice = applyMarkup(transformed.basePrice);
  const markedUpComparePrice =
    transformed.baseCompareAtPrice > 0
      ? applyMarkup(transformed.baseCompareAtPrice)
      : undefined;

  // FIX: Calculate actual total stock from all variants
  const totalStock = transformed.variants.reduce(
    (sum, v) => sum + v.stockQuantity,
    0,
  );
  const lowThreshold = 10;
  let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
  if (totalStock === 0) stockStatus = "out_of_stock";
  else if (totalStock <= lowThreshold) stockStatus = "low_stock";

  const baseInventorySku = transformed.hasVariants
    ? `${buildBaseSku(transformed.aliexpressProductId)}-BASE`
    : buildBaseSku(transformed.aliexpressProductId);

  return {
    aliexpress: {
      productId: transformed.aliexpressProductId,
      storeId: transformed.aliexpressStoreId,
      storeName: transformed.aliexpressStoreName,
      subProductId: transformed.aliexpressSubProductId,
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
      compare_at_price: markedUpComparePrice,
      currency: transformed.currency || "USD",
    },

    inventory: {
      sku: baseInventorySku,
      stock_quantity: totalStock, // FIX: use computed totalStock
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

    // FIX: Import as active, not draft
    status: "active",
    badges: {
      is_featured: false,
      is_bestseller: false,
      is_on_sale: markedUpComparePrice ? true : false,
      is_trending: false,
    },
    is_visible: true,
    visibility: "public",

    images: transformed.images,
    videos: transformed.videos,

    created_by: adminUserId,
  };
}
