// app/(admin)/atelier-config/components/BrandIdentityStudio.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Upload,
  Trash2,
  Check,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { BsInstagram, BsFacebook, BsPinterest, BsWhatsapp } from "react-icons/bs";
import { siteSettingsApi } from "../../../../lib/api/siteSettings";
import Image from "next/image";
import Loader from "../../../components/shared/Loader";

const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: BsInstagram, placeholder: "https://instagram.com/rehanwoodenlamps" },
  { key: "facebook", label: "Facebook", icon: BsFacebook, placeholder: "https://facebook.com/rehanwoodenlamps" },
  { key: "pinterest", label: "Pinterest", icon: BsPinterest, placeholder: "https://pinterest.com/rehanwoodenlamps" },
  { key: "whatsapp", label: "WhatsApp Concierge", icon: BsWhatsapp, placeholder: "https://wa.me/923130538686" },
];

export default function BrandIdentityStudio() {
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
      showMessage("error", "Failed to load company profile.");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      showMessage("error", "Invalid format. Only PNG, WebP, and JPEG are supported.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showMessage("error", "File size too large. Max 2MB allowed.");
      return;
    }

    try {
      setUploading(true);
      const data = await siteSettingsApi.uploadCompanyLogo(file);
      setFormData((prev) => ({ ...prev, company_logo: data.url }));
      showMessage("success", "Brand emblem updated successfully.");
    } catch (error) {
      showMessage("error", "Failed to upload logo emblem.");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await siteSettingsApi.updateCompanyInfo(formData);
      showMessage("success", "Atelier identity and configuration saved.");
      fetchSettings();
    } catch (error) {
      showMessage("error", "Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
        <Loader />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Toast Notification */}
      {message && (
        <div className="fixed top-5 right-5 z-50 max-w-sm animate-in slide-in-from-top-3">
          {message.type === "error" ? (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-rose-800 dark:text-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{message.text}</span>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-lg flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{message.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Brand Identity & Emblem */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Atelier Identity & Brand Emblem
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Primary brand assets displayed across storefront navigation and customer receipts.
            </p>
          </div>
        </div>

        {/* Logo Section */}
        <div className="pt-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-2">
            Storefront Brand Emblem / Logo
          </label>

          {formData.company_logo ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="relative w-28 h-28 border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden bg-white/90 p-2 shadow-xs">
                <Image
                  src={formData.company_logo}
                  alt="Company Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Custom Logo</span>
                </button>
                <p className="text-[11px] text-theme-text-muted-light">
                  Removing logo will fallback to luxury typographic monogram (R | L).
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold shadow-xs disabled:opacity-50 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? "Uploading..." : "Upload Brand Emblem"}</span>
              </button>
              <span className="text-[11px] text-theme-text-muted-light">
                PNG or WebP with transparent background recommended (Max 2MB).
              </span>
            </div>
          )}
        </div>

        {/* Brand Name & Copyright */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Artisan Atelier Brand Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_name: e.target.value,
                }))
              }
              placeholder="REHAN WOODEN LAMPS"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Footer Legal Copyright Statement
            </label>
            <input
              type="text"
              value={formData.copyright_text}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  copyright_text: e.target.value,
                }))
              }
              placeholder="© 2026 Rehan Wooden Lamps. Handcrafted in Pakistan."
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>
        </div>
      </div>

      {/* Concierge Contact Details */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Patron Concierge & Studio Coordinates
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Contact coordinates published in storefront header, footer, and invoices.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Concierge Email Address
            </label>
            <input
              type="email"
              value={formData.company_email}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_email: e.target.value,
                }))
              }
              placeholder="concierge@rehanlamps.com"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Client Support Telephone
            </label>
            <input
              type="tel"
              value={formData.company_phone}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_phone: e.target.value,
                }))
              }
              placeholder="+92 313 0538686"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Official Website Domain URL
            </label>
            <input
              type="url"
              value={formData.company_website}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_website: e.target.value,
                }))
              }
              placeholder="https://rehanwoodenlamps.com"
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Google Maps Atelier Link
            </label>
            <input
              type="url"
              value={formData.company_location_link}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_location_link: e.target.value,
                }))
              }
              placeholder="https://maps.google.com/?q=..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
              Workshop / Studio Physical Address
            </label>
            <textarea
              rows={2}
              value={formData.company_address}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  company_address: e.target.value,
                }))
              }
              placeholder="Woodworking Atelier & Showroom, Industrial Estate, Lahore, Pakistan"
              className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>
        </div>
      </div>

      {/* Social Media Networks */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-5 sm:p-6 border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
          <div className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Social Media Channels
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Connect external gallery feeds and WhatsApp instant concierge.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SOCIAL_PLATFORMS.map((platform) => {
            const Icon = platform.icon;
            return (
              <div key={platform.key}>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light mb-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{platform.label}</span>
                </label>
                <input
                  type="url"
                  value={formData.social_media[platform.key as keyof typeof formData.social_media] || ""}
                  onChange={(e) => handleSocialMediaChange(platform.key, e.target.value)}
                  placeholder={platform.placeholder}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <Check className="w-3.5 h-3.5" />
          <span>{saving ? "Saving Changes..." : "Commit Atelier Configuration"}</span>
        </button>
      </div>
    </form>
  );
}
