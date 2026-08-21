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
    <div className="w-full space-y-2">
      {/* Progress Bar */}
      <div
        className="w-full bg-theme-border-light dark:bg-theme-border-dark h-1 overflow-hidden"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Products loaded progress"
      >
        <div
          className="bg-theme-hover-light dark:bg-theme-hover-dark h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
        <span>
          {current} of {total} pieces
        </span>
        <span>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
