import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttributeOption {
  label: string;
  value: string;
}

export interface ICategoryAttribute {
  _id?: mongoose.Types.ObjectId;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'checkbox' | 'textarea' | 'date';
  required: boolean;
  options?: IAttributeOption[];
  placeholder?: string;
  description?: string;
  sort_order: number;
}

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  meta_title?: string;
  meta_description?: string;
  product_count: number;
  attributes: ICategoryAttribute[];
  created_by: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const AttributeOptionSchema = new Schema<IAttributeOption>(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const CategoryAttributeSchema = new Schema<ICategoryAttribute>(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'select', 'multiselect', 'checkbox', 'textarea', 'date'],
      required: true,
    },
    required: { type: Boolean, default: false },
    options: [AttributeOptionSchema],
    placeholder: { type: String },
    description: { type: String },
    sort_order: { type: Number, default: 0 },
  },
  { _id: true }
);

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    image_url: { type: String },
    icon: { type: String },
    sort_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true, index: true },
    is_featured: { type: Boolean, default: false },
    meta_title: { type: String },
    meta_description: { type: String },
    product_count: { type: Number, default: 0, min: 0 },
    attributes: [CategoryAttributeSchema],
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

CategorySchema.index({ sort_order: 1 });

CategorySchema.methods.updateProductCount = async function() {
  const Product = mongoose.models.Product;
  this.product_count = await Product.countDocuments({ category_id: this._id });
  await this.save();
  return this.product_count;
};

export default (mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema)) as Model<ICategoryDocument>;