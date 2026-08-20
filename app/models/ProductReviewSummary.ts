// app/models/ProductReviewSummary.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProductReviewSummaryDocument extends Document {
  product_id: mongoose.Types.ObjectId;
  summary: string;
  total_reviews_analyzed: number;
  average_rating: number;
  generated_at: Date;
  generated_by: mongoose.Types.ObjectId;
  is_active: boolean;
  model_used: string;
}

const ProductReviewSummarySchema = new Schema<IProductReviewSummaryDocument>(
  {
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true,
      index: true,
    },
    summary: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    total_reviews_analyzed: {
      type: Number,
      required: true,
      min: 0,
    },
    average_rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    generated_at: {
      type: Date,
      default: Date.now,
    },
    generated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    model_used: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default (mongoose.models.ProductReviewSummary ||
  mongoose.model<IProductReviewSummaryDocument>(
    "ProductReviewSummary",
    ProductReviewSummarySchema
  )) as mongoose.Model<IProductReviewSummaryDocument>;