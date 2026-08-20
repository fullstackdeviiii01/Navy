// app/models/PaymentGateway.js
import mongoose from "mongoose";

const PaymentGatewaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["cod", "bank_transfer"],
      unique: true,
    },
    display_name: {
      type: String,
      required: true,
    },
    is_enabled: {
      type: Boolean,
      default: false,
    },
    credentials: {
      // Bank Transfer
      bank_account_name: String,
      bank_account_number: String,
      bank_iban: String,
      bank_name: String,
      bank_instructions: String,
      qr_code_image: String,
    },
    settings: {
      currency: {
        type: String,
        default: "PKR",
      },
      payment_description: String,
      min_order_amount: {
        type: Number,
        default: 0,
      },
      max_order_amount: {
        type: Number,
        default: null,
      },
      allow_all_orders: {
        type: Boolean,
        default: true,
      },
      instructions: String,
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.models.PaymentGateway ||
  mongoose.model("PaymentGateway", PaymentGatewaySchema);
