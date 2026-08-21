// app/components/product/ProductSearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

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
          className="w-full px-4 py-3.5 pl-11 pr-11 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark transition-colors"
        />
        
        {/* Search Icon */}
        <button
          type="submit"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
          aria-label="Search products"
        >
          <Search className="w-4 h-4"/>
        </button>

        {/* Clear Button */}
        {localValue && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            <X className="w-4 h-4"/>
          </button>
        )}
      </div>
    </form>
  );
}