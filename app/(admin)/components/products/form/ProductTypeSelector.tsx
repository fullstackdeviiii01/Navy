"use client";

import { FaBox, FaLayerGroup } from "react-icons/fa";

interface ProductTypeSelectorProps {
  hasVariants: boolean;
  onChange: (hasVariants: boolean) => void;
  disabled?: boolean;
}

export default function ProductTypeSelector({
  hasVariants,
  onChange,
  disabled = false,
}: ProductTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark border-b border-theme-border-light dark:border-theme-border-dark pb-2">
        Product Type
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => !disabled && onChange(false)}
          disabled={disabled}
          className={`p-6 border-2 rounded-lg transition-all ${
            !hasVariants
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-theme-border-light dark:border-theme-border-dark hover:border-blue-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <FaBox
            className={`mx-auto mb-3 text-4xl ${
              !hasVariants
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
          <div className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            Simple Product
          </div>
          <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Single SKU, one price, standard inventory
          </div>
        </button>

        <button
          type="button"
          onClick={() => !disabled && onChange(true)}
          disabled={disabled}
          className={`p-6 border-2 rounded-lg transition-all ${
            hasVariants
              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
              : "border-theme-border-light dark:border-theme-border-dark hover:border-blue-300"
          } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <FaLayerGroup
            className={`mx-auto mb-3 text-4xl ${
              hasVariants
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          />
          <div className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
            Product with Variants
          </div>
          <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Multiple options (size, color, etc.)
          </div>
        </button>
      </div>

      {disabled && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Product type cannot be changed after creation. To change the product type, you must create a new product.
          </p>
        </div>
      )}
    </div>
  );
}