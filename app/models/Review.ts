// app/models/Review.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import "./Product";
import "./User";
import "./Order";

export interface IReviewDocument extends Document {
  user_id?: mongoose.Types.ObjectId;
  guest_email?: string;
  guest_name?: string;
  product_id: mongoose.Types.ObjectId;
  order_id: mongoose.Types.ObjectId;
  rating: number;
  title: string;
  comment: string;
  
  // Detailed Ratings
  detailed_ratings: {
    quality: number;
    durability: number;
    matches_description: number;
  };
  
  // Media
  images: Array<{
    url: string;
    caption?: string;
  }>;
  
  videos: Array<{
    url: string;
    thumbnail?: string;
    caption?: string;
  }>;
  
  verified_purchase: boolean;
  is_approved: boolean;
  
  // Helpful System
  helpful_votes: {
    helpful_user_ids: mongoose.Types.ObjectId[];
    helpful_guest_sessions: string[];
    not_helpful_user_ids: mongoose.Types.ObjectId[];
    not_helpful_guest_sessions: string[];
  };
  
  helpful_count: number;
  not_helpful_count: number;
  
  created_at: Date;
  updated_at: Date;
}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    guest_email: {
      type: String,
      default: null,
      index: true,
      lowercase: true,
      trim: true,
    },
    guest_name: {
      type: String,
      default: null,
      trim: true,
    },
    product_id: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    order_id: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      maxlength: 200,
      trim: true,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true,
    },
    detailed_ratings: {
      quality: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      durability: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      matches_description: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        caption: {
          type: String,
          maxlength: 200,
        },
      },
    ],
    videos: [
      {
        url: {
          type: String,
          required: true,
        },
        thumbnail: {
          type: String,
        },
        caption: {
          type: String,
          maxlength: 200,
        },
      },
    ],
    verified_purchase: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_approved: {
      type: Boolean,
      default: false,
      index: true,
    },
    helpful_votes: {
      helpful_user_ids: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
      helpful_guest_sessions: [String],
      not_helpful_user_ids: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
      not_helpful_guest_sessions: [String],
    },
    helpful_count: {
      type: Number,
      default: 0,
      min: 0,
    },
    not_helpful_count: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Compound unique index - one review per user per product
ReviewSchema.index({ user_id: 1, product_id: 1 }, { 
  unique: true,
  partialFilterExpression: { user_id: { $ne: null } }
});

// Compound unique index - one review per guest email per product
ReviewSchema.index({ guest_email: 1, product_id: 1 }, { 
  unique: true,
  partialFilterExpression: { guest_email: { $ne: null } }
});

// Index for querying approved reviews
ReviewSchema.index({ product_id: 1, is_approved: 1, created_at: -1 });

// Index for helpful sorting
ReviewSchema.index({ product_id: 1, is_approved: 1, helpful_count: -1 });

// Index for verified purchases
ReviewSchema.index({ product_id: 1, is_approved: 1, verified_purchase: 1 });

// Index for reviews with images
ReviewSchema.index({ product_id: 1, is_approved: 1, "images.0": 1 });

// Index for reviews with videos
ReviewSchema.index({ product_id: 1, is_approved: 1, "videos.0": 1 });

// Middleware to update product rating after review save
ReviewSchema.post("save", async function (doc) {
  if (doc.is_approved) {
    await updateProductRating(doc.product_id);
  }
});

// Middleware to update product rating after review update
ReviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.is_approved) {
    await updateProductRating(doc.product_id);
  }
});

// Middleware to update product rating after review delete
ReviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await updateProductRating(doc.product_id);
  }
});

// Helper function to update product rating
async function updateProductRating(productId: mongoose.Types.ObjectId) {
  const Product = mongoose.models.Product;
  
  const stats = await mongoose.models.Review.aggregate([
    {
      $match: {
        product_id: productId,
        is_approved: true,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating_average: Math.round(stats[0].averageRating * 10) / 10,
      rating_count: stats[0].totalReviews,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating_average: 0,
      rating_count: 0,
    });
  }
}

export default (mongoose.models.Review ||
  mongoose.model<IReviewDocument>("Review", ReviewSchema)) as Model<IReviewDocument>;