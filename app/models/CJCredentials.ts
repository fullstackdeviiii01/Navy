/**
 * app/models/CJCredentials.ts
 *
 * CJ Dropshipping Credentials Model.
 * Mirrors AliexpressCredentials exactly.
 *
 * Only api_key is needed — CJ uses it to fetch an access token.
 * Only one record should be active at a time (is_active: true).
 */

import mongoose, { Schema, Document } from "mongoose";

export interface ICJCredentials extends Document {
  api_key: string;
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const CJCredentialsSchema = new Schema<ICJCredentials>(
  {
    api_key: {
      type: String,
      required: true,
      trim: true,
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
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "cjcredentials",
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Ensure only one active credential at a time
CJCredentialsSchema.index({ is_active: 1 });

const CJCredentials =
  mongoose.models.CJCredentials ||
  mongoose.model<ICJCredentials>("CJCredentials", CJCredentialsSchema);

export default CJCredentials;