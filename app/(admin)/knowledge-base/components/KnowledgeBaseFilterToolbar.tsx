// app/(admin)/knowledge-base/components/KnowledgeBaseFilterToolbar.tsx
"use client";

import { Search, HelpCircle, Plus } from "lucide-react";

interface KnowledgeBaseFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterCategory: string;
  filterStatus: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  categories: string[];
  onCreateArticle: () => void;
}

export default function KnowledgeBaseFilterToolbar({
  searchQuery,
  onSearchChange,
  filterCategory,
  filterStatus,
  onCategoryChange,
  onStatusChange,
  categories,
  onCreateArticle,
}: KnowledgeBaseFilterToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              FAQs & Help Center
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              <HelpCircle className="w-3 h-3" />
              FAQs
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Create and manage frequently asked questions and help guides for customers.
          </p>
        </div>

        <button
          type="button"
          onClick={onCreateArticle}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-semibold tracking-wide shadow-xs hover:shadow active:scale-[0.99] transition-all self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search FAQs by question or keyword..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
    </div>
  );
}
