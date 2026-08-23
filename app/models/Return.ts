// app/models/Return.ts
import mongoose, { Schema, Document } from "mongoose";
import "./Product";
import "./User";
import "./Order";

export interface IReturnItem {
  product_id: mongoose.Types.ObjectId;
  product_name: string;
  product_image?: string;
  variant_attributes?: { [key: string]: string };
  quantity: number;
  price: number;
}

export interface IPayoutDetails {
  method: "bank_transfer" | "jazzcash" | "easypaisa";
  account_title: string;
  account_number: string;
  bank_or_wallet_name: string;
  submitted_at: Date;
}

export interface ISettlement {
  transaction_reference: string;
  proof_url?: string;
  settled_at: Date;
  settled_by?: mongoose.Types.ObjectId;
  admin_notes?: string;
}

export interface IReturnDocument extends Document {
  rma_number: string;
  order_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId | null;
  guest_email?: string;

  items: IReturnItem[];
  refund_amount: number;

  return_reason:
    | "defective"
    | "damaged"
    | "wrong_item"
    | "quality_issue"
    | "not_as_described"
    | "changed_mind"
    | "other";
  return_reason_details?: string;

  media_urls?: string[];

  status: "pending" | "approved" | "rejected" | "refunded";
  rejection_reason?: string;

  payout_details?: IPayoutDetails;
  settlement?: ISettlement;

  requested_at: Date;
  reviewed_at?: Date;
  refunded_at?: Date;

  created_at: Date;
  updated_at: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    product_name: { type: String, required: true },
    product_image: { type: String },
    variant_attributes: { type: Map, of: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const PayoutDetailsSchema = new Schema<IPayoutDetails>(
  {
    method: {
      type: String,
      enum: ["bank_transfer", "jazzcash", "easypaisa"],
      required: true,
    },
    account_title: { type: String, required: true, trim: true },
    account_number: { type: String, required: true, trim: true },
    bank_or_wallet_name: { type: String, required: true, trim: true },
    submitted_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SettlementSchema = new Schema<ISettlement>(
  {
    transaction_reference: { type: String, required: true, trim: true },
    proof_url: { type: String },
    settled_at: { type: Date, default: Date.now },
    settled_by: { type: Schema.Types.ObjectId, ref: "User" },
    admin_notes: { type: String },
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
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
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

    refund_amount: {
      type: Number,
      required: true,
      min: 0,
    },

    return_reason: {
      type: String,
      required: true,
      enum: [
        "defective",
        "damaged",
        "wrong_item",
        "quality_issue",
        "not_as_described",
        "changed_mind",
        "other",
      ],
      index: true,
    },
    return_reason_details: {
      type: String,
      maxlength: 1000,
    },

    media_urls: [{ type: String }],

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "refunded"],
      default: "pending",
      index: true,
    },
    rejection_reason: {
      type: String,
    },

    payout_details: {
      type: PayoutDetailsSchema,
      default: null,
    },

    settlement: {
      type: SettlementSchema,
      default: null,
    },

    requested_at: { type: Date, default: Date.now },
    reviewed_at: { type: Date },
    refunded_at: { type: Date },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

ReturnSchema.index({ user_id: 1, created_at: -1 });
ReturnSchema.index({ guest_email: 1, created_at: -1 });
ReturnSchema.index({ status: 1, created_at: -1 });
ReturnSchema.index({ order_id: 1 });

export default (mongoose.models.Return ||
  mongoose.model<IReturnDocument>("Return", ReturnSchema)) as mongoose.Model<IReturnDocument>;
