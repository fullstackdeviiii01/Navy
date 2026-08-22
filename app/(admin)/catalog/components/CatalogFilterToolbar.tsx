// app/(admin)/catalog/components/CatalogFilterToolbar.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { categoriesApi } from "../../../../lib/api/categories";

interface CatalogFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  categoryFilter?: string;
  onCategoryChange?: (value: string) => void;
  inStockFilter?: boolean;
  onInStockChange?: (value: boolean) => void;
  onSearch: () => void;
}

export default function CatalogFilterToolbar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter = "all",
  onCategoryChange,
  inStockFilter = false,
  onInStockChange,
  onSearch,
}: CatalogFilterToolbarProps) {
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesApi.getAll(false);
      if (data?.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Failed to load categories for filters:", e);
    }
  };

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "draft", label: "Draft" },
    { value: "archived", label: "Archived" },
  ];

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input with Instant Clear */}
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, SKU, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-theme-primary/40 focus:border-theme-primary"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                onSearchChange("");
                setTimeout(() => onSearch(), 0);
              }}
              className="absolute right-2.5 top-1/2 transform -translate-y-1/2 p-1 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-full"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40 cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          {onCategoryChange && (
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary/40 cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}

          {/* In-Stock Only Toggle */}
          {onInStockChange && (
            <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockFilter}
                onChange={(e) => onInStockChange(e.target.checked)}
                className="w-3.5 h-3.5 text-blue-600 rounded"
              />
              <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                In Stock Only
              </span>
            </label>
          )}

          {/* Search Action Button */}
          <button
            type="button"
            onClick={onSearch}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold rounded-lg transition-colors shadow-xs"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
