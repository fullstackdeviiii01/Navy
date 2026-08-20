// app/components/category/CategoryGrid.tsx
"use client";

import { FaTag } from "react-icons/fa6";
import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
  categories: any[];
  loading?: boolean;
}

export default function CategoryGrid({
  categories,
  loading,
}: CategoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse border border-gray-100 dark:border-gray-700"
          >
            <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16" role="status">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
          <FaTag
            className="text-2xl text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          No categories found
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      role="status"
      aria-live="polite"
      aria-label="Loading categories"
    >
      {categories.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
}
