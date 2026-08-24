// app/(admin)/patrons/components/PatronFilterToolbar.tsx
"use client";

import { Search, RotateCcw } from "lucide-react";

interface PatronFilterToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: {
    status: string;
    orderRange: string;
    joinedDate: string;
    spendingRange: string;
    customerType: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function PatronFilterToolbar({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
}: PatronFilterToolbarProps) {
  const handleReset = () => {
    onSearchChange("");
    onFiltersChange({
      status: "all",
      orderRange: "all",
      joinedDate: "all",
      spendingRange: "all",
      customerType: "all",
    });
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs space-y-3">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Member / Guest Filter */}
          <select
            value={filters.customerType}
            onChange={(e) =>
              onFiltersChange({ ...filters, customerType: e.target.value })
            }
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
          >
            <option value="all">All Customers</option>
            <option value="registered">Registered Accounts</option>
            <option value="guest">Guest Customers</option>
          </select>

          {/* Account Status */}
          <select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Blocked / Banned</option>
          </select>

          {/* Order Count */}
          <select
            value={filters.orderRange}
            onChange={(e) =>
              onFiltersChange({ ...filters, orderRange: e.target.value })
            }
            className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="0">0 Orders</option>
            <option value="1-5">1 – 5 Orders</option>
            <option value="6-20">6 – 20 Orders</option>
            <option value="20+">20+ Orders</option>
          </select>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="p-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light hover:text-theme-text-primary-light transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
