// app/(admin)/components/products/VariantForm.tsx
"use client";

import { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { ProductVariant } from "../../../../../types/product-variants";

interface VariantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variant: ProductVariant) => void;
  variant: ProductVariant;
  productCurrency: string;
}

export default function VariantForm({
  isOpen,
  onClose,
  onSave,
  variant,
  productCurrency,
}: VariantFormProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg max-w-2xl w-full">
        {/* Header */}
        <div className="border-b border-theme-border-light dark:border-theme-border-dark p-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Edit Variant
          </h3>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
                disabled
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-gray-100 dark:bg-gray-800 text-theme-text-primary-light dark:text-theme-text-primary-dark disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Price ({productCurrency})
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
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
                Stock Quantity
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
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
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
                className="w-full px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2">
              Variant Image
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={formData.imageUrl || ""}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="Image URL or upload file"
                className="flex-1 px-3 py-2 border border-theme-border-light dark:border-theme-border-dark rounded bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm"
              />
              <label className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-medium cursor-pointer hover:bg-blue-700 transition-colors flex-shrink-0">
                {uploading ? "Uploading..." : "Upload File"}
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
                  className="w-10 h-10 object-cover rounded border border-theme-border-light dark:border-theme-border-dark flex-shrink-0"
                />
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAvailable}
                onChange={(e) =>
                  setFormData({ ...formData, isAvailable: e.target.checked })
                }
                className="rounded"
              />
              <span className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                Available for Purchase
              </span>
            </label>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-theme-border-light dark:border-theme-border-dark p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit({ preventDefault: () => {} } as any)}
            className="px-6 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}