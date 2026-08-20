// app/models/Payment.js
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    session_id: {
      type: String,
      default: null,
      index: true,
    },
    payment_gateway: {
      type: String,
      enum: ["cod", "bank_transfer"],
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["cod", "bank_transfer"],
      required: true,
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
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
    proof_url: String,
    bank_reference: String,
    checkout_data: {
      type: mongoose.Schema.Types.Mixed,
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
