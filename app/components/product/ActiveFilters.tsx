// app/components/product/ActiveFilters.tsx
"use client";

import { FaTimes } from "react-icons/fa";
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
        label: `Category: ${category.name}`,
      });
    }
  }

  // Search filter
  if (filters.search) {
    activeFilters.push({
      type: "search",
      label: `Search: "${filters.search}"`,
    });
  }

  // Price range filter
  if (filters.minPrice > 0 || filters.maxPrice > 0) {
    let label = "Price: ";
    if (filters.minPrice > 0 && filters.maxPrice > 0) {
      label += `$${filters.minPrice} - $${filters.maxPrice}`;
    } else if (filters.minPrice > 0) {
      label += `Over $${filters.minPrice}`;
    } else {
      label += `Under $${filters.maxPrice}`;
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
      label: `${filters.rating}+ Stars`,
    });
  }

  // In stock filter
  if (filters.inStock) {
    activeFilters.push({
      type: "inStock",
      label: "In Stock Only",
    });
  }

  // Brand filters
  filters.brands.forEach((brand) => {
    activeFilters.push({
      type: "brands",
      label: `Brand: ${brand}`,
      value: brand,
    });
  });

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-lg p-3 sm:p-4 md:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
        <h3 className="text-theme-text-primary-light dark:text-theme-text-primary-dark font-medium text-xs sm:text-sm md:text-base">
          Active Filters ({activeFilters.length})
        </h3>
        <button
        aria-label="Clear all filters"
          onClick={onClearAll}
          className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors self-start sm:self-auto"
        >
          Clear All
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {activeFilters.map((filter, index) => (
          <button
            key={`${filter.type}-${index}`}
            aria-label={`Remove filter: ${filter.label}`}
            onClick={() => onRemoveFilter(filter.type, filter.value)}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-theme-primary/10 text-theme-primary rounded-full text-[10px] sm:text-xs md:text-sm hover:bg-theme-primary/20 transition-colors"
          >
            <span className="truncate max-w-[150px] sm:max-w-[200px] md:max-w-none">{filter.label}</span>
            <FaTimes className="text-[8px] sm:text-xs flex-shrink-0"/>
          </button>
        ))}
      </div>
    </div>
  );
}