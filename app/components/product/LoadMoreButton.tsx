// app/components/product/LoadMoreButton.tsx
"use client";

import { FaSpinner, FaChevronDown } from "react-icons/fa";

interface LoadMoreButtonProps {
  onClick: () => void;
  loading?: boolean;
  remainingCount?: number;
}

export default function LoadMoreButton({
  onClick,
  loading = false,
  remainingCount,
}: LoadMoreButtonProps) {
  return (
    <div className="mt-6 sm:mt-8 mb-3 sm:mb-4 flex justify-center px-4">
      <button
        onClick={onClick}
        disabled={loading}
        aria-label="Load more products button"
        className="group relative px-4 sm:px-6 py-2.5 sm:py-3 bg-theme-primary text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none min-w-[160px] sm:min-w-[200px] w-full sm:w-auto max-w-xs"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2 sm:gap-3">
            <FaSpinner className="animate-spin text-base sm:text-lg"/>
            <span>Loading...</span>
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2 sm:gap-3">
            <span>Load More Products</span>
            <FaChevronDown className="text-xs sm:text-sm group-hover:translate-y-0.5 transition-transform"/>
          </span>
        )}
      </button>
    </div>
  );
}