// app/components/product-detail/ProductReviewSection.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus, Filter, ArrowUpDown } from "lucide-react";
import { reviewsApi } from "../../../lib/api/reviews";
import { useUser } from "../../context/UserContext";
import ReviewCard from "../reviews/ReviewCard";
import ReviewForm from "../reviews/ReviewForm";
import ReviewStats from "../reviews/ReviewStats";
import AISummaryDisplay from "../reviews/AISummaryDisplay";
import Loader from "../shared/Loader";

interface ProductReviewSectionProps {
  productId: string;
}

export default function ProductReviewSection({
  productId,
}: ProductReviewSectionProps) {
  const { isAuthenticated, dbUser } = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, "helpful" | "not_helpful" | null>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Pagination & Filter state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalFilteredReviews, setTotalFilteredReviews] = useState(0);
  const [filterType, setFilterType] = useState<"all" | "verified" | "media" | "5" | "4" | "3" | "2" | "1">("all");
  const [sortBy, setSortBy] = useState<"created_at" | "rating" | "helpful">("created_at");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  useEffect(() => {
    fetchInitialData();
  }, [productId, isAuthenticated]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const sid =
        document.cookie
          .split("; ")
          .find((row) => row.startsWith("session_id="))
          ?.split("=")[1] || null;
      setSessionId(sid);
    }
  }, []);

  useEffect(() => {
    // When filter/sort changes, reload from page 1
    fetchReviews(1, true);
  }, [filterType, sortBy, sortOrder]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchReviews(1, true),
        fetchStats(),
        checkEligibility(),
      ]);
    } catch (error) {
      console.error("fetchInitialData failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (pageNum: number, resetList = false) => {
    try {
      if (!resetList) setLoadingMore(true);

      const params: any = {
        page: pageNum,
        limit: 5,
        sortBy,
        sortOrder,
      };

      if (filterType === "verified") params.verified_only = true;
      if (filterType === "media") params.with_images = true;
      if (["5", "4", "3", "2", "1"].includes(filterType)) params.min_rating = parseInt(filterType);

      const data = await reviewsApi.getProductReviews(productId, params);
      const newReviews = data.reviews || [];
      const total = data.pagination?.total || 0;

      if (resetList) {
        setReviews(newReviews);
      } else {
        setReviews((prev) => [...prev, ...newReviews]);
      }

      setPage(pageNum);
      setTotalFilteredReviews(total);
      setHasMore(pageNum * 5 < total);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      if (resetList) setReviews([]);
    } finally {
      if (!resetList) setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      fetchReviews(page + 1, false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await reviewsApi.getReviewStats(productId);
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const checkEligibility = async () => {
    try {
      const data = await reviewsApi.checkEligibility(productId);
      setCanReview(data.canReview);
      setEligibilityMessage(data.message);

      if (data.existingReview) {
        setCanReview(false);
      }
    } catch (error) {
      console.error("Failed to check eligibility:", error);
    }
  };

  const handleCreateReview = async (formData: {
    rating: number;
    title: string;
    comment: string;
    images?: Array<{ url: string; caption?: string }>;
    videos?: Array<{ url: string; thumbnail?: string; caption?: string }>;
  }) => {
    try {
      await reviewsApi.createReview({
        product_id: productId,
        ...formData,
      });
      setShowForm(false);
      fetchInitialData();
      alert("Review submitted successfully. It will appear once approved by our atelier.");
    } catch (error: any) {
      throw error;
    }
  };

  const handleMarkHelpful = async (
    reviewId: string,
    voteType: "helpful" | "not_helpful",
  ) => {
    try {
      const result = await reviewsApi.markHelpful(reviewId, voteType);

      setUserVotes((prev) => ({
        ...prev,
        [reviewId]: result.current_vote,
      }));

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId
            ? {
                ...review,
                helpful_count: result.helpful_count,
                not_helpful_count: result.not_helpful_count,
              }
            : review,
        ),
      );
    } catch (error) {
      console.error("Failed to mark helpful:", error);
    }
  };

  if (loading) {
    return (
      <div className="relative py-12">
        <Loader />
      </div>
    );
  }

  const hasReviews = stats && stats.totalReviews > 0;

  return (
    <div className="py-6 space-y-8">
      {/* Header & Write Button */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-theme-border-light dark:border-theme-border-dark">
        <div>
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-theme-hover-light dark:text-theme-hover-dark mb-1">
            CLIENT FEEDBACK
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Verified <span className="italic font-normal font-serif text-theme-hover-light dark:text-theme-hover-dark">Reviews</span>
          </h2>
        </div>

        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="self-start sm:self-auto px-6 py-3 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>WRITE A REVIEW</span>
          </button>
        )}
      </div>

      {/* Write Review Inline Form */}
      {showForm && (
        <div className="border border-theme-border-light dark:border-theme-border-dark">
          <ReviewForm
            productId={productId}
            onSubmit={handleCreateReview}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {!canReview && !showForm && eligibilityMessage && (
        <div className="p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-card-light/30 dark:bg-theme-card-dark/20 text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark" role="status">
          {eligibilityMessage}
        </div>
      )}

      {/* AI Summary Display */}
      {hasReviews && <AISummaryDisplay productId={productId} />}

      {/* Stats Breakdown */}
      {hasReviews && <ReviewStats stats={stats} />}

      {/* Reviews Filter & Toolbar */}
      {hasReviews && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Filter:
              </span>
              {[
                { id: "all", label: "All Reviews" },
                { id: "verified", label: "Verified Only" },
                { id: "media", label: "With Media" },
                { id: "5", label: "5 Stars" },
                { id: "4", label: "4 Stars" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`px-3 py-1 text-[11px] uppercase tracking-wider border transition-colors ${
                    filterType === tab.id
                      ? "border-theme-primary bg-theme-primary text-theme-btn-text font-medium"
                      : "border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light hover:border-theme-hover-light"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-theme-text-muted-light font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-wider focus:outline-none focus:border-theme-hover-light"
              >
                <option value="created_at">Most Recent</option>
                <option value="rating">Rating</option>
                <option value="helpful">Most Helpful</option>
              </select>
            </div>
          </div>

          {/* Review Cards List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                currentUserId={dbUser?._id}
                currentSessionId={sessionId}
                onMarkHelpful={handleMarkHelpful}
                userVote={userVotes[review._id]}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="pt-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-4 border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark hover:border-theme-hover-light text-theme-text-primary-light dark:text-theme-text-primary-dark text-xs uppercase tracking-[0.2em] font-medium transition-colors disabled:opacity-50"
              >
                {loadingMore ? "LOADING REVIEWS..." : `LOAD MORE REVIEWS (${totalFilteredReviews - reviews.length} REMAINING)`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!hasReviews && (
        <div className="border border-dashed border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark text-center py-16 px-4 space-y-4">
          <MessageSquare className="w-8 h-8 text-theme-hover-light dark:text-theme-hover-dark mx-auto" />
          <h3 className="text-xl font-serif italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
            No Reviews Yet
          </h3>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark max-w-sm mx-auto">
            Be the first to share your thoughts on this artisanal luminaire.
          </p>
          {canReview && !showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-theme-primary hover:bg-theme-hover-light dark:hover:bg-theme-hover-dark text-theme-btn-text text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              WRITE THE FIRST REVIEW
            </button>
          )}
        </div>
      )}
    </div>
  );
}