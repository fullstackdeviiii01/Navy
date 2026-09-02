// app/components/newsletter/NewsletterHeader.tsx
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
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark font-serif">
          Newsletter Management
        </h2>
        <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mt-0.5 sm:mt-1">
          Manage subscribers, segment lists, and broadcast email campaigns
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
        <div className="bg-gradient-to-br from-[#8A5E22] to-[#C59345] rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md min-w-[110px] sm:min-w-[130px] flex-1 sm:flex-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <FaUsers className="text-white text-xs sm:text-sm" />
            <p className="text-[#FDF6EC] text-xs font-medium truncate">
              Total
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate font-mono">
            {stats.total}
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md min-w-[110px] sm:min-w-[130px] flex-1 sm:flex-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <FaEnvelope className="text-white text-xs sm:text-sm" />
            <p className="text-emerald-100 text-xs font-medium truncate">
              Active
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate font-mono">
            {stats.active}
          </p>
        </div>

        <div className="bg-gradient-to-br from-stone-600 to-stone-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 shadow-md min-w-[110px] sm:min-w-[130px] flex-1 sm:flex-none">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <FaPaperPlane className="text-white text-xs sm:text-sm" />
            <p className="text-stone-200 text-xs font-medium truncate">
              Inactive
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-white truncate font-mono">
            {stats.inactive}
          </p>
        </div>
      </div>
    </div>
  );
}
