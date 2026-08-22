// app/(admin)/catalog/components/matrix/MatrixStockMetrics.tsx
"use client";

import { FaBoxes, FaCheckCircle, FaLayerGroup } from "react-icons/fa";

interface MatrixStockMetricsProps {
  totalVariants: number;
  availableVariants: number;
  totalStock: number;
}

export default function MatrixStockMetrics({
  totalVariants,
  availableVariants,
  totalStock,
}: MatrixStockMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      <div className="p-4 bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light dark:border-theme-border-dark rounded-xl space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
            Total Permutations
          </span>
          <FaLayerGroup className="text-purple-600 w-3.5 h-3.5" />
        </div>
        <div className="text-2xl font-bold font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {totalVariants}
        </div>
        <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          Configured SKUs in Matrix
        </p>
      </div>

      <div className="p-4 bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light dark:border-theme-border-dark rounded-xl space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
            Available Online
          </span>
          <FaCheckCircle className="text-green-600 w-3.5 h-3.5" />
        </div>
        <div className="text-2xl font-bold font-serif text-green-700 dark:text-green-400">
          {availableVariants}
        </div>
        <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          Active Storefront Models
        </p>
      </div>

      <div className="p-4 bg-theme-bg-light/60 dark:bg-theme-bg-dark/40 border border-theme-border-light dark:border-theme-border-dark rounded-xl space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-mono tracking-wider font-semibold text-theme-text-muted-light">
            Combined Stock
          </span>
          <FaBoxes className="text-blue-600 w-3.5 h-3.5" />
        </div>
        <div className="text-2xl font-bold font-serif text-blue-700 dark:text-blue-400">
          {totalStock}
        </div>
        <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          Total Warehouse Units
        </p>
      </div>
    </div>
  );
}
