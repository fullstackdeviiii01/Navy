// app/(admin)/components/promotional-banners/BannerModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import { promotionalBannersApi } from "../../../../lib/api/promotionalBanners";
import { GRADIENT_PRESETS } from "../../../../types/banner.types";

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  banner?: any;
  mode: "add" | "edit";
}

export default function BannerModal({
  isOpen,
  onClose,
  onSuccess,
  banner,
  mode,
}: BannerModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    background_color: "#667eea",
    background_gradient: "",
    text_color: "#ffffff",
    target_page: "home",
    position: "top",
    is_active: true,
    display_from: "",
    display_until: "",
    images: [] as any[],
    buttons: [] as any[],
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && banner) {
        populateFormData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, banner, mode]);

  const populateFormData = () => {
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      background_color: banner.background_color || "#667eea",
      background_gradient: banner.background_gradient || "",
      text_color: banner.text_color || "#ffffff",
      target_page: banner.target_page || "home",
      position: banner.position || "top",
      is_active: banner.is_active !== undefined ? banner.is_active : true,
      display_from: banner.display_from ? new Date(banner.display_from).toISOString().slice(0, 16) : "",
      display_until: banner.display_until ? new Date(banner.display_until).toISOString().slice(0, 16) : "",
      images: banner.images || [],
      buttons: banner.buttons || [],
    });
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    if (formData.images.length >= 4) {
      alert("Maximum 4 images allowed");
      return;
    }

    const file = e.target.files[0];
    setUploadingImage(true);
    
    try {
      const data = await promotionalBannersApi.uploadImage(file);
      setFormData({
        ...formData,
        images: [...formData.images, { url: data.imageUrl, alt_text: "", position: formData.images.length }],
      });
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const updatedImages = [...formData.images];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setFormData({ ...formData, images: updatedImages });
  };

  const addButton = () => {
    if (formData.buttons.length >= 2) {
      alert("Maximum 2 buttons allowed");
      return;
    }
    setFormData({
      ...formData,
      buttons: [
        ...formData.buttons,
        { text: "", url: "", color: "#000000", text_color: "#ffffff", position: formData.buttons.length },
      ],
    });
  };

  const removeButton = (index: number) => {
    setFormData({
      ...formData,
      buttons: formData.buttons.filter((_, i) => i !== index),
    });
  };

  const updateButton = (index: number, field: string, value: string) => {
    const updatedButtons = [...formData.buttons];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    setFormData({ ...formData, buttons: updatedButtons });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: any = { ...formData };
      
      // Only include position for categories/products pages
      if (formData.target_page === "home") {
        delete submitData.position;
      }

      if (mode === "edit" && banner) {
        await promotionalBannersApi.update(banner._id, submitData);
      } else {
        await promotionalBannersApi.create(submitData);
      }

      onSuccess();
      resetForm();
      onClose();
    } catch (error: any) {
      console.error(`Failed to ${mode} banner:`, error);
      alert(error.message || `Failed to ${mode} banner`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      background_color: "#667eea",
      background_gradient: "",
      text_color: "#ffffff",
      target_page: "home",
      position: "top",
      is_active: true,
      display_from: "",
      display_until: "",
      images: [],
      buttons: [],
    });
  };

  if (!isOpen) return null;

  const showPositionField = formData.target_page === "categories" || formData.target_page === "products";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="banner-modal-title"
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-3 sm:p-4 md:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
          <h3 id="banner-modal-title" className="text-base sm:text-lg md:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            {mode === "edit" ? "Edit Banner" : "Add New Banner"}
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            aria-label="Close modal"
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark text-lg sm:text-xl flex-shrink-0"
          >
            <FaTimes size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
          {/* Basic Info */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-medium text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Basic Information
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div>
                <label htmlFor="bannerTitle" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Title *
                </label>
                <input
                  id="bannerTitle"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Summer Sale"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>

              <div>
                <label htmlFor="bannerSubtitle" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Subtitle
                </label>
                <input
                  id="bannerSubtitle"
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g., Up to 50% Off"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>
            </div>

            <div>
              <label htmlFor="bannerDescription" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Description
              </label>
              <textarea
                id="bannerDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                placeholder="Additional description..."
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Targeting */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-medium text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Target Page & Position
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div>
                <label htmlFor="targetPage" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Target Page *
                </label>
                <select
                  id="targetPage"
                  required
                  value={formData.target_page}
                  onChange={(e) => setFormData({ ...formData, target_page: e.target.value as any })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                >
                  <option value="home">Home</option>
                  <option value="categories">Categories</option>
                  <option value="products">Products</option>
                </select>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                  {formData.target_page === 'home' && 'Position is managed in Site Settings → Home Page'}
                  {formData.target_page === 'categories' && 'Select position below for categories page'}
                  {formData.target_page === 'products' && 'Select position below for products page'}
                </p>
              </div>

              {showPositionField && (
                <div>
                  <label htmlFor="bannerPosition" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                    Position *
                  </label>
                  <select
                    id="bannerPosition"
                    required
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                  >
                    <option value="top">Top (Before content)</option>
                    <option value="middle">Middle (Between content)</option>
                    <option value="bottom">Bottom (After content)</option>
                  </select>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                    Where to display this banner on the page
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Styling */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-medium text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Styling
            </h4>
            
            <div>
              <span className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2 sm:mb-3">
                Gradient Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
                {GRADIENT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, background_gradient: preset.value })}
                    className={`relative h-16 sm:h-20 rounded-lg border-2 transition-all ${
                      formData.background_gradient === preset.value
                        ? "border-theme-primary shadow-lg scale-105"
                        : "border-theme-border-light dark:border-theme-border-dark hover:border-theme-primary"
                    }`}
                    style={{ background: preset.value }}
                    aria-label={preset.label}
                  >
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] sm:text-[10px] bg-white dark:bg-gray-800 rounded px-0.5 sm:px-1 py-0.5 text-center truncate">
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
              <div>
                <label htmlFor="bgColor" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Background Color
                </label>
                <input
                  id="bgColor"
                  type="color"
                  value={formData.background_color}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  className="w-full h-8 sm:h-10 rounded-lg border border-theme-border-light dark:border-theme-border-dark cursor-pointer"
                />
              </div>

              <div>
                <label htmlFor="textColor" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Text Color
                </label>
                <input
                  id="textColor"
                  type="color"
                  value={formData.text_color}
                  onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  className="w-full h-8 sm:h-10 rounded-lg border border-theme-border-light dark:border-theme-border-dark cursor-pointer"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <label htmlFor="customGradient" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Custom Gradient
                </label>
                <input
                  id="customGradient"
                  type="text"
                  value={formData.background_gradient}
                  onChange={(e) => setFormData({ ...formData, background_gradient: e.target.value })}
                  placeholder="CSS gradient value"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h4 className="font-medium text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Images (Max 4)
              </h4>
              <label
                htmlFor="imageUpload"
                className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg cursor-pointer hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm w-full sm:w-auto ${
                  formData.images.length >= 4 || uploadingImage ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={formData.images.length >= 4 || uploadingImage}
                />
                {uploadingImage ? "Uploading..." : "Add Image"}
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={image.url}
                    alt=""
                    className="w-full h-24 sm:h-28 md:h-32 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    aria-label={`Remove image ${index + 1}`}
                    className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-600 text-white p-1 sm:p-1.5 rounded-full hover:bg-red-700 text-xs"
                  >
                    <FaTrash size={10} className="sm:w-3 sm:h-3" />
                  </button>
                  <label htmlFor={`imageAlt-${index}`} className="sr-only">
                    Alt text for image {index + 1}
                  </label>
                  <input
                    id={`imageAlt-${index}`}
                    type="text"
                    placeholder="Alt text"
                    value={image.alt_text}
                    onChange={(e) => updateImage(index, "alt_text", e.target.value)}
                    className="mt-1 sm:mt-2 w-full px-1.5 sm:px-2 py-1 text-xs border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h4 className="font-medium text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Buttons (Max 2)
              </h4>
              <button
                type="button"
                onClick={addButton}
                disabled={formData.buttons.length >= 2}
                className="px-2 sm:px-3 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs sm:text-sm w-full sm:w-auto"
              >
                Add Button
              </button>
            </div>

            {formData.buttons.map((button, index) => (
              <div key={index} className="p-2 sm:p-3 border border-theme-border-light dark:border-theme-border-dark rounded-lg space-y-2 sm:space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    Button {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeButton(index)}
                    className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <label htmlFor={`buttonText-${index}`} className="sr-only">
                      Button {index + 1} text
                    </label>
                    <input
                      id={`buttonText-${index}`}
                      type="text"
                      placeholder="Button text"
                      value={button.text}
                      onChange={(e) => updateButton(index, "text", e.target.value)}
                      required
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor={`buttonUrl-${index}`} className="sr-only">
                      Button {index + 1} URL
                    </label>
                    <input
                      id={`buttonUrl-${index}`}
                      type="url"
                      placeholder="Button URL"
                      value={button.url}
                      onChange={(e) => updateButton(index, "url", e.target.value)}
                      required
                      className="px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor={`buttonColor-${index}`} className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Button Color
                    </label>
                    <input
                      id={`buttonColor-${index}`}
                      type="color"
                      value={button.color}
                      onChange={(e) => updateButton(index, "color", e.target.value)}
                      className="w-full h-8 sm:h-10 rounded-lg border border-theme-border-light dark:border-theme-border-dark cursor-pointer"
                    />
                  </div>

                  <div>
                    <label htmlFor={`buttonTextColor-${index}`} className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
                      Text Color
                    </label>
                    <input
                      id={`buttonTextColor-${index}`}
                      type="color"
                      value={button.text_color}
                      onChange={(e) => updateButton(index, "text_color", e.target.value)}
                      className="w-full h-8 sm:h-10 rounded-lg border border-theme-border-light dark:border-theme-border-dark cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Status & Scheduling */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="font-medium text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Status & Scheduling
            </h4>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded mr-2 w-4 h-4"
              />
              <label htmlFor="is_active" className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Active
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div>
                <label htmlFor="displayFrom" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Display From
                </label>
                <input
                  id="displayFrom"
                  type="datetime-local"
                  value={formData.display_from}
                  onChange={(e) => setFormData({ ...formData, display_from: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>

              <div>
                <label htmlFor="displayUntil" className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                  Display Until
                </label>
                <input
                  id="displayUntil"
                  type="datetime-local"
                  value={formData.display_until}
                  onChange={(e) => setFormData({ ...formData, display_until: e.target.value })}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors text-xs sm:text-sm w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm w-full sm:w-auto"
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : uploadingImage
                ? "Uploading..."
                : mode === "edit"
                ? "Update Banner"
                : "Create Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}