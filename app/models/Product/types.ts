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
  name: string;
  description: string;
  care_guide?: string;
  shipping_info?: string;
  return_info?: string;
  brand?: string;

  category_id: mongoose.Types.ObjectId;
  subcategory_ids: mongoose.Types.ObjectId[];

  pricing: {
    price: number;
    compare_at_price?: number;
    cost_per_item?: number;
    profit_margin?: number;
    tax_rate?: number;
    currency: string;
  };

  inventory: {
    sku: string;
    stock_quantity: number;
    low_stock_threshold: number;
    track_inventory: boolean;
    allow_backorder: boolean;
    stock_status: "in_stock" | "low_stock" | "out_of_stock" | "discontinued";
  };

  hasVariants: boolean;
  variantOptions: VariantOption[];
  variants: ProductVariant[];

  variantPricing?: VariantPricing;
  variantInventory?: VariantInventory;

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

  seo: {
    slug: string;
  };

  attributes: Map<string, any>;

  status: "draft" | "active" | "archived" | "out_of_stock";
  is_visible: boolean;
  visibility: "public" | "hidden" | "members_only";

  published_at?: Date;
  available_from?: Date;
  available_until?: Date;

  view_count: number;
  purchase_count: number;
  rating_average: number;
  rating_count: number;

  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;

  syncVariantData?(): Promise<void>;
  getAvailableVariants?(): ProductVariant[];
  getVariantByAttributes?(attrs: Record<string, string>): ProductVariant | null;
  getVariantOptions?(): VariantOption[];
}
