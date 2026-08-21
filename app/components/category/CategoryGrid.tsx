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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark overflow-hidden animate-pulse"
          >
            <div className="aspect-[4/5] bg-theme-card-light/60 dark:bg-theme-card-dark/60" />
            <div className="p-5 space-y-3">
              <div className="h-5 bg-theme-card-light/80 dark:bg-theme-card-dark/80 w-3/4" />
              <div className="h-3 bg-theme-card-light/50 dark:bg-theme-card-dark/50 w-full" />
              <div className="h-3 bg-theme-card-light/50 dark:bg-theme-card-dark/50 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-16 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8" role="status">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark mb-4">
          <FaTag
            className="text-xl text-theme-text-muted-light dark:text-theme-text-muted-dark"
            aria-hidden="true"
          />
        </div>
        <p className="font-serif italic text-xl text-theme-text-primary-light dark:text-theme-text-primary-dark">
          No categories found
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      role="status"
      aria-live="polite"
      aria-label="Categories collection"
    >
      {categories.map((category) => (
        <CategoryCard key={category._id} category={category} />
      ))}
    </div>
  );
}
