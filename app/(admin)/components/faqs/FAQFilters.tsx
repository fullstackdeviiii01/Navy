// FAQFilters.tsx
"use client";

import { FaSearch, FaFilter } from "react-icons/fa";

interface FAQFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: string;
  filterStatus: string;
  onFiltersChange: (filters: { category: string; status: string }) => void;
  categories: string[];
  onSearch: () => void;
}

export default function FAQFilters({
  searchQuery,
  onSearchChange,
  filterCategory,
  filterStatus,
  onFiltersChange,
  categories,
  onSearch,
}: FAQFiltersProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <FaFilter className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm" aria-hidden="true" />
        <span className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          Filters
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSearch()}
              placeholder="Search questions..."
              className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
              aria-label="Search questions"
            />
          </div>
        </div>

        {/* Filter Button (Mobile) */}
        <button
          onClick={onSearch}
          className="lg:hidden px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <FaSearch className="text-sm" />
          Search
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Filter by Category
          </label>
          <select
            value={filterCategory}
            onChange={(e) => onFiltersChange({ category: e.target.value, status: filterStatus })}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1.5">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => onFiltersChange({ category: filterCategory, status: e.target.value })}
            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}