// // app/models/product/schema.ts
import { Schema } from "mongoose";
import {
  IProductDocument,
  VariantAttribute,
  ProductVariant,
  VariantOption,
  VariantPricing,
  VariantInventory,
} from "./types";

// ============================================================================
// SUBDOCUMENT SCHEMAS
// ============================================================================

// Variant Attribute Schema
const VariantAttributeSchema = new Schema<VariantAttribute>(
  {
    name: { type: String, required: true, lowercase: true },
    value: { type: String, required: true },
  },
  { _id: false },
);

// Product Variant Schema
const ProductVariantSchema = new Schema<ProductVariant>(
  {
    attributes: {
      type: [VariantAttributeSchema],
      required: true,
      validate: {
        validator: (attrs: VariantAttribute[]) => attrs.length > 0,
        message: "At least one attribute must be defined",
      },
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    costPerItem: {
      type: Number,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 10,
    },
    weight: {
      type: Number,
      min: 0,
    },
    weightUnit: {
      type: String,
      enum: ["kg", "lb", "g", "oz"],
      default: "kg",
    },
    barcode: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    position: {
      type: Number,
      default: 0,
    },
  },
  { _id: true },
);

// Variant Option Schema
const VariantOptionSchema = new Schema<VariantOption>(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    values: {
      type: [String],
      required: true,
      validate: {
        validator: (values: string[]) => values.length > 0,
        message: "At least one value must be defined",
      },
    },
    position: {
      type: Number,
      default: 0,
    },
    colorHexCodes: {
      type: Schema.Types.Mixed,
      default: {},
    },
    colorImages: {
      type: Schema.Types.Mixed,
      default: {},
    },
    colorVideos: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  { _id: false },
);

// Product Image Schema
const ProductImageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt_text: { type: String },
    is_primary: { type: Boolean, default: false },
    sort_order: { type: Number, default: 0 },
  },
  { _id: false },
);

const ProductVideoSchema = new Schema(
  {
    url: { type: String, required: true },
    thumbnail: { type: String },
    is_primary: { type: Boolean, default: false },
    sort_order: { type: Number, default: 0 },
    duration: { type: Number },
    size: { type: Number },
  },
  { _id: false },
);

// Pricing Schema
const PricingSchema = new Schema(
  {
    price: { type: Number, required: true, min: 0 },
    compare_at_price: { type: Number, min: 0 },
    cost_per_item: { type: Number, min: 0 },
    profit_margin: { type: Number, min: 0, max: 100 },
    tax_rate: { type: Number, min: 0, max: 100, default: 0 },
    currency: { type: String, required: true, default: "PKR" },
  },
  { _id: false },
);

// Inventory Schema
const InventorySchema = new Schema(
  {
    stock_quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    low_stock_threshold: { type: Number, default: 10 },
    track_inventory: { type: Boolean, default: true },
    allow_backorder: { type: Boolean, default: false },
    stock_status: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock", "discontinued"],
      default: "in_stock",
    },
  },
  { _id: false },
);

// Shipping Schema
const ShippingSchema = new Schema(
  {
    weight: { type: Number, min: 0 },
    weight_unit: {
      type: String,
      enum: ["kg", "lb", "g", "oz"],
      default: "kg",
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, enum: ["cm", "in", "m"], default: "cm" },
    },
    requires_shipping: { type: Boolean, default: true },
    is_fragile: { type: Boolean, default: false },
  },
  { _id: false },
);

// SEO Schema
const SEOSchema = new Schema(
  {
    meta_title: { type: String },
    meta_description: { type: String },
    meta_keywords: [{ type: String }],
    slug: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    canonical_url: { type: String },
  },
  { _id: false },
);

// Variant Pricing Schema (Computed)
const VariantPricingSchema = new Schema<VariantPricing>(
  {
    minPrice: { type: Number, min: 0 },
    maxPrice: { type: Number, min: 0 },
    priceVaries: { type: Boolean, default: false },
  },
  { _id: false },
);

// Variant Inventory Schema (Computed)
const VariantInventorySchema = new Schema<VariantInventory>(
  {
    totalStock: { type: Number, min: 0, default: 0 },
    availableVariantCount: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

// ============================================================================
// MAIN PRODUCT SCHEMA
// ============================================================================

export const ProductSchema = new Schema<IProductDocument>(
  {
    // ========== Basic Information ==========
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    care_guide: { type: String },
    shipping_info: { type: String },
    return_info: { type: String },
    brand: {
      type: String,
      index: true,
    },

    // ========== Categorization ==========
    category_id: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategory_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // ========== Pricing (Simple & Variable Products) ==========
    pricing: {
      type: PricingSchema,
      default: () => ({
        price: 0,
        currency: "PKR",
      }),
    },

    // ========== Inventory (Simple & Variable Products) ==========
    inventory: {
      type: InventorySchema,
      default: () => ({
        stock_quantity: 0,
        low_stock_threshold: 10,
        stock_status: "in_stock",
        track_inventory: true,
      }),
    },

    // ========== Variants Configuration ==========
    hasVariants: {
      type: Boolean,
      default: false,
      index: true,
    },
    variantOptions: [VariantOptionSchema],
    variants: {
      type: [ProductVariantSchema],
    },

    // ========== Computed Fields (Variable Products) ==========
    variantPricing: {
      type: VariantPricingSchema,
    },
    variantInventory: {
      type: VariantInventorySchema,
    },

    // ========== Media ==========
    images: {
      type: [ProductImageSchema],
      default: [],
    },
    videos: {
      type: [ProductVideoSchema],
      default: [],
    },

    // ========== Shipping ==========
    shipping: {
      type: ShippingSchema,
      default: () => ({
        requires_shipping: true,
        is_fragile: false,
        weight: 1,
        weight_unit: "kg",
      }),
    },

    // ========== SEO ==========
    seo: {
      type: SEOSchema,
      default: () => ({}),
    },

    // ========== Product Attributes & Specifications ==========
    attributes: {
      type: Map,
      of: Schema.Types.Mixed,
    },

    // ========== Status & Visibility ==========
    status: {
      type: String,
      enum: ["draft", "active", "archived", "out_of_stock"],
      default: "draft",
      index: true,
    },
    is_visible: {
      type: Boolean,
      default: true,
      index: true,
    },
    visibility: {
      type: String,
      enum: ["public", "hidden", "members_only"],
      default: "public",
    },

    // ========== Dates ==========
    published_at: {
      type: Date,
    },
    available_from: {
      type: Date,
    },
    available_until: {
      type: Date,
    },

    // ========== Analytics ==========
    view_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchase_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    rating_average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    rating_count: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ========== Admin ==========
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ============================================================================
// INDEXES FOR PERFORMANCE
// ============================================================================

// Text search indexes
ProductSchema.index({ name: "text", description: "text" });

// Pricing indexes
ProductSchema.index({ "pricing.price": 1 });
ProductSchema.index({ "variantPricing.minPrice": 1 });
ProductSchema.index({ "variantPricing.maxPrice": 1 });

// Inventory indexes
ProductSchema.index({ "inventory.stock_quantity": 1 });
ProductSchema.index({ "variantInventory.totalStock": 1 });

// Status & visibility indexes
ProductSchema.index({ created_at: -1 });
ProductSchema.index({ status: 1, is_visible: 1 });

// Variant indexes
ProductSchema.index({ "variants.isAvailable": 1 });

// Category index
ProductSchema.index({ category_id: 1, status: 1 });


