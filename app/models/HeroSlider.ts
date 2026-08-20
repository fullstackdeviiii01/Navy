// app/models/HeroSlider.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IHeroSliderDocument extends Document {
  title: string;
  subtitle: string;
  description?: string;
  button_text: string;
  button_url: string;
  image_url: string;
  background_gradient: string;
  sort_order: number;
  is_active: boolean;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const HeroSliderSchema = new Schema<IHeroSliderDocument>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    button_text: { type: String, required: true, default: "SHOP NOW" },
    button_url: { type: String, required: true },
    image_url: { type: String, required: true },
    background_gradient: {
      type: String,
      default: "bg-gradient-to-r from-yellow-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300",
    },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true, index: true },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

HeroSliderSchema.index({ sort_order: 1, is_active: 1 });

export default mongoose.models.HeroSlider || mongoose.model<IHeroSliderDocument>("HeroSlider", HeroSliderSchema);
