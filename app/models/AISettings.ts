// app/models/AISettings.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAISettingsDocument extends Document {
  feature_type: "review_summary";
  is_active: boolean;
  openrouter_api_key: string;
  selected_model: string;
  max_tokens: number;
  temperature: number;
  created_at: Date;
  updated_at: Date;
}

const AISettingsSchema = new Schema<IAISettingsDocument>(
  {
    feature_type: {
      type: String,
      enum: ["review_summary"],
      default: "review_summary",
      unique: true,
    },
    is_active: {
      type: Boolean,
      default: false,
    },
    openrouter_api_key: {
      type: String,
      required: true,
    },
    selected_model: {
      type: String,
      required: true,
      default: "google/gemma-3-27b-it:free",
    },
    max_tokens: {
      type: Number,
      default: 500,
      min: 100,
      max: 2000,
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default (mongoose.models.AISettings ||
  mongoose.model<IAISettingsDocument>(
    "AISettings",
    AISettingsSchema
  )) as mongoose.Model<IAISettingsDocument>;