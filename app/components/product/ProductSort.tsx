// app/components/product/ProductSort.tsx
"use client";

import { FaSort } from "react-icons/fa";

interface ProductSortProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
}

export default function ProductSort({ sortBy, onSortChange }: ProductSortProps) {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      <FaSort className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm sm:text-base flex-shrink-0" aria-hidden="true"/>
      <select
        value={sortBy}
        aria-label="Sort products by"
        onChange={(e) => onSortChange(e.target.value)}
        className="px-3 sm:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-theme-primary"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A to Z</option>
        <option value="name-desc">Name: Z to A</option>
        <option value="newest">Newest First</option>
        <option value="rating">Highest Rated</option>
      </select>
    </div>
  );
}