// app/models/Wishlist.ts - NEW FILE
import mongoose, { Schema, Document, Model } from "mongoose";
import "./Product";
import "./User";

export interface IWishlistDocument extends Document {
  user_id?: mongoose.Types.ObjectId | null;
  session_id?: string | null;
  products: mongoose.Types.ObjectId[];
  expires_at?: Date;
  created_at: Date;
  updated_at: Date;
}

const WishlistSchema = new Schema<IWishlistDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    session_id: {
      type: String,
      default: null,
      index: true,
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    expires_at: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      index: true,
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
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Validation: Either user_id OR session_id must exist
WishlistSchema.pre("validate", function (next) {
  if (!this.user_id && !this.session_id) {
    next(new Error("Wishlist must have either user_id or session_id"));
  } else {
    next();
  }
});

// Index for cleanup of expired wishlists
WishlistSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Compound indexes
WishlistSchema.index({ user_id: 1, session_id: 1 });

export default (mongoose.models.Wishlist ||
  mongoose.model<IWishlistDocument>("Wishlist", WishlistSchema)) as Model<IWishlistDocument>;