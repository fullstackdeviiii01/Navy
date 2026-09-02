// app/models/NewsletterSubscriber.ts
import mongoose, { Schema, Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  name?: string;
  is_active: boolean;
  subscribed_at: Date;
  unsubscribed_at?: Date;
  source: "footer" | "popup" | "checkout" | "manual";
  preferences?: {
    product_updates: boolean;
    promotions: boolean;
    news: boolean;
  };
  metadata?: {
    ip_address?: string;
    user_agent?: string;
  };
  created_at: Date;
  updated_at: Date;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscribed_at: {
      type: Date,
      default: Date.now,
    },
    unsubscribed_at: {
      type: Date,
    },
    source: {
      type: String,
      enum: ["footer", "popup", "checkout", "manual"],
      default: "footer",
    },
    preferences: {
      product_updates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      news: { type: Boolean, default: true },
    },
    metadata: {
      ip_address: String,
      user_agent: String,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

NewsletterSubscriberSchema.index({ email: 1, is_active: 1 });
NewsletterSubscriberSchema.index({ created_at: -1 });

export default (mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>(
    "NewsletterSubscriber",
    NewsletterSubscriberSchema
  )) as mongoose.Model<INewsletterSubscriber>;
