// app/(admin)/components/products/VariantManagementModal.tsx
"use client";

import { FaTimes } from "react-icons/fa";
import VariantConfigurationPanel from "./variants/VariantConfigurationPanel";

interface VariantManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess: () => void;
}

export default function VariantManagementModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: VariantManagementModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg p-6 max-w-6xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-theme-border-light dark:border-theme-border-dark pb-4">
          <div>
            <h3 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Manage Variants
            </h3>
            <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-1">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-theme-text-muted-light hover:text-theme-text-primary-light"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Variant Configuration Panel */}
        <VariantConfigurationPanel
          productId={product._id}
          hasVariants={product.hasVariants || false}
          onToggleVariants={(enabled) => {
            // Optionally update product state
            console.log("Variants toggled:", enabled);
          }}
        />

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="px-6 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}