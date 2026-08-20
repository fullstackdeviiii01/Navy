// ============================================
// 2. app/(admin)/components/products/ProductFilters.tsx
// ============================================
"use client";

import { FaSearch, FaFilter } from "react-icons/fa";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  onSearch: () => void;
}

export default function ProductFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onSearch,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex-1 min-w-[250px]">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-dark" />
          <input
            type="text"
            placeholder="Search products by name, SKU, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onSearch()}
            className="w-full pl-10 pr-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <FaFilter className="text-theme-text-muted-light" />
        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
      <button
        onClick={onSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Search
      </button>
    </div>
  );
}