// ============================================
// 1. app/(admin)/components/products/ProductHeader.tsx
// ============================================
"use client";

import { FaPlus, FaFileUpload } from "react-icons/fa";

interface ProductHeaderProps {
  onAddProduct: () => void;
  onBulkUpload: () => void;
}

export default function ProductHeader({
  onAddProduct,
  onBulkUpload,
}: ProductHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        Product Management
      </h2>
      <div className="flex space-x-3">
        <button
          onClick={onBulkUpload}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaFileUpload className="mr-2" />
          Bulk Upload
        </button>
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
