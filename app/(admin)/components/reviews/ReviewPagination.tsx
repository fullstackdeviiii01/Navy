// ReviewPagination.tsx
"use client";

interface ReviewPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function ReviewPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: ReviewPaginationProps) {
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 border-t border-theme-border-light dark:border-theme-border-dark">
      <div className="text-xs sm:text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
        Showing {startItem} to {endItem} of {total} reviews
      </div>
      <div className="flex gap-1.5 sm:gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-2 sm:px-3 py-1 text-xs border border-theme-border-light dark:border-theme-border-dark rounded hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <div className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark flex items-center">
          Page {page} of {totalPages}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="px-2 sm:px-3 py-1 text-xs border border-theme-border-light dark:border-theme-border-dark rounded hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}