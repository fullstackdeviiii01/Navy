// // app/models/PaymentGateway.js
import mongoose from "mongoose";

const PaymentGatewaySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["stripe", "paypal", "cod"],
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
    is_test_mode: {
      type: Boolean,
      default: true,
    },
    credentials: {
      // Stripe
      stripe_publishable_key: String,
      stripe_secret_key: String,
      stripe_webhook_secret: String,
      
      // PayPal
      paypal_client_id: String,
      paypal_client_secret: String,
      paypal_webhook_id: String,
    },
    settings: {
      currency: {
        type: String,
        default: "PKR",
      },
      accepted_currencies: [String],
      payment_description: String,
      success_url: String,
      cancel_url: String,
      
      // COD specific settings
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