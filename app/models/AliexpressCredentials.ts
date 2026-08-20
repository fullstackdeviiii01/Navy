// app/models/AliexpressCredentials.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IAliexpressCredentials extends Document {
  app_key: string;
  app_secret: string; // stored encrypted
  access_token: string; // stored encrypted
  refresh_token: string; // stored encrypted
  token_expiry?: Date;
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const AliexpressCredentialsSchema = new Schema<IAliexpressCredentials>(
  {
    app_key: {
      type: String,
      required: true,
      trim: true,
    },
    // These fields store AES-256-GCM encrypted values
    app_secret: {
      type: String,
      required: true,
    },
    access_token: {
      type: String,
      required: true,
    },
    refresh_token: {
      type: String,
      required: true,
    },
    token_expiry: {
      type: Date,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updated_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default mongoose.models.AliexpressCredentials ||
  mongoose.model<IAliexpressCredentials>(
    "AliexpressCredentials",
    AliexpressCredentialsSchema
  );