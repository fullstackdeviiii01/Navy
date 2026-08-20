// RoleManagementHeader.tsx
"use client";

import { FaSearch } from "react-icons/fa";

interface RoleManagementHeaderProps {
  searchTerm: string;
  selectedRole: string;
  onFiltersChange: (filters: { role: string; search: string }) => void;
}

export default function RoleManagementHeader({
  searchTerm,
  selectedRole,
  onFiltersChange,
}: RoleManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
          Role Management
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
          Manage user roles and permissions
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Role Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedRole}
            onChange={(e) => onFiltersChange({ role: e.target.value, search: searchTerm })}
            className="w-full sm:w-auto px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            aria-label="Filter users by role"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="user">Users</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-48 md:w-64">
          <FaSearch className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-theme-text-muted-dark text-xs sm:text-sm" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onFiltersChange({ role: selectedRole, search: e.target.value })}
            className="w-full pl-7 sm:pl-9 md:pl-10 pr-2 sm:pr-3 md:pr-4 py-1.5 sm:py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-primary"
            aria-label="Search users"
          />
        </div>
      </div>
    </div>
  );
}