// app/models/SiteSettings.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomeComponent {
  component_key: string;
  component_type: 'static' | 'banner';
  banner_id?: mongoose.Types.ObjectId;
  display_name: string;
  is_visible: boolean;
  sort_order: number;
}

export interface IStaticPageConfig {
  page_key: string;
  page_name: string;
  page_path: string;
  is_visible: boolean;
  meta_title?: string;
  meta_description?: string;
}

export interface IWorkingHours {
  monday: { open: string; close: string; is_open: boolean };
  tuesday: { open: string; close: string; is_open: boolean };
  wednesday: { open: string; close: string; is_open: boolean };
  thursday: { open: string; close: string; is_open: boolean };
  friday: { open: string; close: string; is_open: boolean };
  saturday: { open: string; close: string; is_open: boolean };
  sunday: { open: string; close: string; is_open: boolean };
}

export interface ISocialMedia {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  tiktok?: string;
  snapchat?: string;
  whatsapp?: string;
  twitter?: string;
  github?: string;
  youtube?: string;
  pinterest?: string;
}

export interface ICompanyInfo {
  company_name?: string;
  company_logo?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  company_location_link?: string;
  company_website?: string;
  working_hours?: IWorkingHours;
  social_media?: ISocialMedia;
  copyright_text?: string;
}

export interface ISiteSettingsDocument extends Document {
  is_global_settings: boolean;
  
  // Dynamic page fields
  title?: string;
  slug: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
  is_active?: boolean;
  sort_order?: number;
  page_type?: "terms" | "privacy" | "refund" | "shipping" | "about" | "licensing" | "custom";
  
  // Global settings
  home_meta_title?: string;
  home_meta_description?: string;
  home_components?: IHomeComponent[];
  static_pages?: IStaticPageConfig[];
  company_info?: ICompanyInfo;
  
  created_by?: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

const HomeComponentSchema = new Schema<IHomeComponent>({
  component_key: { type: String, required: true },
  component_type: { type: String, enum: ['static', 'banner'], required: true },
  banner_id: { type: Schema.Types.ObjectId, ref: 'PromotionalBanner' },
  display_name: { type: String, required: true },
  is_visible: { type: Boolean, default: true },
  sort_order: { type: Number, default: 0 }
}, { _id: false });

const StaticPageConfigSchema = new Schema<IStaticPageConfig>({
  page_key: { type: String, required: true },
  page_name: { type: String, required: true },
  page_path: { type: String, required: true },
  is_visible: { type: Boolean, default: true },
  meta_title: { type: String },
  meta_description: { type: String }
}, { _id: false });

const WorkingHoursEntrySchema = new Schema({
  open: { type: String, default: "09:00" },
  close: { type: String, default: "18:00" },
  is_open: { type: Boolean, default: true }
}, { _id: false });

const WorkingHoursSchema = new Schema<IWorkingHours>({
  monday: { type: WorkingHoursEntrySchema, default: { open: "09:00", close: "18:00", is_open: true } },
  tuesday: { type: WorkingHoursEntrySchema, default: { open: "09:00", close: "18:00", is_open: true } },
  wednesday: { type: WorkingHoursEntrySchema, default: { open: "09:00", close: "18:00", is_open: true } },
  thursday: { type: WorkingHoursEntrySchema, default: { open: "09:00", close: "18:00", is_open: true } },
  friday: { type: WorkingHoursEntrySchema, default: { open: "09:00", close: "18:00", is_open: true } },
  saturday: { type: WorkingHoursEntrySchema, default: { open: "10:00", close: "16:00", is_open: true } },
  sunday: { type: WorkingHoursEntrySchema, default: { open: "00:00", close: "00:00", is_open: false } }
}, { _id: false });

const SocialMediaSchema = new Schema<ISocialMedia>({
  facebook: { type: String },
  instagram: { type: String },
  linkedin: { type: String },
  tiktok: { type: String },
  snapchat: { type: String },
  whatsapp: { type: String },
  twitter: { type: String },
  github: { type: String },
  youtube: { type: String },
  pinterest: { type: String }
}, { _id: false });

const CompanyInfoSchema = new Schema<ICompanyInfo>({
  company_name: { type: String },
  company_logo: { type: String },
  company_email: { type: String },
  company_phone: { type: String },
  company_address: { type: String },
  company_location_link: { type: String },
  company_website: { type: String },
  working_hours: { type: WorkingHoursSchema },
  social_media: { type: SocialMediaSchema },
  copyright_text: { type: String }
}, { _id: false });

const SiteSettingsSchema = new Schema<ISiteSettingsDocument>({
  is_global_settings: { type: Boolean, default: false, index: true },
  
  title: { 
    type: String, 
    trim: true,
    required: function(this: ISiteSettingsDocument) { return !this.is_global_settings; }
  },
  slug: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true, 
    lowercase: true, 
    trim: true 
  },
  content: { 
    type: String,
    required: function(this: ISiteSettingsDocument) { return !this.is_global_settings; }
  },
  meta_title: { type: String, trim: true },
  meta_description: { type: String, trim: true },
  is_active: { type: Boolean, default: true, index: true },
  sort_order: { type: Number, default: 0 },
  page_type: {
    type: String,
    enum: ["terms", "privacy", "refund", "shipping", "about", "licensing", "custom"],
    index: true
  },
  
  home_meta_title: { type: String, trim: true },
  home_meta_description: { type: String, trim: true },
  home_components: {
    type: [HomeComponentSchema],
    default: undefined
  },
  static_pages: {
    type: [StaticPageConfigSchema],
    default: undefined
  },
  company_info: {
    type: CompanyInfoSchema,
    default: undefined
  },
  
  created_by: { type: Schema.Types.ObjectId, ref: "User" },
  updated_by: { type: Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

SiteSettingsSchema.index({ slug: 1, is_active: 1 });
SiteSettingsSchema.index({ page_type: 1, is_active: 1 });

export default (mongoose.models.SiteSettings || 
  mongoose.model<ISiteSettingsDocument>("SiteSettings", SiteSettingsSchema)) as Model<ISiteSettingsDocument>;