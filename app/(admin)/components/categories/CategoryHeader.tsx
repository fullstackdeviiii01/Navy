"use client";

import { FaPlus } from "react-icons/fa";

interface CategoryHeaderProps {
  onAddCategory: () => void;
}

export default function CategoryHeader({ onAddCategory }: CategoryHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
        Category Management
      </h2>
      <button
        onClick={onAddCategory}
        className="flex items-center justify-center sm:justify-start px-4 py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-sm sm:text-base relative after:absolute after:inset-[-4px] after:content-['']"
        aria-label="Add category"
      >
        <FaPlus className="mr-2 text-xs sm:text-sm" />
        Add Category
      </button>
    </div>
  );
}