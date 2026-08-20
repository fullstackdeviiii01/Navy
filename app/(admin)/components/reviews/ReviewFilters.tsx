// ReviewFilters.tsx
"use client";

import { Search, Filter } from "lucide-react";

interface ReviewFiltersProps {
  searchTerm: string;
  statusFilter: string;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSearch: () => void;
}

export default function ReviewFilters({
  searchTerm,
  statusFilter,
  onSearchTermChange,
  onStatusFilterChange,
  onSearch,
}: ReviewFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
      <div className="flex-1 min-w-0">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSearch()}
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
            aria-label="Search reviews"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Filter className="text-theme-text-muted-light h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" aria-hidden="true" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          aria-label="Filter by status"
        >
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
      </div>
      <button
        onClick={onSearch}
        className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm"
      >
        Search
      </button>
    </div>
  );
}