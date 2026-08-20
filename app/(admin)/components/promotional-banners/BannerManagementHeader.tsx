// app/(admin)/components/promotional-banners/BannerManagementHeader.tsx
"use client";

import { FaPlus } from "react-icons/fa";
import Link from "next/link";

interface BannerManagementHeaderProps {
  onCreateBanner: () => void;
}

export default function BannerManagementHeader({ 
  onCreateBanner 
}: BannerManagementHeaderProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-3 md:gap-4">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
            Promotional Banners
          </h2>
          <p className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
            Create and manage promotional banners for your store
          </p>
        </div>
        
        <button
          onClick={onCreateBanner}
          className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors text-xs sm:text-sm w-full sm:w-auto"
        >
          <FaPlus className="text-xs sm:text-sm flex-shrink-0" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 sm:p-3 md:p-4"> 
        <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200"> 
          <strong>Note:</strong> Banner order and visibility are controlled in{' '}
          <Link href="/admin/site-settings" className="underline hover:no-underline break-words">
            Site Settings → Home Page
          </Link>
          . Use this page to create, edit, and schedule banner content.
        </p> 
      </div>
    </div>
  );
}