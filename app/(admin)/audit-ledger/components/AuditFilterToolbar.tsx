// app/(admin)/audit-ledger/components/AuditFilterToolbar.tsx
"use client";

import { Search, ShieldAlert, Calendar } from "lucide-react";

interface AuditFilterToolbarProps {
  dateFilter: string;
  onDateFilterChange: (val: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
}

export default function AuditFilterToolbar({
  dateFilter,
  onDateFilterChange,
  searchTerm,
  onSearchChange,
}: AuditFilterToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Activity & Login Logs
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
              <ShieldAlert className="w-3 h-3" />
              Login Logs
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Track user login history, sign-in methods, and IP addresses.
          </p>
        </div>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value)}
          className="px-3.5 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-neutral-500/40 text-xs cursor-pointer"
        >
          <option value="1">Last 24 Hours</option>
          <option value="7">Last 7 Days</option>
          <option value="30">Last 30 Days</option>
          <option value="90">Last 90 Days</option>
        </select>
      </div>

      {/* Search Box */}
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark shadow-xs flex items-center justify-between gap-3">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light w-3.5 h-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by user name or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark placeholder:text-theme-text-muted-light focus:outline-none focus:ring-2 focus:ring-neutral-500/40"
          />
        </div>
      </div>
    </div>
  );
}
