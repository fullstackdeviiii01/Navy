// app/models/ChatbotConfig.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatbotConfigDocument extends Document {
  is_enabled: boolean;
  bot_name: string;
  welcome_message: string;
  fallback_message: string;
  primary_color: string;
  position: "bottom-right" | "bottom-left";
  avatar_icon: string;
  show_branding: boolean;
  created_at: Date;
  updated_at: Date;
}

const ChatbotConfigSchema = new Schema<IChatbotConfigDocument>(
  {
    is_enabled: {
      type: Boolean,
      default: true,
    },
    bot_name: {
      type: String,
      default: "Support Bot",
      trim: true,
    },
    welcome_message: {
      type: String,
      default:
        "Hi there! 👋 Welcome! How can I help you today? Please select a question below.",
      trim: true,
    },
    fallback_message: {
      type: String,
      default:
        "I'm sorry, I couldn't find an answer to that. Please contact our support team for further assistance.",
      trim: true,
    },
    primary_color: {
      type: String,
      default: "#6366f1",
    },
    position: {
      type: String,
      enum: ["bottom-right", "bottom-left"],
      default: "bottom-right",
    },
    avatar_icon: {
      type: String,
      default: "💬",
    },
    show_branding: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default (mongoose.models.ChatbotConfig ||
  mongoose.model<IChatbotConfigDocument>(
    "ChatbotConfig",
    ChatbotConfigSchema
  )) as Model<IChatbotConfigDocument>;