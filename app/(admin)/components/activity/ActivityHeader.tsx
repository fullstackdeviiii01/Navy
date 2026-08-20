// components/activity/ActivityHeader.tsx
"use client";

import { FaCalendarAlt, FaSearch } from "react-icons/fa";

interface ActivityHeaderProps {
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function ActivityHeader({
  dateFilter,
  onDateFilterChange,
  searchTerm,
  onSearchChange,
}: ActivityHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Activity Monitoring
        </h2>
        <div className="flex items-center gap-2">
          <FaCalendarAlt
            className="text-theme-text-muted-light flex-shrink-0 text-sm sm:text-base"
            aria-hidden="true"
          />
          <select
            value={dateFilter}
            onChange={(e) => onDateFilterChange(e.target.value)}
            className="flex-1 sm:flex-initial px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
            aria-label="Select time period for activity data"
          >
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
        <FaSearch
          className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark focus:outline-none focus:ring-2 focus:ring-theme-primary"
          aria-label="Search login activities"
        />
      </div>
    </div>
  );
}