// app/components/product/LoadMoreButton.tsx
"use client";

import { Loader2, ChevronDown } from "lucide-react";

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
    <div className="flex justify-center px-4">
      <button
        onClick={onClick}
        disabled={loading}
        aria-label="Load more products button"
        className="group px-8 py-3.5 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-theme-text-primary-light dark:text-theme-text-primary-dark hover:bg-theme-primary hover:text-theme-btn-text hover:border-theme-primary font-medium text-xs uppercase tracking-[0.2em] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>LOADING PIECES...</span>
          </>
        ) : (
          <>
            <span>LOAD MORE {remainingCount ? `(${remainingCount})` : "PIECES"}</span>
            <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </>
        )}
      </button>
    </div>
  );
}