// UserManagementHeader.tsx
"use client";

import { FaSearch } from "react-icons/fa";

interface UserManagementHeaderProps {
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
}

export default function UserManagementHeader({
  searchTerm,
  onSearchChange,
}: UserManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          User Management
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5">
          Manage and monitor all users
        </p>
      </div>

      <div className="relative w-full sm:w-56 lg:w-64">
        <FaSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-light dark:text-theme-text-muted-dark text-sm"
          aria-hidden="true"
        />
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
          aria-label="Search users"
        />
      </div>
    </div>
  );
}