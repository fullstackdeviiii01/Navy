// app/(admin)/components/promotional-banners/BannerFilters.tsx
"use client";

import { FaFilter } from "react-icons/fa";

interface BannerFiltersProps {
  filterPage: string;
  onFiltersChange: (filters: { page: string }) => void;
}

export default function BannerFilters({
  filterPage,
  onFiltersChange,
}: BannerFiltersProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <FaFilter aria-hidden="true" className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs sm:text-sm" />
        <span className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          Filter by Page
        </span>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {/* Page Filter */}
        <div className="flex-1 min-w-0">
          <label htmlFor="pageFilter" className="sr-only">
            Filter by page
          </label>
          <select
            id="pageFilter"
            value={filterPage}
            onChange={(e) => onFiltersChange({ page: e.target.value })}
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Pages</option>
            <option value="home">Home Page</option>
            <option value="categories">Categories Page</option>
            <option value="products">Products Page</option>
          </select>
        </div>
      </div>
    </div>
  );
}