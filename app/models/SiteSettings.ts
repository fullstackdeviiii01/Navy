// app/models/SiteSettings.ts
import mongoose, { Schema, Document, Model } from "mongoose";

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
  company_info?: ICompanyInfo;
  created_by?: mongoose.Types.ObjectId;
  updated_by?: mongoose.Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

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
  company_info: {
    type: CompanyInfoSchema,
    default: undefined
  },
  created_by: { type: Schema.Types.ObjectId, ref: "User" },
  updated_by: { type: Schema.Types.ObjectId, ref: "User" }
}, {
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
});

export default (mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettingsDocument>("SiteSettings", SiteSettingsSchema)) as Model<ISiteSettingsDocument>;
