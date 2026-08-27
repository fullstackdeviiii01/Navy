// app/(admin)/catalog/components/VariantStudioModal.tsx
"use client";

import { FaTimes } from "react-icons/fa";
import VariantMatrixPanel from "./matrix/VariantMatrixPanel";

interface VariantStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onSuccess: () => void;
}

export default function VariantStudioModal({
  isOpen,
  onClose,
  product,
  onSuccess,
}: VariantStudioModalProps) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl p-6 max-w-5xl w-full border border-theme-border-light dark:border-theme-border-dark shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-theme-border-light dark:border-theme-border-dark pb-4">
          <div>
            <h3 className="text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Variant Matrix Studio
            </h3>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-theme-text-muted-light hover:text-theme-text-primary-light rounded"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Variant Matrix Panel */}
        <VariantMatrixPanel
          productId={product._id}
          hasVariants={product.hasVariants || false}
          onToggleVariants={(enabled) => {
          }}
        />

        {/* Footer */}
        <div className="flex justify-end mt-6 pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="px-6 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg shadow-xs hover:shadow active:scale-[0.99] transition-all"
          >
            Done & Save
          </button>
        </div>
      </div>
    </div>
  );
}
