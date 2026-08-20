"use client";

import { useState, useEffect } from "react";
import {
  X,
  Star,
  SlidersHorizontal,
  ChevronDown,
  Image as ImageIcon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { reviewsApi } from "../../../lib/api/reviews";
import ReviewCard from "./ReviewCard";

interface AllReviewsModalProps {
  productId: string;
  onClose: () => void;
  currentUserId?: string;
  currentSessionId?: string | null;
}

export default function AllReviewsModal({
  productId,
  onClose,
  currentUserId,
  currentSessionId,
}: AllReviewsModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterRating, setFilterRating] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withImages, setWithImages] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userVotes, setUserVotes] = useState<
    Record<string, "helpful" | "not_helpful" | null>
  >({});

  useEffect(() => {
    fetchReviews();
  }, [page, sortBy, sortOrder, filterRating, verifiedOnly, withImages]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await reviewsApi.getProductReviews(productId, {
        page,
        limit: 10,
        sortBy,
        sortOrder,
        min_rating: filterRating > 0 ? filterRating : undefined,
        verified_only: verifiedOnly,
        with_images: withImages,
      });
      setReviews(data.reviews || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (
    reviewId: string,
    voteType: "helpful" | "not_helpful"
  ) => {
    try {
      const result = await reviewsApi.markHelpful(reviewId, voteType);
      setUserVotes((prev) => ({ ...prev, [reviewId]: result.current_vote }));
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId
            ? {
                ...review,
                helpful_count: result.helpful_count,
                not_helpful_count: result.not_helpful_count,
              }
            : review
        )
      );
    } catch (error) {
      console.error("Failed to mark helpful:", error);
    }
  };

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setPage(1);
  };

  const handleRatingFilter = (rating: number) => {
    setFilterRating(rating === filterRating ? 0 : rating);
    setPage(1);
  };

  const clearAllFilters = () => {
    setFilterRating(0);
    setVerifiedOnly(false);
    setWithImages(false);
    setPage(1);
  };

  const hasActiveFilters = filterRating > 0 || verifiedOnly || withImages;
  const activeFilterCount = [
    filterRating > 0,
    verifiedOnly,
    withImages,
  ].filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full sm:max-w-4xl sm:mx-4 bg-white dark:bg-gray-950 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        style={{ height: "92vh", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-baseline gap-3">
            <h2
              id="modal-title"
              className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              Customer Reviews
            </h2>
            {pagination && (
              <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">
                {pagination.total.toLocaleString()} reviews
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close reviews"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div className="px-5 sm:px-7 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 bg-gray-50/60 dark:bg-gray-900/40">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Sort */}
            <div className="relative">
              <label htmlFor="sort-reviews" className="sr-only">Sort reviews</label>
              <select
                id="sort-reviews"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-primary cursor-pointer"
              >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="rating-asc">Lowest Rated</option>
                <option value="helpful-desc">Most Helpful</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-label={`${showFilters ? "Hide" : "Show"} filters${hasActiveFilters ? `, ${activeFilterCount} active` : ""}`}
              aria-expanded={showFilters}
              className={`flex items-center gap-1.5 pl-3 pr-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                hasActiveFilters
                  ? "bg-theme-primary text-white border-theme-primary"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="ml-0.5 w-4 h-4 flex items-center justify-center bg-white/25 text-white text-[10px] font-bold rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Quick rating pills */}
            <div className="flex gap-1.5 ml-1">
              {[5, 4, 3, 2, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRatingFilter(r)}
                  aria-label={`Filter by ${r} stars`}
                  aria-pressed={filterRating === r}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    filterRating === r
                      ? "bg-amber-400 text-white border-amber-400"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-amber-300"
                  }`}
                >
                  <Star
                    size={10}
                    className={filterRating === r ? "fill-white" : "fill-amber-400 text-amber-400"}
                  />
                  {r}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="ml-auto text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors underline underline-offset-2"
                aria-label="Clear all filters"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div className="mt-3 flex flex-wrap gap-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => {
                    setVerifiedOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
                />
                <ShieldCheck size={14} className="text-green-500" />
                <span className="font-medium">Verified Purchases Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors select-none">
                <input
                  type="checkbox"
                  checked={withImages}
                  onChange={(e) => {
                    setWithImages(e.target.checked);
                    setPage(1);
                  }}
                  className="w-4 h-4 rounded border-gray-300 text-theme-primary focus:ring-theme-primary"
                />
                <ImageIcon size={14} className="text-blue-500" />
                <span className="font-medium">With Photos Only</span>
              </label>
            </div>
          )}
        </div>

        {/* ── Scrollable Content ── */}
        <div
          className="flex-1 overflow-y-auto px-5 sm:px-7 py-4 sm:py-5 space-y-3"
          role="feed"
          aria-label="Customer reviews"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3" role="status" aria-live="polite">
              <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-theme-primary rounded-full animate-spin" />
              <span className="text-sm text-gray-400">Loading reviews…</span>
              <span className="sr-only">Loading reviews</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2" role="status">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Star size={20} className="text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {hasActiveFilters
                  ? "No reviews match your filters."
                  : "No reviews yet for this product."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-theme-primary hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={currentUserId}
                currentSessionId={currentSessionId}
                onMarkHelpful={handleMarkHelpful}
                userVote={userVotes[review._id]}
              />
            ))
          )}
        </div>

        {/* ── Pagination Footer ── */}
        {pagination && pagination.totalPages > 1 && (
          <nav
            className="flex-shrink-0 flex items-center justify-between gap-3 px-5 sm:px-7 py-3 sm:py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/40"
            aria-label="Reviews pagination"
          >
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
              <span className="hidden xs:inline">Previous</span>
            </button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                let pageNum: number;
                const total = pagination.totalPages;

                if (total <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= total - 2) {
                  pageNum = total - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    aria-label={`Page ${pageNum}`}
                    aria-current={page === pageNum ? "page" : undefined}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === pageNum
                        ? "bg-theme-primary text-white shadow-sm"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
              aria-label="Next page"
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span className="hidden xs:inline">Next</span>
              <ChevronRight size={15} />
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}