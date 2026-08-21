// app/components/product/ProductsPerPageSelector.tsx
"use client";

import { ChevronDown } from "lucide-react";

interface ProductsPerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function ProductsPerPageSelector({
  value,
  onChange,
}: ProductsPerPageSelectorProps) {
  const options = [12, 24, 36, 48];

  return (
    <div className="relative inline-flex items-center">
      <select
        id="products-per-page"
        aria-label="Products per page"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="appearance-none pl-3 pr-8 py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-[0.15em] font-medium focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark cursor-pointer transition-colors"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            SHOW: {option}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-text-muted-light dark:text-theme-text-muted-dark pointer-events-none" />
    </div>
  );
}
