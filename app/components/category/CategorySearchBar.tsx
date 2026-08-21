// app/components/category/CategorySearchBar.tsx
"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";

interface CategorySearchBarProps {
  value: string;
  onSearch: (search: string) => void;
  placeholder?: string;
}

export default function CategorySearchBar({
  value,
  onSearch,
  placeholder = "Search by category name and description",
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
      <div className="relative">
        <input
          type="text"
          aria-label="Search categories by name or description"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3.5 pl-11 pr-11 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark text-xs sm:text-sm transition-colors"
        />

        <button
          type="submit"
          aria-label="Search categories"
          className="absolute left-3.5 top-1/2 -translate-y-1/2 p-1 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-hover-light dark:hover:text-theme-hover-dark transition-colors"
        >
          <FaSearch className="text-sm"/>
        </button>

        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-theme-text-muted-light dark:text-theme-text-muted-dark hover:text-theme-text-primary-light dark:hover:text-theme-text-primary-dark transition-colors"
          >
            <FaTimes className="text-sm"/>
          </button>
        )}
      </div>
    </form>
  );
}
