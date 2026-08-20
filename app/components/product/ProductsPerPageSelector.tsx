// app/components/product/ProductsPerPageSelector.tsx
"use client";

import { FaList } from "react-icons/fa";

interface ProductsPerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ProductsPerPageSelector({
  value,
  onChange,
}: ProductsPerPageSelectorProps) {
  const options = [12, 24, 36, 48, 60];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <FaList
        className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs sm:text-sm flex-shrink-0"
        aria-hidden="true"
      />
      <label
        htmlFor="products-per-page"
        className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-xs sm:text-sm font-medium"
      >
        Show:
      </label>
      <select
        id="products-per-page"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="px-2.5 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-theme-primary"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
