// app/components/product/ProductSort.tsx
"use client";

import { ChevronDown } from "lucide-react";

interface ProductSortProps {
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  className?: string;
}

export default function ProductSort({ sortBy, onSortChange, className = "" }: ProductSortProps) {
  return (
    <div className={`relative inline-flex items-center w-full min-w-0 ${className}`}>
      <select
        value={sortBy}
        aria-label="Sort products by"
        onChange={(e) => onSortChange(e.target.value)}
        className="w-full appearance-none pl-2.5 sm:pl-3 pr-7 sm:pr-8 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-[11px] sm:text-xs uppercase tracking-[0.08em] sm:tracking-[0.15em] font-medium focus:outline-none focus:border-theme-hover-light dark:focus:border-theme-hover-dark cursor-pointer transition-colors truncate"
      >
        <option value="featured">Sort: Featured</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="name-asc">Name: A to Z</option>
        <option value="name-desc">Name: Z to A</option>
        <option value="newest">Newest First</option>
        <option value="rating">Highest Rated</option>
      </select>
      <ChevronDown className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-theme-text-muted-light dark:text-theme-text-muted-dark pointer-events-none" />
    </div>
  );
}