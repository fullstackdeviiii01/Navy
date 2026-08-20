// ReturnFilters.tsx
"use client";

import { useState } from "react";

interface ReturnFiltersProps {
  onFilterChange: (filters: {
    search: string;
    status: string;
  }) => void;
}

export default function ReturnFilters({ onFilterChange }: ReturnFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value, status });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    onFilterChange({ search, status: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4">
      <div className="flex-1">
        <input
          type="text"
          placeholder="Search by RMA number or email..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="sm:w-36 lg:w-48">
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="w-full px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>
    </div>
  );
}