// app/(admin)/catalog/components/matrix/PermutationItemForm.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { ProductVariant } from "../../../../../types/product-variants";

interface PermutationItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variant: ProductVariant) => void;
  variant: ProductVariant;
  productCurrency: string;
}

export default function PermutationItemForm({
  isOpen,
  onClose,
  onSave,
  variant,
  productCurrency,
}: PermutationItemFormProps) {
  const [formData, setFormData] = useState<ProductVariant>(variant);

  useEffect(() => {
    if (isOpen) {
      setFormData(variant);
    }
  }, [isOpen, variant]);

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const data = new FormData();
      data.append("image", file);

      const response = await fetch("/api/products/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${document.cookie.split("__session=")[1]?.split(";")[0]}`,
        },
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      } else {
        alert("Image upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl max-w-2xl w-full border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark p-4.5 flex justify-between items-center">
          <h3 className="text-base font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Edit Variant Item
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-theme-text-muted-light hover:text-theme-text-primary-light rounded"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Price ({productCurrency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Stock Quantity *
              </label>
              <input
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockQuantity: parseInt(e.target.value) || 0,
                  })
                }
                required
                className="w-full px-3.5 py-2 text-xs font-mono border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
                Compare at Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.compareAtPrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    compareAtPrice: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Optional"
                className="w-full px-3.5 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
              Variant Thumbnail
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="Image URL or upload file"
                className="flex-1 px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs"
              />
              <label className="px-3.5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold cursor-pointer transition-all shadow-xs shrink-0">
                {uploading ? "Uploading..." : "Upload"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              {formData.imageUrl && (
                <img
                  src={formData.imageUrl}
                  alt="Variant preview"
                  className="w-10 h-10 object-cover rounded-lg border border-theme-border-light dark:border-theme-border-dark shrink-0"
                />
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="rounded text-neutral-900 focus:ring-neutral-500"
              />
              <span className="text-xs font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Available for Purchase Online
              </span>
            </label>
          </div>

          {/* Footer */}
          <div className="border-t border-theme-border-light dark:border-theme-border-dark pt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-xs font-semibold text-theme-text-secondary-light hover:bg-theme-card-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all"
            >
              Save Variant
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
