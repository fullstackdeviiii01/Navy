// app/components/reviews/ReviewStats.tsx
"use client";

import { Star } from "lucide-react";

interface ReviewStatsProps {
  stats: {
    averageRating: number;
    totalReviews: number;
    distribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    percentages: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    reviewsWithImages?: number;
    verifiedPurchases?: number;
  };
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  return (
    <section 
      className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 sm:p-8"
      aria-labelledby="review-stats-heading"
    >
      <h2 id="review-stats-heading" className="sr-only">Review Statistics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
        {/* Overall Rating Score */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center text-center lg:border-r border-theme-border-light dark:border-theme-border-dark lg:pr-8">
          <div className="text-5xl sm:text-6xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark font-semibold mb-2">
            {stats.averageRating.toFixed(1)}
          </div>

          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  star <= Math.round(stats.averageRating)
                    ? "fill-amber-500 text-amber-500"
                    : "text-theme-border-light dark:text-theme-border-dark"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>

          <p className="text-xs uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark mb-4">
            Based on {stats.totalReviews} verified {stats.totalReviews === 1 ? "review" : "reviews"}
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {stats.verifiedPurchases !== undefined && stats.verifiedPurchases > 0 && (
              <span className="px-2.5 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/40 dark:bg-theme-card-dark/30 text-[10px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {stats.verifiedPurchases} Verified Purchases
              </span>
            )}
            {stats.reviewsWithImages !== undefined && stats.reviewsWithImages > 0 && (
              <span className="px-2.5 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/40 dark:bg-theme-card-dark/30 text-[10px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                {stats.reviewsWithImages} with Media
              </span>
            )}
          </div>
        </div>

        {/* Rating Distribution Progress */}
        <div className="lg:col-span-3 space-y-2.5">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 w-12 flex-shrink-0">
                <span className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {rating}
                </span>
                <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-2 bg-theme-border-light/40 dark:bg-theme-border-dark/40 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{
                    width: `${stats.percentages[rating as keyof typeof stats.percentages]}%`,
                  }}
                />
              </div>

              {/* Percentage & Count */}
              <span className="text-[11px] font-mono text-theme-text-muted-light dark:text-theme-text-muted-dark w-12 text-right flex-shrink-0">
                {stats.percentages[rating as keyof typeof stats.percentages]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}