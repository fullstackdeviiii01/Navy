// ============================================
// 3. app/(admin)/components/products/variants/VariantStatistics.tsx
// ============================================
"use client";

interface VariantStatisticsProps {
  totalVariants: number;
  availableVariants: number;
  totalStock: number;
}

export default function VariantStatistics({
  totalVariants,
  availableVariants,
  totalStock,
}: VariantStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
        <div className="text-2xl font-bold text-theme-primary">
          {totalVariants}
        </div>
        <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Total Variants
        </div>
      </div>
      <div className="p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {availableVariants}
        </div>
        <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Available Variants
        </div>
      </div>
      <div className="p-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg">
        <div className="text-2xl font-bold text-theme-primary">{totalStock}</div>
        <div className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Total Stock
        </div>
      </div>
    </div>
  );
}