"use client";
import { useState, useEffect, useRef } from "react";
import { categoriesApi } from "../../../../lib/api/categories";
import { FaUpload, FaTimes, FaImage } from "react-icons/fa";
import Image from "next/image";
import CategoryAttributeManager from './CategoryAttributeManager';
import { ICategoryAttribute } from '../../../models/Category'

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  product_count: number;
  created_at: string;
  attributes?: ICategoryAttribute[];
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category: Category | null;
}

export default function CategoryModal({
  isOpen,
  onClose,
  onSuccess,
  category,
}: CategoryModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image_url: "",
    sort_order: 0,
    is_active: true,
    is_featured: false,
  });
  
  const [attributes, setAttributes] = useState<ICategoryAttribute[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when category changes or modal opens
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image_url: category.image_url || "",
        sort_order: category.sort_order,
        is_active: category.is_active,
        is_featured: category.is_featured,
      });
      setImagePreview(category.image_url || "");
      setAttributes(category.attributes || []);
    } else {
      setFormData({
        name: "",
        slug: "",
        description: "",
        image_url: "",
        sort_order: 0,
        is_active: true,
        is_featured: false,
      });
      setImagePreview("");
      setAttributes([]);
    }
  }, [category, isOpen]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload image
      const result = await categoriesApi.uploadImage(file);
      setFormData({ ...formData, image_url: result.imageUrl });
    } catch (error: any) {
      alert(error.message || "Failed to upload image");
      setImagePreview(formData.image_url || "");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image_url: "" });
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const categoryData = {
        ...formData,
        attributes: attributes,
      };

      if (category) {
        await categoriesApi.update(category._id, categoryData);
      } else {
        await categoriesApi.create(categoryData);
      }
      onSuccess();
    } catch (error: any) {
      alert(error.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-base sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4 sm:mb-6">
          {category ? "Edit Category" : "Add New Category"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Image Upload Section */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Category Image
            </label>
            
            <div className="space-y-2 sm:space-y-3">
              {/* Image Preview */}
              {imagePreview ? (
                <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border-2 border-theme-border-light dark:border-theme-border-dark">
                  <Image
                    src={imagePreview}
                    alt="Category preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors text-xs sm:text-base"
                    title="Remove image"
                    aria-label="Remove image"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="w-full h-40 sm:h-48 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-lg flex flex-col items-center justify-center text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  <FaImage className="text-2xl sm:text-4xl mb-2" />
                  <p className="text-xs sm:text-sm">No image selected</p>
                </div>
              )}

              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                  id="category-image-upload"
                />
                <label
                  htmlFor="category-image-upload"
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg cursor-pointer hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-[''] ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <FaUpload className="text-xs sm:text-sm" />
                  {uploading ? "Uploading..." : imagePreview ? "Change Image" : "Upload Image"}
                </label>
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
                  Supported: JPEG, PNG, WebP (Max 5MB)
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  // Auto-generate slug only for new categories
                  if (!category) {
                    const slug = e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    setFormData((prev) => ({ ...prev, slug }));
                  }
                }}
                required
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                disabled
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
            />
          </div>

          {/* Attributes Section */}
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-sm sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
              Product Attributes
            </h4>
            <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Define what attributes products in this category should have (size, color, material, etc.)
            </p>
            <CategoryAttributeManager
              attributes={attributes}
              onAttributesChange={setAttributes}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Sort Order
            </label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })
              }
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Active
              </span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) =>
                  setFormData({ ...formData, is_featured: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Featured
              </span>
            </label>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-['']"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || loading}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm relative after:absolute after:inset-[-4px] after:content-['']"
            >
              {category ? "Update" : "Create"} Category
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}