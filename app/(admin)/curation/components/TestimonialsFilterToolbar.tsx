// app/(admin)/curation/components/TestimonialsFilterToolbar.tsx
"use client";

import { Search } from "lucide-react";

interface TestimonialsFilterToolbarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchTermChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSearch: () => void;
}

export default function TestimonialsFilterToolbar({
  searchTerm,
  statusFilter,
  onSearchTermChange,
  onStatusFilterChange,
  onSearch,
}: TestimonialsFilterToolbarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Search */}
      <form onSubmit={handleSubmit} className="flex-1 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search testimonials by patron name, product title, or comments..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
        />
      </form>

      {/* Moderation Status */}
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
        >
          <option value="all">All Moderation Status</option>
          <option value="pending">Pending Review Only</option>
          <option value="approved">Approved & Published</option>
          <option value="rejected">Rejected / Hidden</option>
        </select>
      </div>
    </div>
  );
}
