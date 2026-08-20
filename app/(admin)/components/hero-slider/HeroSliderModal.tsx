// // components/hero-slider/HeroSliderModal.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes, FaUpload, FaTrash } from "react-icons/fa";
import { heroSliderApi } from "../../../../lib/api/heroSlider";
import HeroSliderGradientOptions from "./HeroSliderGradientOptions";

interface HeroSliderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  slide?: any;
  mode: "add" | "edit";
}

const GRADIENT_OPTIONS = [
  {
    value: "bg-gradient-to-r from-yellow-50 to-pink-50 dark:from-gray-700 dark:to-gray-800",
    label: "Yellow to Pink",
    preview: "linear-gradient(to right, #fefce8, #fce7f3)",
  },
  {
    value: "bg-gradient-to-r from-pink-50 to-blue-50 dark:from-gray-700 dark:to-gray-800",
    label: "Pink to Blue",
    preview: "linear-gradient(to right, #fce7f3, #eff6ff)",
  },
  {
    value: "bg-gradient-to-r from-blue-50 to-yellow-50 dark:from-gray-700 dark:to-gray-800",
    label: "Blue to Yellow",
    preview: "linear-gradient(to right, #eff6ff, #fefce8)",
  },
  {
    value: "bg-gradient-to-r from-green-50 to-teal-50 dark:from-gray-700 dark:to-gray-800",
    label: "Green to Teal",
    preview: "linear-gradient(to right, #f0fdf4, #f0fdfa)",
  },
  {
    value: "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800",
    label: "Purple to Pink",
    preview: "linear-gradient(to right, #faf5ff, #fce7f3)",
  },
  {
    value: "bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-700 dark:to-gray-800",
    label: "Orange to Red",
    preview: "linear-gradient(to right, #fff7ed, #fef2f2)",
  },
  {
    value: "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-800",
    label: "Indigo to Purple",
    preview: "linear-gradient(to right, #eef2ff, #faf5ff)",
  },
  {
    value: "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-700 dark:to-gray-800",
    label: "Gray to Slate",
    preview: "linear-gradient(to right, #f9fafb, #f8fafc)",
  },
];

export default function HeroSliderModal({
  isOpen,
  onClose,
  onSuccess,
  slide,
  mode,
}: HeroSliderModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    button_text: "SHOP NOW",
    button_url: "",
    image_url: "",
    background_gradient: GRADIENT_OPTIONS[0].value,
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && slide) {
        populateFormData();
      } else {
        resetForm();
      }
    }
  }, [isOpen, slide, mode]);

  const populateFormData = () => {
    setFormData({
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      description: slide.description || "",
      button_text: slide.button_text || "SHOP NOW",
      button_url: slide.button_url || "",
      image_url: slide.image_url || "",
      background_gradient: slide.background_gradient || GRADIENT_OPTIONS[0].value,
      sort_order: slide.sort_order || 0,
      is_active: slide.is_active !== undefined ? slide.is_active : true,
    });
    setImagePreview(slide.image_url || "");
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setImagePreview(URL.createObjectURL(file));

    setUploadingImage(true);
    try {
      const data = await heroSliderApi.uploadImage(file);
      setFormData({ ...formData, image_url: data.imageUrl });
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image");
      setImagePreview("");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "edit" && slide) {
        await heroSliderApi.update(slide._id, formData);
      } else {
        await heroSliderApi.create(formData);
      }

      onSuccess();
      resetForm();
      onClose();
    } catch (error: any) {
      console.error(`Failed to ${mode} slide:`, error);
      alert(error.message || `Failed to ${mode} slide`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      button_text: "SHOP NOW",
      button_url: "",
      image_url: "",
      background_gradient: GRADIENT_OPTIONS[0].value,
      sort_order: 0,
      is_active: true,
    });
    setImagePreview("");
  };

  if (!isOpen) return null;

  const headingId = "hero-slider-modal-heading";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-2 sm:p-3 lg:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
    >
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-3 sm:p-4 lg:p-6 max-w-2xl lg:max-w-3xl w-full mx-2 sm:mx-4 my-2 sm:my-4 lg:my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4 lg:mb-6">
          <h3
            id={headingId}
            className="text-base sm:text-lg lg:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark"
          >
            {mode === "edit" ? "Edit Hero Slide" : "Add New Hero Slide"}
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light dark:text-theme-text-muted-dark dark:hover:text-theme-text-primary-dark p-1 relative after:absolute after:inset-[-4px] after:content-['']"
            aria-label="Close modal"
          >
            <FaTimes size={16} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 lg:space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
              Hero Image *
            </label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview("");
                    setFormData({ ...formData, image_url: "" });
                  }}
                  className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-red-600 text-white p-1 sm:p-2 rounded-full hover:bg-red-700 text-xs sm:text-sm"
                  aria-label="Remove image"
                >
                  <FaTrash size={12} className="sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <label className="w-full h-32 sm:h-40 lg:h-48 flex flex-col items-center justify-center border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-pointer hover:border-theme-primary transition-colors">
                <FaUpload className="text-xl sm:text-2xl lg:text-3xl text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1 sm:mb-2"/>
                <span className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  {uploadingImage ? "Uploading..." : "Click to upload image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={uploadingImage}
                />
              </label>
            )}
          </div>

          {/* Title and Subtitle */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                placeholder="e.g., Summer Sale Collections"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Subtitle *
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) =>
                  setFormData({ ...formData, subtitle: e.target.value })
                }
                required
                placeholder="e.g., Sale! Up to 50% off!"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={2}
              placeholder="Additional description text..."
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            />
          </div>

          {/* Button Text and URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Button Text *
              </label>
              <input
                type="text"
                value={formData.button_text}
                onChange={(e) =>
                  setFormData({ ...formData, button_text: e.target.value })
                }
                required
                placeholder="e.g., SHOP NOW"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Button URL *
              </label>
              <input
                type="text"
                value={formData.button_url}
                onChange={(e) =>
                  setFormData({ ...formData, button_url: e.target.value })
                }
                required
                placeholder="/category/summer-sale"
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>
          </div>

          {/* Background Gradient */}
          <HeroSliderGradientOptions
            gradientOptions={GRADIENT_OPTIONS}
            selectedGradient={formData.background_gradient}
            onSelectGradient={(value) =>
              setFormData({ ...formData, background_gradient: value })
            }
          />

          {/* Sort Order and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Sort Order
              </label>
              <input
                type="number"
                min="0"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sort_order: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1 sm:mb-2">
                Status
              </label>
              <label className="flex items-center mt-2 sm:mt-3">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="rounded mr-1 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  Active
                </span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              aria-label="Close the modal"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors relative after:absolute after:inset-[-4px] after:content-['']"
            >
              Cancel
            </button>
            <button
              type="submit"
              aria-label="submit the hero slider"
              disabled={loading || uploadingImage || !formData.image_url}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-['']"
            >
              {loading
                ? mode === "edit"
                  ? "Updating..."
                  : "Creating..."
                : uploadingImage
                ? "Uploading Image..."
                : mode === "edit"
                ? "Update Slide"
                : "Create Slide"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}