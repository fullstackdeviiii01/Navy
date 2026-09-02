// app/models/NewsletterCampaign.ts
import mongoose, { Schema, Document } from "mongoose";

export interface INewsletterCampaign extends Document {
  title: string;
  subject: string;
  content: string;
  status: "draft" | "scheduled" | "sent" | "cancelled";
  sent_at?: Date;
  scheduled_for?: Date;
  recipients_count: number;
  opened_count: number;
  clicked_count: number;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const NewsletterCampaignSchema = new Schema<INewsletterCampaign>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "sent", "cancelled"],
      default: "draft",
      index: true,
    },
    sent_at: {
      type: Date,
    },
    scheduled_for: {
      type: Date,
    },
    recipients_count: {
      type: Number,
      default: 0,
    },
    opened_count: {
      type: Number,
      default: 0,
    },
    clicked_count: {
      type: Number,
      default: 0,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

NewsletterCampaignSchema.index({ status: 1, created_at: -1 });

export default (mongoose.models.NewsletterCampaign ||
  mongoose.model<INewsletterCampaign>(
    "NewsletterCampaign",
    NewsletterCampaignSchema
  )) as mongoose.Model<INewsletterCampaign>;
