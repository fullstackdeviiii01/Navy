// app/models/ChatbotQA.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatbotQADocument extends Document {
  question: string;
  answer: string;
  category: string;
  is_visible: boolean;
  sort_order: number;
  click_count: number;
  created_at: Date;
  updated_at: Date;
}

const ChatbotQASchema = new Schema<IChatbotQADocument>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: "General",
    },
    is_visible: {
      type: Boolean,
      default: true,
      index: true,
    },
    sort_order: {
      type: Number,
      default: 0,
      index: true,
    },
    click_count: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

ChatbotQASchema.index({ is_visible: 1, sort_order: 1 });
ChatbotQASchema.index({ category: 1, is_visible: 1 });

export default (mongoose.models.ChatbotQA ||
  mongoose.model<IChatbotQADocument>(
    "ChatbotQA",
    ChatbotQASchema
  )) as Model<IChatbotQADocument>;