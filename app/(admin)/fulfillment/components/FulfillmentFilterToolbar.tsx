// app/(admin)/fulfillment/components/FulfillmentFilterToolbar.tsx
"use client";

import { Search, RotateCcw } from "lucide-react";

interface FulfillmentFilterToolbarProps {
  filters: {
    status: string;
    payment_status: string;
    search: string;
    page: number;
    limit: number;
  };
  onFilterChange: (newFilters: any) => void;
}

export default function FulfillmentFilterToolbar({
  filters,
  onFilterChange,
}: FulfillmentFilterToolbarProps) {
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleReset = () => {
    onFilterChange({
      status: "all",
      payment_status: "all",
      search: "",
      page: 1,
    });
  };

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
      {/* Search Input */}
      <form onSubmit={handleSearch} className="flex-1 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="Search by Order #, Customer Name, Email, or Phone..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
        />
      </form>

      {/* Select Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Order Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
        >
          <option value="all">All Order Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped (In Transit)</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>

        {/* Payment Status */}
        <select
          value={filters.payment_status}
          onChange={(e) => onFilterChange({ payment_status: e.target.value })}
          className="px-3 py-2 text-xs border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 cursor-pointer"
        >
          <option value="all">All Payment Statuses</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Payment Settled (Paid)</option>
          <option value="failed">Payment Failed</option>
          <option value="refunded">Payment Refunded</option>
        </select>

        {/* Reset Filter Button */}
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
  );
}
