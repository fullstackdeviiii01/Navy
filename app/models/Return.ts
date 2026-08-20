// app/models/Return.ts - SIMPLIFIED REFUND-ONLY MODEL
import mongoose, { Schema, Document } from "mongoose";

export interface IReturnItem {
  product_id: mongoose.Types.ObjectId;
  variant_id?: mongoose.Types.ObjectId;
  product_name: string;
  variant_attributes?: { [key: string]: string };
  quantity: number;
  price: number;
  reason: string;
}

export interface IReturnDocument extends Document {
  rma_number: string;
  order_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId | null;
  guest_email?: string;
  
  items: IReturnItem[];
  
  return_reason: string;
  return_reason_details?: string;
  
  photos?: string[];
  
  // SIMPLIFIED STATUS FLOW: pending → approved/rejected → refunded (if approved)
  status: "pending" | "approved" | "rejected" | "refunded";
  rejection_reason?: string;
  
  refund_amount: number;
  refund_method: "bank_transfer" | "manual";
  refund_status?: "pending" | "processing" | "completed" | "failed";
  
  // Bank transfer details for COD orders
  bank_transfer_details?: {
    account_holder_name: string;
    account_number: string;
    bank_name: string;
    ifsc_code?: string; // For Indian banks
    swift_code?: string; // For international
    routing_number?: string; // For US banks
  };
  
  tracking_number?: string;
  carrier?: string;
  
  admin_notes?: string;
  
  requested_at: Date;
  approved_at?: Date;
  rejected_at?: Date;
  refunded_at?: Date;
  
  processed_by?: mongoose.Types.ObjectId;
  
  created_at: Date;
  updated_at: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant_id: { type: Schema.Types.ObjectId, default: null },
    product_name: { type: String, required: true },
    variant_attributes: { type: Map, of: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true },
  },
  { _id: false }
);

const BankTransferDetailsSchema = new Schema(
  {
    account_holder_name: { type: String, required: true },
    account_number: { type: String, required: true },
    bank_name: { type: String, required: true },
    ifsc_code: { type: String },
    swift_code: { type: String },
    routing_number: { type: String },
  },
  { _id: false }
);

const ReturnSchema = new Schema<IReturnDocument>(
  {
    rma_number: {
      type: String,
      unique: true,
      index: true,
      default: function () {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `RMA-${timestamp}-${random}`;
      },
    },
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
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
      lowercase: true,
      trim: true,
      index: true,
    },
    
    items: {
      type: [ReturnItemSchema],
      required: true,
      validate: {
        validator: (items: IReturnItem[]) => items.length > 0,
        message: "Return must have at least one item",
      },
    },
    
    return_reason: {
      type: String,
      required: true,
      enum: [
        "defective",
        "wrong_item",
        "not_as_described",
        "changed_mind",
        "arrived_late",
        "damaged",
        "quality_issue",
        "other",
      ],
      index: true,
    },
    return_reason_details: {
      type: String,
      maxlength: 1000,
    },
    
    photos: [{ type: String }],
    
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "refunded"],
      default: "pending",
      index: true,
    },
    rejection_reason: {
      type: String,
    },
    
    refund_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    refund_method: {
      type: String,
      enum: ["bank_transfer", "manual"],
      required: true,
    },
    refund_status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      index: true,
    },
    
    bank_transfer_details: {
      type: BankTransferDetailsSchema,
    },
    
    tracking_number: { type: String },
    carrier: { type: String },
    
    admin_notes: { type: String },
    
    requested_at: { type: Date, default: Date.now },
    approved_at: { type: Date },
    rejected_at: { type: Date },
    refunded_at: { type: Date },
    
    processed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes for efficient queries
ReturnSchema.index({ user_id: 1, created_at: -1 });
ReturnSchema.index({ guest_email: 1, created_at: -1 });
ReturnSchema.index({ status: 1, created_at: -1 });
ReturnSchema.index({ order_id: 1 });
ReturnSchema.index({ refund_status: 1 });

export default (mongoose.models.Return ||
  mongoose.model<IReturnDocument>("Return", ReturnSchema)) as mongoose.Model<IReturnDocument>;