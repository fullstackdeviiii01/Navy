// app/(admin)/components/orders/OrderFilters.tsx
"use client";

import { Search } from "lucide-react";

interface OrderFiltersProps {
  filters: {
    status: string;
    payment_status: string;
    search: string;
  };
  onFilterChange: (filters: any) => void;
}

export default function OrderFilters({
  filters,
  onFilterChange,
}: OrderFiltersProps) {
  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg border border-theme-border-light dark:border-theme-border-dark p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark h-5 w-5" />
          <input
            type="text"
            placeholder="Search by order number, email, or name..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          />
        </div>

        {/* Order Status */}
        <select
          value={filters.status}
          onChange={(e) => onFilterChange({ status: e.target.value })}
          className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {/* Payment Status */}
        <select
          value={filters.payment_status}
          onChange={(e) => onFilterChange({ payment_status: e.target.value })}
          className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
        >
          <option value="all">All Payment Status</option>
          <option value="pending">Payment Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
    </div>
  );
}
