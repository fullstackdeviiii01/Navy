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
    detailedRatings?: {
      quality: number;
      durability: number;
      matches_description: number;
    } | null;
    reviewsWithImages?: number;
    verifiedPurchases?: number;
  };
}

export default function ReviewStats({ stats }: ReviewStatsProps) {
  const DetailedRatingDisplay = ({ label, value }: { label: string; value: number }) => (
    <div className="flex-1 min-w-0">
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark text-center truncate w-full">
          {label}
        </span>
        <div className="flex items-center gap-0.5" role="img" aria-label={`${label}: ${value.toFixed(1)} out of 5`}>
          {[1, 2, 3, 4, 5].map((box) => (
            <div
              key={box}
              className={`w-4 h-4 sm:w-5 sm:h-5 rounded-sm transition-all duration-300 ${
                box <= Math.round(value)
                  ? "bg-gradient-to-br from-blue-400 to-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {value.toFixed(1)}/5
        </span>
      </div>
    </div>
  );

  return (
    <section 
      className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl overflow-hidden"
      aria-labelledby="review-stats-heading"
    >
      <h2 id="review-stats-heading" className="sr-only">Review Statistics</h2>
      
      {/* Top Section - Overall Rating & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-4 sm:p-6">
        {/* Overall Rating */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center text-center">
          <div className="text-5xl sm:text-6xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-3" aria-label={`Average rating: ${stats.averageRating.toFixed(1)} out of 5 stars`}>
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center gap-1 mb-3" role="img" aria-label={`${stats.averageRating.toFixed(1)} stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 sm:h-6 sm:w-6 ${
                  star <= Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark mb-4">
            Based on {stats.totalReviews} {stats.totalReviews === 1 ? "review" : "reviews"}
          </p>
          
          {/* Additional Stats Badges */}
          <div className="flex flex-wrap gap-2 justify-center" role="list" aria-label="Additional review statistics">
            {stats.verifiedPurchases !== undefined && stats.verifiedPurchases > 0 && (
              <span className="px-3 py-1.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 text-xs font-medium rounded-full" role="listitem">
                {stats.verifiedPurchases} verified
              </span>
            )}
            {stats.reviewsWithImages !== undefined && stats.reviewsWithImages > 0 && (
              <span className="px-3 py-1.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-medium rounded-full" role="listitem">
                {stats.reviewsWithImages} with photos
              </span>
            )}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-3 space-y-3">
          <h3 className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-4">
            Rating Distribution
          </h3>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center gap-3">
              {/* Star Label */}
              <div className="flex items-center gap-1 w-14 flex-shrink-0">
                <span className="text-sm font-medium text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
                  {rating}
                </span>
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              </div>

              {/* Progress Bar */}
              <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={stats.percentages[rating as keyof typeof stats.percentages]} aria-valuemin={0} aria-valuemax={100} aria-label={`${rating} star ratings: ${stats.percentages[rating as keyof typeof stats.percentages]}%`}>
                <div
                  className="h-full bg-yellow-400 transition-all duration-500"
                  style={{
                    width: `${stats.percentages[rating as keyof typeof stats.percentages]}%`,
                  }}
                />
              </div>

              {/* Count */}
              <span className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark w-10 text-right flex-shrink-0" aria-label={`${stats.distribution[rating as keyof typeof stats.distribution]} reviews`}>
                {stats.distribution[rating as keyof typeof stats.distribution]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Ratings */}
      {stats.detailedRatings && (
        <div className="border-t border-theme-border-light dark:border-theme-border-dark bg-gray-50 dark:bg-gray-900/30 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-stretch" role="group" aria-label="Detailed product ratings">
            <DetailedRatingDisplay label="Quality" value={stats.detailedRatings.quality} />
            <div className="hidden sm:block w-px bg-theme-border-light dark:bg-theme-border-dark" aria-hidden="true"></div>
            <DetailedRatingDisplay label="Durability" value={stats.detailedRatings.durability} />
            <div className="hidden sm:block w-px bg-theme-border-light dark:bg-theme-border-dark" aria-hidden="true"></div>
            <DetailedRatingDisplay label="Matches Description" value={stats.detailedRatings.matches_description} />
          </div>
        </div>
      )}
    </section>
  );
}