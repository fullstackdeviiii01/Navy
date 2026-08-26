// app/models/Cart.ts - UPDATED WITH SHIPPING SERVICE
import mongoose, { Schema, Document, Model } from "mongoose";
import "./Product";
import "./Coupon";
import "./ShippingService";
import "./User";

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId | null;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price_at_addition: number;
  variant_attributes?: Record<string, string>;
  added_at: Date;
}

export interface ICartDocument extends Document {
  user_id?: mongoose.Types.ObjectId | null;
  session_id?: string | null;
  guest_email?: string | null;
  email_capture_source?: 'cart_sidebar' | 'exit_intent' | 'checkout';
  email_captured_at?: Date;
  items: ICartItem[];
  applied_coupon_id?: mongoose.Types.ObjectId | null;
  selected_shipping_service_id?: mongoose.Types.ObjectId | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
  calculateTotals(coupon?: any, shippingService?: any): Promise<this>;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant_id: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    product_name: {
      type: String,
      default: null,
    },
    product_image: {
      type: String,
      default: null,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price_at_addition: {
      type: Number,
      required: true,
    },
    variant_attributes: {
      type: Map,
      of: String,
    },
    added_at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const CartSchema = new Schema<ICartDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    session_id: {
      type: String,
      default: null,
      index: true,
    },
    guest_email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
      index: true,
    },
    email_capture_source: {
      type: String,
      enum: ['cart_sidebar', 'exit_intent', 'checkout'],
      default: null,
    },
    email_captured_at: {
      type: Date,
      default: null,
    },
    items: [CartItemSchema],
    applied_coupon_id: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
    selected_shipping_service_id: {
      type: Schema.Types.ObjectId,
      ref: "ShippingService",
      default: null,
    },
    subtotal: {
      type: Number,
      default: 0,
    },
    discount_amount: {
      type: Number,
      default: 0,
    },
    tax_amount: {
      type: Number,
      default: 0,
    },
    shipping_cost: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Validation
CartSchema.pre("validate", function (next) {
  if (!this.user_id && !this.session_id) {
    next(new Error("Cart must have either user_id or session_id"));
  } else {
    next();
  }
});

// Calculate totals with coupon and shipping service
CartSchema.methods.calculateTotals = async function (coupon = null, shippingService = null) {
  this.subtotal = this.items.reduce(
    (sum: number, item: ICartItem) =>
      sum + item.price_at_addition * item.quantity,
    0
  );

  this.discount_amount = 0;

  if (coupon && coupon.is_active) {
    await this.populate({
      path: "items.product_id",
    });

    let applicableSubtotal = 0;

    for (const item of this.items) {
      const product = item.product_id;
      if (!product) continue;

      let isApplicable = false;

      if (coupon.applicable_to.type === "all") {
        isApplicable = true;
      } else if (coupon.applicable_to.type === "products") {
        isApplicable =
          coupon.applicable_to.product_ids?.some(
            (id: any) => id.toString() === product._id.toString()
          ) || false;
      } else if (coupon.applicable_to.type === "categories") {
        isApplicable =
          coupon.applicable_to.category_ids?.some(
            (id: any) => id.toString() === product.category_id?.toString()
          ) || false;
      }

      if (isApplicable) {
        applicableSubtotal += item.price_at_addition * item.quantity;
      }
    }

    if (applicableSubtotal > 0) {
      if (coupon.discount_type === "percentage") {
        this.discount_amount =
          (applicableSubtotal * coupon.discount_value) / 100;
        if (
          coupon.max_discount &&
          this.discount_amount > coupon.max_discount
        ) {
          this.discount_amount = coupon.max_discount;
        }
      } else if (coupon.discount_type === "fixed") {
        this.discount_amount = Math.min(
          coupon.discount_value,
          applicableSubtotal
        );
      }
    }
  }

  this.tax_amount = 0;
  
  // Calculate shipping cost: Free shipping on orders over Rs. 15,000
  const netSubtotal = this.subtotal - this.discount_amount;
  if (netSubtotal >= 15000 || this.subtotal >= 15000) {
    this.shipping_cost = 0;
  } else if (shippingService && shippingService.is_active) {
    this.shipping_cost = shippingService.base_price || 0;
  } else {
    this.shipping_cost = 0;
  }

  this.total = this.subtotal - this.discount_amount + this.tax_amount + this.shipping_cost;

  return this;
};

// Indexes
CartSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
CartSchema.index({ user_id: 1, session_id: 1 });

export default (mongoose.models.Cart ||
  mongoose.model<ICartDocument>("Cart", CartSchema)) as Model<ICartDocument>;