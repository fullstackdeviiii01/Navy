// app/models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  product_name: string;
  product_image: string;
  variant_attributes?: { [key: string]: string };
  quantity: number;
  price: number;
  subtotal: number;
}

export interface IShippingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface IBillingAddress {
  full_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface IOrderPricing {
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  total: number;
  currency: string;
}

export interface IGuestInfo {
  email: string;
  name: string;
  phone: string;
}

export interface IShippingServiceInfo {
  service_id: mongoose.Types.ObjectId;
  service_name: string;
  service_display_name: string;
  estimated_days_min?: number;
  estimated_days_max?: number;
}

export interface IOrderDocument extends Document {
  order_number: string;
  order_type: "registered" | "guest";
  user_id?: mongoose.Types.ObjectId | null;
  guest_info?: IGuestInfo;
  session_id?: string;
  items: IOrderItem[];
  pricing: IOrderPricing;
  shipping_address: IShippingAddress;
  billing_address: IBillingAddress;
  same_as_shipping: boolean;
  shipping_service?: IShippingServiceInfo;
  coupon_code?: string;
  coupon_id?: mongoose.Types.ObjectId;
  payment_proof_url?: string;
  bank_reference?: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method?: string;
  tracking_number?: string;
  carrier?: string;
  customer_notes?: string;
  admin_notes?: string;
  placed_at: Date;
  confirmed_at?: Date;
  shipped_at?: Date;
  delivered_at?: Date;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant_id: { type: Schema.Types.ObjectId, default: null },
    product_name: { type: String, required: true },
    product_image: { type: String, required: true },
    variant_attributes: { type: Map, of: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const BillingAddressSchema = new Schema<IBillingAddress>(
  {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postal_code: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false }
);

const OrderPricingSchema = new Schema<IOrderPricing>(
  {
    subtotal: { type: Number, required: true, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    tax_amount: { type: Number, required: true, min: 0 },
    shipping_cost: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "PKR" },
  },
  { _id: false }
);

const GuestInfoSchema = new Schema<IGuestInfo>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false }
);

const ShippingServiceInfoSchema = new Schema<IShippingServiceInfo>(
  {
    service_id: {
      type: Schema.Types.ObjectId,
      ref: "ShippingService",
      required: true,
    },
    service_name: { type: String, required: true },
    service_display_name: { type: String, required: true },
    estimated_days_min: { type: Number },
    estimated_days_max: { type: Number },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    order_number: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `ORD-${timestamp}-${random}`;
      },
    },
    order_type: {
      type: String,
      enum: ["registered", "guest"],
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    guest_info: {
      type: GuestInfoSchema,
      required: function () {
        return this.order_type === "guest";
      },
    },
    session_id: {
      type: String,
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: "Order must have at least one item",
      },
    },
    pricing: { type: OrderPricingSchema, required: true },
    shipping_address: { type: ShippingAddressSchema, required: true },
    billing_address: { type: BillingAddressSchema, required: true },
    same_as_shipping: { type: Boolean, default: false },
    shipping_service: { type: ShippingServiceInfoSchema },
    coupon_code: { type: String },
    coupon_id: { type: Schema.Types.ObjectId, ref: "Coupon" },

    payment_proof_url: { type: String },
    bank_reference: { type: String },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
      index: true,
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    payment_method: { type: String },
    tracking_number: { type: String },
    carrier: { type: String },
    customer_notes: { type: String },
    admin_notes: { type: String },
    placed_at: { type: Date, default: Date.now },
    confirmed_at: { type: Date },
    shipped_at: { type: Date },
    delivered_at: { type: Date },
    cancelled_at: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Validation
OrderSchema.pre("validate", function (next) {
  if (this.order_type === "guest" && !this.guest_info) {
    next(new Error("Guest orders must have guest_info"));
  } else if (this.order_type === "registered" && !this.user_id) {
    next(new Error("Registered orders must have user_id"));
  } else {
    next();
  }
});

// Virtuals
OrderSchema.virtual("has_active_return", {
  ref: "Return",
  localField: "_id",
  foreignField: "order_id",
  justOne: true,
  match: { status: { $nin: ["rejected"] } },
});

OrderSchema.virtual("return_status", {
  ref: "Return",
  localField: "_id",
  foreignField: "order_id",
  justOne: true,
});

OrderSchema.set("toJSON", { virtuals: true });
OrderSchema.set("toObject", { virtuals: true });

// Indexes
OrderSchema.index({ user_id: 1, created_at: -1 });
OrderSchema.index({ "guest_info.email": 1, created_at: -1 });
OrderSchema.index({ session_id: 1 });
OrderSchema.index({ status: 1, payment_status: 1 });
OrderSchema.index({ placed_at: -1 });

export default (mongoose.models.Order ||
  mongoose.model<IOrderDocument>(
    "Order",
    OrderSchema
  )) as mongoose.Model<IOrderDocument>;