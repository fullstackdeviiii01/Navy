// app/models/Coupon.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import CouponUsage from "./CouponUsage";

export interface ICouponDocument extends Document {
  code: string;
  description?: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount?: number | null;
  valid_from: Date;
  valid_until: Date;
  usage_limit?: number | null;
  used_count: number;
  per_user_limit: number;
  applicable_to: {
    type: "all" | "categories" | "products";
    category_ids: mongoose.Types.ObjectId[];
    product_ids: mongoose.Types.ObjectId[];
  };
  is_active: boolean;
  show_on_products: boolean; // New field to control product card display
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
  isValid(): boolean;
  canUserUse(userId: mongoose.Types.ObjectId): Promise<boolean>;
  appliesToProduct(productId: mongoose.Types.ObjectId, categoryId: mongoose.Types.ObjectId): boolean;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: { type: String },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: { type: Number, required: true, min: 0 },
    min_order_amount: { type: Number, default: 0 },
    max_discount: { type: Number, default: null },
    valid_from: { type: Date, required: true },
    valid_until: { type: Date, required: true },
    usage_limit: { type: Number, default: null },
    used_count: { type: Number, default: 0 },
    per_user_limit: { type: Number, default: 1 },
    applicable_to: {
      type: {
        type: String,
        enum: ["all", "categories", "products"],
        default: "all",
      },
      category_ids: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      product_ids: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    },
    is_active: { type: Boolean, default: true },
    show_on_products: { type: Boolean, default: true },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Method to check if coupon is valid
CouponSchema.methods.isValid = function () {
  const now = new Date();
  
  if (!this.is_active) return false;
  if (now < this.valid_from || now > this.valid_until) return false;
  if (this.usage_limit && this.used_count >= this.usage_limit) return false;
  
  return true;
};

// Method to check if user can use this coupon
CouponSchema.methods.canUserUse = async function (userId: mongoose.Types.ObjectId) {
  if (!this.isValid()) return false;

  const userUsageCount = await CouponUsage.countDocuments({
    coupon_id: this._id,
    user_id: userId,
  });

  return userUsageCount < this.per_user_limit;
};

// Method to check if coupon applies to a specific product
CouponSchema.methods.appliesToProduct = function (
  productId: mongoose.Types.ObjectId,
  categoryId: mongoose.Types.ObjectId
) {
  if (!this.isValid() || !this.show_on_products) return false;

  // "all" applies to everything
  if (this.applicable_to.type === "all") return true;

  // "products" ONLY applies to specific products in the list
  if (this.applicable_to.type === "products") {
    // Must have product_ids array and product must be in the list
    if (!this.applicable_to.product_ids || this.applicable_to.product_ids.length === 0) {
      return false;
    }
    return this.applicable_to.product_ids.some(
      (id) => id.toString() === productId.toString()
    );
  }

  // "categories" ONLY applies to products in specific categories
  if (this.applicable_to.type === "categories") {
    // Must have category_ids array and product's category must be in the list
    if (!this.applicable_to.category_ids || this.applicable_to.category_ids.length === 0) {
      return false;
    }
    // Product's category must match one of the selected categories
    if (!categoryId) return false;
    return this.applicable_to.category_ids.some(
      (id) => id.toString() === categoryId.toString()
    );
  }

  return false;
};

export default (mongoose.models.Coupon || 
  mongoose.model<ICouponDocument>("Coupon", CouponSchema)) as Model<ICouponDocument>;