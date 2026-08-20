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
          className="w-full px-4 py-3 pl-12 pr-12 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary placeholder:text-theme-text-muted-light dark:placeholder:text-theme-text-muted-dark"
        />

        <button
          type="submit"
          aria-label="Search categories"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-theme-primary dark:hover:text-theme-primary transition-colors"
        >
          <FaSearch className="text-lg"/>
        </button>

        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="text-lg"/>
          </button>
        )}
      </div>
    </form>
  );
}
