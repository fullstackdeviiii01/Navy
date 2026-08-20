// app/models/Page.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPageDocument extends Document {
  title: string;
  slug: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  sort_order: number;
  page_type: "terms" | "privacy" | "refund" | "shipping" | "about" | "licensing" | "custom";
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const PageSchema = new Schema<IPageDocument>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      index: true,
      lowercase: true,
      trim: true
    },
    content: { 
      type: String, 
      required: true 
    },
    meta_title: { 
      type: String,
      trim: true
    },
    meta_description: { 
      type: String,
      trim: true
    },
    is_active: { 
      type: Boolean, 
      default: true,
      index: true
    },
    sort_order: { 
      type: Number, 
      default: 0 
    },
    page_type: {
      type: String,
      enum: ["terms", "privacy", "refund", "shipping", "about", "faq", "contact", "licensing", "custom"],
      required: true,
      index: true
    },
    created_by: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    updated_by: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  {
    timestamps: { 
      createdAt: "created_at", 
      updatedAt: "updated_at" 
    },
  }
);

PageSchema.index({ slug: 1, is_active: 1 });
PageSchema.index({ page_type: 1, is_active: 1 });

export default (mongoose.models.Page || 
  mongoose.model<IPageDocument>("Page", PageSchema)) as Model<IPageDocument>;