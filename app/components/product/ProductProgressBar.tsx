// app/components/product/ProductProgressBar.tsx
"use client";

interface ProductProgressBarProps {
  current: number;
  total: number;
}

export default function ProductProgressBar({
  current,
  total,
}: ProductProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto px-3 sm:px-4">
      <div className="space-y-0.5 sm:space-y-1">
        {/* Progress Bar */}
        <div
          className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2 overflow-hidden shadow-inner"
          role="progressbar"
          aria-valuenow={current}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-label="Products loaded"
        >
          <div
            className="bg-gradient-to-r from-theme-primary to-theme-primary/80 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Progress Text */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-medium">
            {current} of {total} products
          </span>
          <span className="text-theme-primary font-semibold">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
}
