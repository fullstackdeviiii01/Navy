// app/(admin)/components/customers/CustomerManagementHeader.tsx
"use client";

import { FaUsers } from "react-icons/fa6";

interface CustomerManagementHeaderProps {
  totalCustomers: number;
}

export default function CustomerManagementHeader({ totalCustomers }: CustomerManagementHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Customer Management
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1">
          Manage and monitor your customer base
        </p>
      </div>
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg w-full sm:w-auto min-w-[140px] sm:min-w-[180px]">
        <div className="flex items-center gap-2 sm:gap-3 mb-0.5 sm:mb-1">
          <div className="p-1 sm:p-1.5 rounded-lg bg-white/20 flex-shrink-0">
            <FaUsers className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <p className="text-blue-100 text-xs font-medium truncate">
            Total Customers
          </p>
        </div>
        <p className="text-xl sm:text-2xl lg:text-3xl text-center font-bold text-white truncate">
          {totalCustomers}
        </p>
      </div>
    </div>
  );
}