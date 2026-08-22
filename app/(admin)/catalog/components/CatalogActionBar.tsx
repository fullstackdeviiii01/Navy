// app/(admin)/catalog/components/CatalogActionBar.tsx
"use client";

import { FaPlus, FaBoxOpen } from "react-icons/fa";

interface CatalogActionBarProps {
  onAddNewItem: () => void;
  totalCount?: number;
}

export default function CatalogActionBar({
  onAddNewItem,
  totalCount,
}: CatalogActionBarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-theme-hover-light/10 text-theme-hover-light dark:text-theme-hover-dark">
            <FaBoxOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Product Catalog Directory
            </h1>
            <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
              Manage handcrafted luxury lighting, finishes, variants, pricing, and live inventory levels.
              {typeof totalCount === "number" && ` (${totalCount} Total Items)`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-start sm:self-auto">
        <button
          type="button"
          onClick={onAddNewItem}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all"
        >
          <FaPlus className="w-3 h-3" />
          <span>New Product</span>
        </button>
      </div>
    </div>
  );
}
