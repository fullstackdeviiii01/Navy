// app/components/category/CategorySearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

interface CategorySearchBarProps {
  value: string;
  onSearch: (search: string) => void;
  placeholder?: string;
}

export default function CategorySearchBar({
  value,
  onSearch,
  placeholder = "Search collections by name or description...",
}: CategorySearchBarProps) {
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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative flex items-center">
        <Search className="absolute left-4 w-4 h-4 text-theme-text-muted-light dark:text-theme-text-muted-dark pointer-events-none" />

        <input
          type="text"
          aria-label="Search categories by name or description"
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            onSearch(e.target.value);
          }}
          placeholder={placeholder}
          className="w-full pl-11 pr-11 py-3.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark text-xs sm:text-sm tracking-wide transition-colors"
        />

        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search query"
            className="absolute right-3.5 p-1 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  );
}
