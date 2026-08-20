// app/models/PromotionalBanner.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IBannerImage {
  url: string;
  alt_text?: string;
  position: number;
}

export interface IBannerButton {
  text: string;
  url: string;
  color: string;
  text_color: string;
  position: number;
}

export interface IPromotionalBannerDocument extends Document {
  title: string;
  subtitle?: string;
  description?: string;
  
  background_color: string;
  background_gradient?: string;
  text_color: string;
  
  images: IBannerImage[];
  buttons: IBannerButton[];
  
  target_page: "home" | "categories" | "products";
  position?: "top" | "middle" | "bottom"; // Only for categories/products
  
  is_active: boolean;
  sort_order: number;
  
  display_from?: Date;
  display_until?: Date;
  
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const BannerImageSchema = new Schema<IBannerImage>(
  {
    url: { type: String, required: true },
    alt_text: { type: String },
    position: { type: Number, default: 0 },
  },
  { _id: false }
);

const BannerButtonSchema = new Schema<IBannerButton>(
  {
    text: { type: String, required: true },
    url: { type: String, required: true },
    color: { type: String, default: "#000000" },
    text_color: { type: String, default: "#ffffff" },
    position: { type: Number, default: 0 },
  },
  { _id: false }
);

const PromotionalBannerSchema = new Schema<IPromotionalBannerDocument>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String },
    
    background_color: { type: String, default: "#667eea" },
    background_gradient: { type: String },
    text_color: { type: String, default: "#ffffff" },
    
    images: {
      type: [BannerImageSchema],
      default: [],
      validate: {
        validator: function(images: IBannerImage[]) {
          return images.length <= 4;
        },
        message: "Maximum 4 images allowed",
      },
    },
    
    buttons: {
      type: [BannerButtonSchema],
      default: [],
      validate: {
        validator: function(buttons: IBannerButton[]) {
          return buttons.length <= 2;
        },
        message: "Maximum 2 buttons allowed",
      },
    },
    
    target_page: {
      type: String,
      enum: ["home", "categories", "products"],
      default: "home",
      required: true,
      index: true,
    },
    
    position: {
      type: String,
      enum: ["top", "middle", "bottom"],
      required: function(this: IPromotionalBannerDocument) {
        return this.target_page === "categories" || this.target_page === "products";
      },
      index: true,
    },
    
    is_active: { type: Boolean, default: true, index: true },
    sort_order: { type: Number, default: 0, index: true },
    
    display_from: { type: Date },
    display_until: { type: Date },
    
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

PromotionalBannerSchema.index({ target_page: 1, position: 1, sort_order: 1 });
PromotionalBannerSchema.index({ is_active: 1 });

export default mongoose.models.PromotionalBanner || 
  mongoose.model<IPromotionalBannerDocument>("PromotionalBanner", PromotionalBannerSchema);