"use client";

import { FaEnvelope, FaUsers, FaPaperPlane } from "react-icons/fa";

interface NewsletterHeaderProps {
  stats: {
    total: number;
    active: number;
    inactive: number;
  };
}

export default function NewsletterHeader({ stats }: NewsletterHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="min-w-0 flex-1">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          Newsletter Management
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1">
          Manage subscribers and email campaigns
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg min-w-[110px] sm:min-w-[140px] flex-1 sm:flex-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <FaUsers className="text-white text-xs sm:text-sm" />
            <p className="text-blue-100 text-xs font-medium truncate">
              Total Subscribers
            </p>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
            {stats.total}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg min-w-[110px] sm:min-w-[140px] flex-1 sm:flex-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <FaEnvelope className="text-white text-xs sm:text-sm" />
            <p className="text-green-100 text-xs font-medium truncate">
              Active
            </p>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
            {stats.active}
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-lg min-w-[110px] sm:min-w-[140px] flex-1 sm:flex-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <FaPaperPlane className="text-white text-xs sm:text-sm" />
            <p className="text-gray-100 text-xs font-medium truncate">
              Inactive
            </p>
          </div>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white truncate">
            {stats.inactive}
          </p>
        </div>
      </div>
    </div>
  );
}