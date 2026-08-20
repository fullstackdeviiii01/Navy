// app/(admin)/components/customers/CustomerFilters.tsx
"use client";

import { FaFilter } from "react-icons/fa";

interface Filters {
  status: string;
  orderRange: string;
  joinedDate: string;
  spendingRange: string;
  customerType: string;
}

interface CustomerFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function CustomerFilters({
  filters,
  onFiltersChange,
}: CustomerFiltersProps) {
  return (
    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        <FaFilter className="text-theme-text-muted-light dark:text-theme-text-muted-dark text-xs sm:text-sm" />
        <span className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          Filters
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
        {/* Customer Type Filter - NEW */}
        <div>
          <label htmlFor="customerType" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            Customer Type
          </label>
          <select
            id="customerType"
            value={filters.customerType}
            onChange={(e) =>
              onFiltersChange({ ...filters, customerType: e.target.value })
            }
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Types</option>
            <option value="registered">Registered</option>
            <option value="guest">Guest</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({ ...filters, status: e.target.value })
            }
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        {/* Order Range Filter */}
        <div>
          <label htmlFor="orderRange" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            Order Count
          </label>
          <select
            id="orderRange"
            value={filters.orderRange}
            onChange={(e) =>
              onFiltersChange({ ...filters, orderRange: e.target.value })
            }
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Orders</option>
            <option value="0">No Orders</option>
            <option value="1-5">1-5 Orders</option>
            <option value="6-20">6-20 Orders</option>
            <option value="20+">20+ Orders</option>
          </select>
        </div>

        {/* Joined Date Filter */}
        <div>
          <label htmlFor="joinedDate" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            Joined Date
          </label>
          <select
            id="joinedDate"
            value={filters.joinedDate}
            onChange={(e) =>
              onFiltersChange({ ...filters, joinedDate: e.target.value })
            }
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Time</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>

        {/* Spending Range Filter */}
        <div>
          <label htmlFor="spendingRange" className="block text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-1">
            Total Spent
          </label>
          <select
            id="spendingRange"
            value={filters.spendingRange}
            onChange={(e) =>
              onFiltersChange({ ...filters, spendingRange: e.target.value })
            }
            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          >
            <option value="all">All Amounts</option>
            <option value="0">$0</option>
            <option value="1-100">$1 - $100</option>
            <option value="101-500">$101 - $500</option>
            <option value="500+">$500+</option>
          </select>
        </div>
      </div>
    </div>
  );
}