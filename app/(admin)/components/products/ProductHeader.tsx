// ============================================
// 1. app/(admin)/components/products/ProductHeader.tsx
// ============================================
"use client";

import { FaPlus } from "react-icons/fa";

interface ProductHeaderProps {
  onAddProduct: () => void;
}

export default function ProductHeader({
  onAddProduct,
}: ProductHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        Product Management
      </h2>
      <div className="flex space-x-3">
        <button
          onClick={onAddProduct}
          className="flex items-center px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors"
        >
          <FaPlus className="mr-2" />
          Add Product
        </button>
      </div>
    </div>
  );
}
