// app/(admin)/taxonomy/components/TaxonomyCollectionModal.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { categoriesApi } from "../../../../lib/api/categories";
import { FaUpload, FaTimes, FaImage, FaTrash } from "react-icons/fa";
import Image from "next/image";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
}

interface TaxonomyCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: CategoryItem | null;
}

export default function TaxonomyCollectionModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: TaxonomyCollectionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
  });

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || "",
        image_url: category.image_url || "",
        is_active: category.is_active,
      });
      setImagePreview(category.image_url || "");
    } else {
      setFormData({
        name: "",
        description: "",
        image_url: "",
        is_active: true,
      });
      setImagePreview("");
    }
  }, [category, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image format (JPEG, PNG, or WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }

    try {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      const result = await categoriesApi.uploadImage(file);
      setFormData((prev) => ({ ...prev, image_url: result.imageUrl }));
    } catch (error: any) {
      alert(error.message || "Failed to upload image");
      setImagePreview(formData.image_url || "");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image_url: "" }));
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Collection name is required");
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await categoriesApi.update(category._id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      onSuccess();
    } catch (error: any) {
      alert(error.message || "Failed to save category collection");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl max-w-xl w-full border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark p-4 sm:p-5 flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              {category ? "Edit Collection" : "Create New Collection"}
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              {category ? `Update collection details for ${category.name}` : "Add a category to organize luxury fixtures and lamps."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Collection Cover Image */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Collection Cover Image
            </label>
            <div className="space-y-2.5">
              {imagePreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden border border-theme-border-light dark:border-theme-border-dark bg-black/5 group">
                  <Image
                    src={imagePreview}
                    alt="Collection cover"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow"
                      title="Remove image"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-36 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-xl flex flex-col items-center justify-center text-theme-text-muted-light">
                  <FaImage className="text-2xl mb-1.5" />
                  <p className="text-xs">No cover image uploaded</p>
                </div>
              )}

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="taxonomy-image-upload"
                />
                <label
                  htmlFor="taxonomy-image-upload"
                  className={`inline-flex items-center gap-2 px-3.5 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-pointer bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light hover:text-theme-text-primary-light hover:border-theme-hover-light transition-colors text-xs font-semibold ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FaUpload className="text-xs" />
                  <span>{uploading ? "Uploading..." : imagePreview ? "Change Cover Image" : "Upload Cover Image"}</span>
                </label>
                <span className="text-[11px] text-theme-text-muted-light ml-2 font-mono">
                  JPG, PNG, WebP (&lt;5MB)
                </span>
              </div>
            </div>
          </div>

          {/* Collection Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Collection Title *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Pendant Lights, Chandelier Atelier, Table Luminaires"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Collection Summary / Subtitle
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Brief description for category banners and navigation menus..."
              className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
            />
          </div>

          {/* Active Status */}
          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded text-neutral-900 focus:ring-neutral-500"
              />
              <span className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Visible on Storefront Navigation
              </span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || loading}
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold tracking-wide shadow-xs disabled:opacity-50 transition-all"
            >
              {loading ? (category ? "Updating..." : "Creating...") : category ? "Update Collection" : "Publish Collection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
