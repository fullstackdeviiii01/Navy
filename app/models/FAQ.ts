// app/models/FAQ.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFAQDocument extends Document {
  question: string;
  answer: string;
  category: string;
  is_active: boolean;
  sort_order: number;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const FAQSchema = new Schema<IFAQDocument>(
  {
    question: { 
      type: String, 
      required: true, 
      trim: true 
    },
    answer: { 
      type: String, 
      required: true 
    },
    category: {
      type: String,
      required: true,
      default: "General",
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

FAQSchema.index({ category: 1, is_active: 1, sort_order: 1 });

export default (mongoose.models.FAQ || 
  mongoose.model<IFAQDocument>("FAQ", FAQSchema)) as Model<IFAQDocument>;