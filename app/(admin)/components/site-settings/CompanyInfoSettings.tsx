// app/(admin)/components/site-settings/CompanyInfoSettings.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FaSave, FaUpload, FaTrash, FaBuilding, FaEnvelope, FaGlobe } from "react-icons/fa";
import { 
  BsInstagram, 
  BsFacebook, 
  BsPinterest, 
  BsWhatsapp 
} from "react-icons/bs";
import { siteSettingsApi } from "../../../../lib/api/siteSettings";
import Image from "next/image";
import Loader from "../../../components/shared/Loader";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: BsInstagram, placeholder: "https://instagram.com/yourhandle" },
  { key: "facebook", label: "Facebook", icon: BsFacebook, placeholder: "https://facebook.com/yourpage" },
  { key: "pinterest", label: "Pinterest", icon: BsPinterest, placeholder: "https://pinterest.com/yourhandle" },
  { key: "whatsapp", label: "WhatsApp", icon: BsWhatsapp, placeholder: "https://wa.me/923130538686" },
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
    social_media: {
      instagram: "",
      facebook: "",
      pinterest: "",
      whatsapp: "",
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
          social_media: {
            instagram: data.company_info.social_media?.instagram || "",
            facebook: data.company_info.social_media?.facebook || "",
            pinterest: data.company_info.social_media?.pinterest || "",
            whatsapp: data.company_info.social_media?.whatsapp || "",
          },
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

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 max-w-5xl">
      {/* Message Banner */}
      {message && (
        <div
          role="alert"
          className={`p-3 sm:p-4 rounded-lg text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Company Basic Info */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 border border-theme-border-light dark:border-theme-border-dark space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <FaBuilding className="text-theme-primary sm:w-5 sm:h-5" size={16} aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Brand Identity & Logo
          </h3>
        </div>

        <div className="space-y-4">
          {/* Company Logo */}
          <div>
            <label htmlFor="company-logo-upload" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Brand Logo
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
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full sm:w-auto"
                    aria-label="Remove company logo"
                  >
                    <FaTrash size={12} className="sm:w-3.5 sm:h-3.5"/>
                    Remove Logo
                  </button>
                  <p className="text-[11px] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    Removing the logo will fallback to the luxury monogram emblem (R | L).
                  </p>
                </div>
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
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm w-full sm:w-auto"
                  aria-label="Upload company logo"
                >
                  <FaUpload size={12} className="sm:w-3.5 sm:h-3.5"/>
                  {uploading ? "Uploading..." : "Upload Brand Logo"}
                </button>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  Max 2MB. Recommended format: PNG or WebP with transparent background.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {/* Company Name */}
            <div>
              <label htmlFor="company-name" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Brand / Store Name *
              </label>
              <input
                id="company-name"
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData((prev) => ({ ...prev, company_name: e.target.value }))}
                placeholder="REHAN WOODEN LAMPS"
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
              />
            </div>

            {/* Copyright Text */}
            <div>
              <label htmlFor="copyright-text" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Footer Copyright Text
              </label>
              <input
                id="copyright-text"
                type="text"
                value={formData.copyright_text}
                onChange={(e) => setFormData((prev) => ({ ...prev, copyright_text: e.target.value }))}
                placeholder="© 2026 Rehan Wooden Lamps. All rights reserved."
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 border border-theme-border-light dark:border-theme-border-dark space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <FaEnvelope className="text-theme-primary sm:w-5 sm:h-5" size={16} aria-hidden="true" />
          <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Direct Concierge & Contact Details
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label htmlFor="company-email" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Direct Email Address
            </label>
            <input
              id="company-email"
              type="email"
              value={formData.company_email}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_email: e.target.value }))}
              placeholder="concierge@rehanlamps.com"
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="company-phone" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Customer Support Phone
            </label>
            <input
              id="company-phone"
              type="tel"
              value={formData.company_phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_phone: e.target.value }))}
              placeholder="+92 313 0538686"
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="company-website" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Official Website URL
            </label>
            <input
              id="company-website"
              type="url"
              value={formData.company_website}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_website: e.target.value }))}
              placeholder="https://rehanwoodenlamps.com"
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="company-location-link" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Google Maps Location Link
            </label>
            <input
              id="company-location-link"
              type="url"
              value={formData.company_location_link}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_location_link: e.target.value }))}
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="company-address" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Workshop / Studio Physical Address
            </label>
            <textarea
              id="company-address"
              value={formData.company_address}
              onChange={(e) => setFormData((prev) => ({ ...prev, company_address: e.target.value }))}
              placeholder="Studio Workshop, Industrial Estate, Lahore, Pakistan"
              rows={3}
              className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Top 4 Social Media Channels */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 border border-theme-border-light dark:border-theme-border-dark space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <FaGlobe className="text-theme-primary sm:w-5 sm:h-5" size={16} aria-hidden="true" />
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Social Media Channels
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Configured links will automatically appear in the storefront footer.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            const inputId = `social-${platform.key}`;
            return (
              <div key={platform.key}>
                <label htmlFor={inputId} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                  <Icon size={14} className="sm:w-4 sm:h-4 text-theme-primary" aria-hidden="true" />
                  <span>{platform.label}</span>
                </label>
                <input
                  id={inputId}
                  type="url"
                  value={formData.social_media[platform.key as keyof typeof formData.social_media] || ""}
                  onChange={(e) => handleSocialMediaChange(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary text-xs sm:text-sm"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-5 sm:px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-xs sm:text-sm w-full sm:w-auto shadow-sm"
          aria-label="Save site settings"
        >
          <FaSave size={14} className="sm:w-4 sm:h-4"/>
          <span>{saving ? "Saving Changes..." : "Save Site Settings"}</span>
        </button>
      </div>
    </div>
  );
}