// app/models/Refund.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRefundDocument extends Document {
  refund_id: string;
  order_id: mongoose.Types.ObjectId;
  return_id: mongoose.Types.ObjectId;
  payment_id?: mongoose.Types.ObjectId;
  
  amount: number;
  currency: string;
  
  refund_method: "original_payment" | "store_credit" | "manual";
  payment_gateway?: "cod" | "bank_transfer";
  
  status: "pending" | "processing" | "completed" | "failed";
  
  reason: string;
  
  error_message?: string;
  
  processed_by: mongoose.Types.ObjectId;
  
  initiated_at: Date;
  completed_at?: Date;
  
  metadata?: Map<string, any>;
  
  created_at: Date;
  updated_at: Date;
}

const RefundSchema = new Schema<IRefundDocument>(
  {
    refund_id: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `REF-${timestamp}-${random}`;
      },
    },
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },
    return_id: {
      type: Schema.Types.ObjectId,
      ref: "Return",
      required: true,
      index: true,
    },
    payment_id: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
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
    
    refund_method: {
      type: String,
      enum: ["original_payment", "store_credit", "manual"],
      required: true,
    },
    payment_gateway: {
      type: String,
      enum: ["cod", "bank_transfer"],
    },
    
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    
    reason: {
      type: String,
      required: true,
    },
    
    error_message: { type: String },
    
    processed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    initiated_at: { type: Date, default: Date.now },
    completed_at: { type: Date },
    
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
RefundSchema.index({ order_id: 1, status: 1 });
RefundSchema.index({ return_id: 1 });
RefundSchema.index({ status: 1, created_at: -1 });

export default (mongoose.models.Refund ||
  mongoose.model<IRefundDocument>("Refund", RefundSchema)) as mongoose.Model<IRefundDocument>;