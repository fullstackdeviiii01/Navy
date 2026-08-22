// app/(admin)/concierge/components/ReturnsFilterToolbar.tsx
"use client";

import { Search } from "lucide-react";

interface ReturnsFilterToolbarProps {
  filters: {
    search: string;
    status: string;
  };
  onFilterChange: (filters: { search: string; status: string }) => void;
}

export default function ReturnsFilterToolbar({
  filters,
  onFilterChange,
}: ReturnsFilterToolbarProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Return ID, Order Number, or Patron Name..."
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) =>
          onFilterChange({ ...filters, status: e.target.value })
        }
        className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
      >
        <option value="all">All Return Lifecycle States</option>
        <option value="pending">Pending Inspection</option>
        <option value="approved">Approved</option>
        <option value="items_received">Items Received in Atelier</option>
        <option value="rejected">Rejected</option>
        <option value="refunded">Refund Settled</option>
      </select>
    </div>
  );
}
