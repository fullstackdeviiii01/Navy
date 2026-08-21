// app/components/product/ActiveFilters.tsx
"use client";

import { X } from "lucide-react";
import { ProductFilters } from "../../hooks/useProductFilters";

interface ActiveFiltersProps {
  filters: ProductFilters;
  categories: any[];
  onRemoveFilter: (filterType: keyof ProductFilters, value?: any) => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  filters,
  categories,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters: Array<{
    type: keyof ProductFilters;
    label: string;
    value?: any;
  }> = [];

  // Category filter
  if (filters.category) {
    const category = categories.find((c) => c._id === filters.category);
    if (category) {
      activeFilters.push({
        type: "category",
        label: `${category.name.toUpperCase()}`,
      });
    }
  }

  // Search filter
  if (filters.search) {
    activeFilters.push({
      type: "search",
      label: `SEARCH: "${filters.search}"`,
    });
  }

  // Price range filter
  if (filters.minPrice > 0 || filters.maxPrice > 0) {
    let label = "PRICE: ";
    if (filters.minPrice > 0 && filters.maxPrice > 0) {
      label += `RS. ${filters.minPrice} - RS. ${filters.maxPrice}`;
    } else if (filters.minPrice > 0) {
      label += `OVER RS. ${filters.minPrice}`;
    } else {
      label += `UNDER RS. ${filters.maxPrice}`;
    }
    activeFilters.push({
      type: "minPrice",
      label,
    });
  }

  // Rating filter
  if (filters.rating > 0) {
    activeFilters.push({
      type: "rating",
      label: `${filters.rating}+ STARS`,
    });
  }

  // In stock filter
  if (filters.inStock) {
    activeFilters.push({
      type: "inStock",
      label: "IN STOCK ONLY",
    });
  }

  // Brand filters
  filters.brands.forEach((brand) => {
    activeFilters.push({
      type: "brands",
      label: `BRAND: ${brand.toUpperCase()}`,
      value: brand,
    });
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2">
      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.type}-${index}`}
          aria-label={`Remove filter: ${filter.label}`}
          onClick={() => onRemoveFilter(filter.type, filter.value)}
          className="inline-flex items-center gap-2 px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-[11px] uppercase tracking-[0.15em] font-medium hover:border-theme-hover-light dark:hover:border-theme-hover-dark transition-colors group"
        >
          <span className="truncate max-w-[200px]">{filter.label}</span>
          <X className="w-3 h-3 text-theme-text-muted-light dark:text-theme-text-muted-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark flex-shrink-0"/>
        </button>
      ))}

      <button
        aria-label="Clear all filters"
        onClick={onClearAll}
        className="text-[11px] uppercase tracking-[0.2em] font-medium text-theme-hover-light dark:text-theme-hover-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors px-2 py-1"
      >
        CLEAR ALL
      </button>
    </div>
  );
}