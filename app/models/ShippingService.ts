// app/models/ShippingService.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IShippingServiceDocument extends Document {
  name: string;
  display_name: string;
  description?: string;
  base_price: number;
  currency: string;
  estimated_days_min?: number;
  estimated_days_max?: number;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

const ShippingServiceSchema = new Schema<IShippingServiceDocument>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    display_name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    base_price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "PKR",
      uppercase: true,
    },
    estimated_days_min: {
      type: Number,
      min: 0,
    },
    estimated_days_max: {
      type: Number,
      min: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Indexes
ShippingServiceSchema.index({ is_active: 1, sort_order: 1 });

export default (mongoose.models.ShippingService ||
  mongoose.model<IShippingServiceDocument>(
    "ShippingService",
    ShippingServiceSchema
  )) as mongoose.Model<IShippingServiceDocument>;