// ReviewStatsCards.tsx
"use client";

interface ReviewStatsCardsProps {
  totalReviews: number;
  pendingCount: number;
  approvedCount: number;
}

export default function ReviewStatsCards({ 
  totalReviews, 
  pendingCount, 
  approvedCount 
}: ReviewStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-3 sm:p-4 lg:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark">
          Total Reviews
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">
          {totalReviews}
        </p>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-3 sm:p-4 lg:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark">
          Pending Approval
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
          {pendingCount}
        </p>
      </div>

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-3 sm:p-4 lg:p-6 border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-xs sm:text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-muted-dark">
          Approved
        </p>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
          {approvedCount}
        </p>
      </div>
    </div>
  );
}