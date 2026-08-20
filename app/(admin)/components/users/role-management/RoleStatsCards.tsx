// RoleStatsCards.tsx
"use client";

import { FaUserShield, FaUser } from "react-icons/fa";

interface RoleStatsCardsProps {
  adminCount: number;
  regularCount: number;
}

export default function RoleStatsCards({
  adminCount,
  regularCount,
}: RoleStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark truncate">
              Total Admins
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 truncate">
              {adminCount}
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0 ml-2 sm:ml-3">
            <FaUserShield className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-3 sm:p-4 md:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark truncate">
              Regular Users
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 truncate">
              {regularCount}
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 ml-2 sm:ml-3">
            <FaUser className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}