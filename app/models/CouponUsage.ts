// app/models/CouponUsage.ts - COMPLETE REPLACEMENT
import mongoose, { Schema, Document, Model } from "mongoose";
import "./Coupon";
import "./User";
import "./Order";

export interface ICouponUsageDocument extends Document {
  coupon_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId | null;
  guest_email?: string | null;
  session_id?: string | null;
  order_id?: mongoose.Types.ObjectId | null;
  discount_applied: number;
  used_at: Date;
}

const CouponUsageSchema = new Schema<ICouponUsageDocument>(
  {
    coupon_id: {
      type: Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    session_id: {
      type: String,
      default: null,
      index: true,
    },
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    discount_applied: { type: Number, required: true },
    used_at: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// Validation: Either user_id OR guest_email must exist
CouponUsageSchema.pre("validate", function (next) {
  if (!this.user_id && !this.guest_email) {
    next(new Error("CouponUsage must have either user_id or guest_email"));
  } else {
    next();
  }
});

// Compound indexes
CouponUsageSchema.index({ user_id: 1, coupon_id: 1 });
CouponUsageSchema.index({ guest_email: 1, coupon_id: 1 });
CouponUsageSchema.index({ session_id: 1, coupon_id: 1 });

export default (mongoose.models.CouponUsage ||
  mongoose.model<ICouponUsageDocument>(
    "CouponUsage",
    CouponUsageSchema
  )) as Model<ICouponUsageDocument>;