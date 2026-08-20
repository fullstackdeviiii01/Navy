// // app/(admin)/components/site-settings/CompanyInfoSettings.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FaSave, FaUpload, FaTrash, FaBuilding, FaClock, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe } from "react-icons/fa";
import { 
  BsFacebook, 
  BsInstagram, 
  BsLinkedin, 
  BsTiktok, 
  BsSnapchat, 
  BsWhatsapp, 
  BsTwitterX, 
  BsGithub, 
  BsYoutube,
  BsPinterest 
} from "react-icons/bs";
import { siteSettingsApi } from "../../../../lib/api/siteSettings";
import Image from "next/image";
import Loader from "../../../components/shared/Loader";

const SOCIAL_PLATFORMS = [
  { key: "facebook", label: "Facebook", icon: BsFacebook, placeholder: "https://facebook.com/yourpage" },
  { key: "instagram", label: "Instagram", icon: BsInstagram, placeholder: "https://instagram.com/yourhandle" },
  { key: "linkedin", label: "LinkedIn", icon: BsLinkedin, placeholder: "https://linkedin.com/company/yourcompany" },
  { key: "tiktok", label: "TikTok", icon: BsTiktok, placeholder: "https://tiktok.com/@yourhandle" },
  { key: "snapchat", label: "Snapchat", icon: BsSnapchat, placeholder: "https://snapchat.com/add/yourhandle" },
  { key: "whatsapp", label: "WhatsApp", icon: BsWhatsapp, placeholder: "https://wa.me/1234567890" },
  { key: "twitter", label: "X (Twitter)", icon: BsTwitterX, placeholder: "https://x.com/yourhandle" },
  { key: "github", label: "GitHub", icon: BsGithub, placeholder: "https://github.com/yourorg" },
  { key: "youtube", label: "YouTube", icon: BsYoutube, placeholder: "https://youtube.com/@yourchannel" },
  { key: "pinterest", label: "Pinterest", icon: BsPinterest, placeholder: "https://pinterest.com/yourhandle" },
];

