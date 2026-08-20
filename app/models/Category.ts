import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  product_count: number;
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    image_url: { type: String },
    is_active: { type: Boolean, default: true, index: true },
    product_count: { type: Number, default: 0, min: 0 },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

CategorySchema.pre("validate", function (next) {
  if (this.isModified("name") && (!this.slug || this.isNew)) {
    this.slug = generateSlug(this.name);
  }
  next();
});

CategorySchema.methods.updateProductCount = async function () {
  const Product = mongoose.models.Product;
  this.product_count = await Product.countDocuments({ category_id: this._id });
  await this.save();
  return this.product_count;
};

export default (mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema)) as Model<ICategoryDocument>;
