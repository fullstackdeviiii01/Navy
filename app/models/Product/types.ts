// app/models/product/types.ts
import mongoose, { Document } from "mongoose";

// ============================================================================
// VARIANT TYPES & INTERFACES
// ============================================================================

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  aliexpressSkuId?: string;
  aliexpressSkuAttr?: string;
  cjVid?: string; // CJ variant ID — required for CJ order placement
  cjVariantSku?: string; // CJ variantSku — required for CJ order placement
  attributes: VariantAttribute[];
  price: number;
  compareAtPrice?: number;
  costPerItem?: number;
  stockQuantity: number;
  lowStockThreshold?: number;
  weight?: number;
  weightUnit?: "kg" | "lb" | "g" | "oz";
  barcode?: string;
  imageUrl?: string;
  isAvailable: boolean;
  position: number;
}

export interface VariantOption {
  name: string;
  displayName: string;
  values: string[];
  position: number;
}

export interface VariantPricing {
  minPrice?: number;
  maxPrice?: number;
  priceVaries?: boolean;
}

export interface VariantInventory {
  totalStock?: number;
  availableVariantCount?: number;
}

// ============================================================================
// PRODUCT DOCUMENT INTERFACE
// ============================================================================

export interface IProductDocument extends Document {
  // ========== Basic Information ==========
  name: string;
  description: string;
  short_description?: string;
  brand?: string;
  manufacturer?: string;

  // ========== Categorization ==========
  category_id: mongoose.Types.ObjectId;
  subcategory_ids: mongoose.Types.ObjectId[];
  tags: string[];

  // ========== Pricing (Simple Products) ==========
  pricing: {
    price: number;
    compare_at_price?: number;
    cost_per_item?: number;
    profit_margin?: number;
    tax_rate?: number;
    currency: string;
  };

  // ========== Inventory (Simple Products) ==========
  inventory: {
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    allow_backorder: boolean;
    stock_status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  };

  // ========== Unit of Measure ==========
  unit_of_measure?: string;

  // ========== Stripe Tax Code ==========
  stripe_tax_code?: string;

  // ========== AliExpress Metadata (dropshipping) ==========
  aliexpress?: {
    productId?: number;
    storeId?: number;
    storeName?: string;
    subProductId?: string;
  };

  cj?: {
    productId?: string;
    productSku?: string;
    supplierId?: string;
    supplierName?: string;
  };

  // ========== Variants Configuration ==========
  hasVariants: boolean;
  variantOptions: VariantOption[];
  variants: ProductVariant[];

  // ========== Computed Fields (Variable Products) ==========
  variantPricing?: VariantPricing;
  variantInventory?: VariantInventory;

  // ========== Media ==========
  images: {
    url: string;
    alt_text?: string;
    is_primary: boolean;
    sort_order: number;
  }[];
  videos: {
    url: string;
    thumbnail?: string;
    is_primary: boolean;
    sort_order: number;
    duration?: number;
    size?: number;
  }[];
  video_url?: string;

  // ========== Shipping ==========
  shipping: {
    weight?: number;
    weight_unit?: "kg" | "lb" | "g" | "oz";
    dimensions?: {
      length: number;
      width: number;
      height: number;
      unit: "cm" | "in" | "m";
    };
    requires_shipping: boolean;
    is_fragile: boolean;
  };

  // ========== SEO ==========
  seo: {
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    slug: string;
    canonical_url?: string;
  };

  // ========== Product Attributes & Specifications ==========
  attributes: Map<string, any>;
  specifications: Map<string, string>;

  // ========== Status & Visibility ==========
  status: "draft" | "active" | "archived" | "out_of_stock";
  badges: {
    is_featured: boolean;
    is_bestseller: boolean;
    is_on_sale: boolean;
    is_trending: boolean;
  };
  is_visible: boolean;
  visibility: "public" | "hidden" | "members_only";

  // ========== Dates ==========
  published_at?: Date;
  available_from?: Date;
  available_until?: Date;

  // ========== Analytics ==========
  view_count: number;
  purchase_count: number;
  rating_average: number;
  rating_count: number;

  // ========== Related Products ==========
  related_product_ids: mongoose.Types.ObjectId[];
  upsell_product_ids: mongoose.Types.ObjectId[];
  cross_sell_product_ids: mongoose.Types.ObjectId[];

  // ========== Admin ==========
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;

  // ========== Methods ==========
  syncVariantData?(): Promise<void>;
  getAvailableVariants?(): ProductVariant[];
  getVariantByAttributes?(attrs: Record<string, string>): ProductVariant | null;
  getVariantOptions?(): VariantOption[];
}