export default function CompanyInfoSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    company_logo: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_location_link: "",
    company_website: "",
    working_hours: {
      monday: { open: "09:00", close: "18:00", is_open: true },
      tuesday: { open: "09:00", close: "18:00", is_open: true },
      wednesday: { open: "09:00", close: "18:00", is_open: true },
      thursday: { open: "09:00", close: "18:00", is_open: true },
      friday: { open: "09:00", close: "18:00", is_open: true },
      saturday: { open: "10:00", close: "16:00", is_open: true },
      sunday: { open: "00:00", close: "00:00", is_open: false },
    },
    social_media: {
      facebook: "",
      instagram: "",
      linkedin: "",
      tiktok: "",
      snapchat: "",
      whatsapp: "",
      twitter: "",
      github: "",
      youtube: "",
      pinterest: "",
    },
    copyright_text: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await siteSettingsApi.getCompanyInfo();
      
      if (data.company_info) {
        setFormData({
          company_name: data.company_info.company_name || "",
          company_logo: data.company_info.company_logo || "",
          company_email: data.company_info.company_email || "",
          company_phone: data.company_info.company_phone || "",
          company_address: data.company_info.company_address || "",
          company_location_link: data.company_info.company_location_link || "",
          company_website: data.company_info.company_website || "",
          working_hours: data.company_info.working_hours || formData.working_hours,
          social_media: data.company_info.social_media || formData.social_media,
          copyright_text: data.company_info.copyright_text || "",
        });
      }
    } catch (error) {
      console.error("Failed to fetch company info:", error);
      showMessage("error", "Failed to load company information");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showMessage("error", "Invalid file type. Only JPEG, PNG, and WebP are allowed");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showMessage("error", "File size too large. Maximum 2MB allowed");
      return;
    }

    try {
      setUploading(true);
      const data = await siteSettingsApi.uploadCompanyLogo(file);
      setFormData((prev) => ({ ...prev, company_logo: data.url }));
      showMessage("success", "Logo uploaded successfully");
    } catch (error) {
      console.error("Logo upload failed:", error);
      showMessage("error", "Failed to upload logo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, company_logo: "" }));
  };

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [day]: {
          ...prev.working_hours[day as keyof typeof prev.working_hours],
          [field]: value,
        },
      },
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [platform]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await siteSettingsApi.updateCompanyInfo(formData);
      showMessage("success", "Company information saved successfully");
      fetchSettings();
    } catch (error) {
      console.error("Failed to save:", error);
      showMessage("error", "Failed to save company information");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div 
        className="relative h-48 sm:h-64"
        role="status"
        aria-label="Loading company information"
      >
        <Loader />
      </div>
    );
  }

  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      {/* Message Banner */}
      {message && (
        <div
          role="alert"
          className={`p-3 sm:p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Company Basic Info */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <FaBuilding className="text-theme-primary sm:w-5 sm:h-5" size={16} aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Company Information
          </h3>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* Company Logo */}
          <div>
            <label htmlFor="company-logo-upload" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Company Logo
            </label>
            
            {formData.company_logo ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 border-2 border-theme-border-light dark:border-theme-border-dark rounded-lg overflow-hidden bg-white">
                  <Image
                    src={formData.company_logo}
                    alt="Company Logo"
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <button
                  onClick={handleRemoveLogo}
                  className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full sm:w-auto"
                  aria-label="Remove company logo"
                >
                  <FaTrash size={12} className="sm:w-3.5 sm:h-3.5"/>
                  Remove Logo
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <input
                  ref={fileInputRef}
                  id="company-logo-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  aria-label="Upload company logo file"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm w-full sm:w-auto"
                  aria-label="Upload company logo"
                >
                  <FaUpload size={12} className="sm:w-3.5 sm:h-3.5"/>
                  {uploading ? "Uploading..." : "Upload Logo"}
                </button>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Max 2MB. Supported: JPG, PNG, WebP
                </p>
              </div>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="company-name" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Company Name *
            </label>
            <input
              id="company-name"
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
              placeholder="Enter company name"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          {/* Copyright Text */}
          <div>
            <label htmlFor="copyright-text" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Copyright Text
            </label>
            <input
              id="copyright-text"
              type="text"
              value={formData.copyright_text}
              onChange={(e) => setFormData((prev) => ({ ...prev, copyright_text: e.target.value }))}
              placeholder="© 2024 Your Company. All rights reserved."
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <FaEnvelope className="text-theme-primary sm:w-5 sm:h-5" size={16} aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Contact Information
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="company-email" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Email Address
            </label>
            <input
              id="company-email"
              type="email"
              value={formData.company_email}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_email: e.target.value }))}
              placeholder="info@company.com"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="company-phone" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Phone Number
            </label>
            <input
              id="company-phone"
              type="tel"
              value={formData.company_phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_phone: e.target.value }))}
              placeholder="+1 (234) 567-8900"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="company-website" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Website URL
            </label>
            <input
              id="company-website"
              type="url"
              value={formData.company_website}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_website: e.target.value }))}
              placeholder="https://www.company.com"
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="company-location-link" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Google Maps Link
            </label>
            <input
              id="company-location-link"
              type="url"
              value={formData.company_location_link}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_location_link: e.target.value }))}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="company-address" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Physical Address
            </label>
            <textarea
              id="company-address"
              value={formData.company_address}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_address: e.target.value }))}
              placeholder="123 Business Street, City, State, ZIP"
              rows={3}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <FaClock className="text-theme-primary sm:w-5 sm:h-5" size={16} aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Working Hours
          </h3>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {daysOfWeek.map((day) => {
            const dayData = formData.working_hours[day as keyof typeof formData.working_hours];
            return (
              <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="w-full sm:w-28">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dayData.is_open}
                      onChange={(e) => handleWorkingHoursChange(day, "is_open", e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark capitalize">
                      {day}
                    </span>
                  </label>
                </div>

                {dayData.is_open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={dayData.open}
                      onChange={(e) => handleWorkingHoursChange(day, "open", e.target.value)}
                      className="px-2 sm:px-3 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
                      aria-label={`Opening time for ${day}`}
                    />
                    <span className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">to</span>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => handleWorkingHoursChange(day, "close", e.target.value)}
                      className="px-2 sm:px-3 py-1 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
                      aria-label={`Closing time for ${day}`}
                    />
                  </div>
                ) : (
                  <span className="text-xs sm:text-sm text-red-600 dark:text-red-400">Closed</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg sm:rounded-lg p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <FaGlobe className="text-theme-primary sm:w-5 sm:h-5" size={16} aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Social Media Links
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const inputId = `social-${platform.key}`;
            return (
              <div key={platform.key}>
                <label htmlFor={inputId} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                  <Icon size={14} className="sm:w-4 sm:h-4" aria-hidden="true" />
                  {platform.label}
                </label>
                <input
                  id={inputId}
                  type="url"
                  value={formData.social_media[platform.key as keyof typeof formData.social_media]}
                  onChange={(e) => handleSocialMediaChange(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs sm:text-sm w-full sm:w-auto"
          aria-label="Save company information"
        >
          <FaSave size={14} className="sm:w-4 sm:h-4"/>
          {saving ? "Saving..." : "Save Company Information"}
        </button>
      </div>
    </div>
  );
}