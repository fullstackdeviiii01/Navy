// app/(admin)/taxonomy/components/TaxonomyActionBar.tsx
"use client";

import { FaPlus, FaTags } from "react-icons/fa";

interface TaxonomyActionBarProps {
  onAddNewCollection: () => void;
  totalCount?: number;
}

export default function TaxonomyActionBar({
  onAddNewCollection,
  totalCount,
}: TaxonomyActionBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark">
            <FaTags className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Category Management
            </h1>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Manage product categories, organize collections, and upload category images.
              {typeof totalCount === "number" && ` (${totalCount} Total Categories)`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          onClick={onAddNewCollection}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all"
        >
          <FaPlus className="w-3 h-3" />
          <span>Add Category</span>
        </button>
      </div>
    </div>
  );
}
