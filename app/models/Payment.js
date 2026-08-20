// app/models/Payment.js - UPDATED
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null, // CHANGED: Now optional initially
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // CHANGED: Optional for guest checkout
      index: true,
    },
    session_id: {
      type: String, // NEW: For guest checkout
      default: null,
      index: true,
    },
    payment_gateway: {
      type: String,
      enum: ["stripe", "paypal", "cod"],
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["card", "paypal", "cod"],
      required: true,
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    capture_id: {
      type: String,
      sparse: true,
      index: true,
    },
    payment_intent_id: String, // Stripe
    payer_id: String, // PayPal
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "PKR",
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded", "cancelled"],
      default: "pending",
      index: true,
    },
    payment_details: {
      card_last4: String,
      card_brand: String,
      paypal_email: String,
      payer_name: String,
    },
    checkout_data: {
      type: mongoose.Schema.Types.Mixed, // NEW: Store checkout data temporarily
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },
    error_message: String,
    refund_amount: {
      type: Number,
      default: 0,
    },
    refund_reason: String,
    refunded_at: Date,
    completed_at: Date,
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

PaymentSchema.index({ status: 1, created_at: -1 });
PaymentSchema.index({ user_id: 1, created_at: -1 });
PaymentSchema.index({ session_id: 1, created_at: -1 });

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);