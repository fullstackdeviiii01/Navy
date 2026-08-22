// app/models/SiteSettings.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISocialMedia {
  instagram?: string;
  facebook?: string;
  pinterest?: string;
  whatsapp?: string;
}

export interface ICompanyInfo {
  company_name?: string;
  company_logo?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_location_link?: string;
  company_website?: string;
  social_media?: ISocialMedia;
  copyright_text?: string;
}

export interface ISiteSettingsDocument extends Document {
  is_global_settings: boolean;
  company_info?: ICompanyInfo;
  created_by?: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const SocialMediaSchema = new Schema<ISocialMedia>(
  {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    pinterest: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
  },
  { _id: false }
);

const CompanyInfoSchema = new Schema<ICompanyInfo>(
  {
    company_name: { type: String, trim: true },
    company_logo: { type: String },
    company_email: { type: String, trim: true },
    company_phone: { type: String, trim: true },
    company_address: { type: String, trim: true },
    company_location_link: { type: String, trim: true },
    company_website: { type: String, trim: true },
    social_media: { type: SocialMediaSchema, default: {} },
    copyright_text: { type: String, trim: true },
  },
  { _id: false }
);

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>(
  {
    is_global_settings: { type: Boolean, default: false, index: true },
    company_info: {
      type: CompanyInfoSchema,
      default: undefined,
    },
    created_by: { type: Schema.Types.ObjectId, ref: "User" },
    updated_by: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

export default (mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettingsDocument>("SiteSettings", SiteSettingsSchema)) as Model<ISiteSettingsDocument>;

