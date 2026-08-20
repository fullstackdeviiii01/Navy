// app/components/product/ProductSearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

interface ProductSearchBarProps {
  value: string;
  onSearch: (search: string) => void;
  placeholder?: string;
}

export default function ProductSearchBar({
  value,
  onSearch,
  placeholder = "Search products...",
}: ProductSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localValue.trim());
  };

  const handleClear = () => {
    setLocalValue("");
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          value={localValue}
          aria-label="Search products"
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-12 pr-9 sm:pr-12 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-theme-primary placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark"
        />
        
        {/* Search Icon */}
        <button
          type="submit"
          className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors"
        aria-label="Search products"
        >
          <FaSearch className="text-sm sm:text-base"/>
        </button>

        {/* Clear Button */}
        {localValue && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-secondary-light dark:hover:text-theme-text-secondary-dark transition-colors"
          >
            <FaTimes className="text-sm sm:text-base"/>
          </button>
        )}
      </div>
    </form>
  );
}