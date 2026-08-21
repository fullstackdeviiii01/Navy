// app/components/category/CategoryGrid.tsx
"use client";

import Link from "next/link";
import { ChevronsRight, Lamp, Tag } from "lucide-react";
import CategoryCard from "./CategoryCard";

interface CategoryGridProps {
  categories: any[];
  loading?: boolean;
  viewMode?: "grid" | "list";
}

export default function CategoryGrid({
  categories,
  loading,
  viewMode = "grid",
}: CategoryGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark overflow-hidden animate-pulse"
          >
            <div className="h-10 bg-theme-card-light/40 dark:bg-theme-card-dark/40 border-b border-theme-border-light/40 dark:border-theme-border-dark/40" />
            <div className="aspect-[4/3] bg-theme-card-light/60 dark:bg-theme-card-dark/60" />
            <div className="p-6 space-y-3">
              <div className="h-6 bg-theme-card-light/80 dark:bg-theme-card-dark/80 w-2/3" />
              <div className="h-3 bg-theme-card-light/50 dark:bg-theme-card-dark/50 w-full" />
              <div className="h-3 bg-theme-card-light/50 dark:bg-theme-card-dark/50 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div
        className="text-center py-20 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-8 max-w-xl mx-auto space-y-4"
        role="status"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 bg-theme-card-light dark:bg-theme-card-dark border border-theme-border-light dark:border-theme-border-dark">
          <Tag className="w-6 h-6 text-theme-hover-light dark:text-theme-hover-dark" />
        </div>
        <h3 className="font-serif italic text-2xl text-theme-text-primary-light dark:text-theme-text-primary-dark">
          No categories found
        </h3>
        <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-sm mx-auto">
          We couldn&apos;t find any collections matching your criteria.
        </p>
      </div>
    );
  }

  // Minimalist Index List View
  if (viewMode === "list") {
    return (
      <div className="border border-theme-border-light dark:border-theme-border-dark divide-y divide-theme-border-light dark:divide-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark">
        {categories.map((category, index) => {
          const indexFormatted = String(index + 1).padStart(2, "0");
          return (
            <Link
              key={category._id}
              href={`/products?category=${category.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-6 sm:p-8 hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/40 transition-colors gap-4"
            >
              <div className="flex items-start sm:items-center gap-6">
                <span className="font-mono text-sm tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-semibold">
                  N° {indexFormatted}
                </span>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-1 line-clamp-1 max-w-xl">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 pt-3 sm:pt-0 border-t sm:border-t-0 border-theme-border-light/40 dark:border-theme-border-dark/40">
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-theme-text-muted-light dark:text-theme-text-muted-dark">
                  {category.product_count} {category.product_count === 1 ? "Piece" : "Pieces"}
                </span>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark group-hover:text-theme-hover-light dark:group-hover:text-theme-hover-dark transition-colors">
                  <span>Explore</span>
                  <ChevronsRight className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  // Gallery Mosaic Grid View (Default)
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
      role="status"
      aria-live="polite"
      aria-label="Categories collection"
    >
      {categories.map((category, index) => (
        <CategoryCard key={category._id} category={category} index={index} />
      ))}
    </div>
  );
}
