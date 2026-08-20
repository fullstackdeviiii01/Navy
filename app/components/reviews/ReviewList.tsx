// // app/components/reviews/ReviewList.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus } from "lucide-react";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import ReviewStats from "./ReviewStats";
import { reviewsApi } from "../../../lib/api/reviews";
import { useUser } from "../../context/UserContext";
import Loader from "../shared/Loader";

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const { isAuthenticated, dbUser } = useUser();
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [canReview, setCanReview] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [page, setPage] = useState(1);
  const [userVotes, setUserVotes] = useState<Record<string, "helpful" | "not_helpful" | null>>({});
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    fetchReviews();
    fetchStats();
    if (isAuthenticated) {
      checkEligibility();
    }
  }, [productId, page, isAuthenticated]);

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

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.getProductReviews(productId, {
        page,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
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
    } catch (error) {
      console.error("Failed to check eligibility:", error);
    }
  };

  const handleCreateReview = async (formData: {
    rating: number;
    title: string;
    comment: string;
    detailed_ratings: {
      quality: number;
      durability: number;
      matches_description: number;
    };
    images: Array<{ url: string; caption?: string }>;
    videos: Array<{ url: string; thumbnail?: string; caption?: string }>;
  }) => {
    try {
      const result = await reviewsApi.createReview({
        product_id: productId,
        ...formData,
      });
      setShowForm(false);
      fetchReviews();
      fetchStats();
      checkEligibility();
      alert(
        "Review submitted successfully! It will be published after approval.",
      );
    } catch (error: any) {
      throw error;
    }
  };

  const handleUpdateReview = async (formData: {
    rating: number;
    title: string;
    comment: string;
  }) => {
    try {
      await reviewsApi.updateReview(editingReview._id, formData);
      setEditingReview(null);
      setShowForm(false);
      fetchReviews();
      fetchStats();
      alert(
        "Review updated successfully! It will be published after re-approval.",
      );
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewsApi.deleteReview(reviewId);
      fetchReviews();
      fetchStats();
      checkEligibility();
    } catch (error) {
      alert("Failed to delete review");
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

  const handleEditClick = (review: any) => {
    setEditingReview(review);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  if (loading) {
    return (
      <div className="relative py-8">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && stats.totalReviews > 0 && <ReviewStats stats={stats} />}

      {/* Write Review Button */}
      {isAuthenticated && canReview && !showForm && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-colors font-medium min-h-[44px]"
            aria-label="Write a product review"
          >
            <Plus size={20} />
            Write a Review
          </button>
        </div>
      )}

      {/* Eligibility Message */}
      {isAuthenticated && !canReview && !showForm && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg" role="status">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {eligibilityMessage}
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <ReviewForm
          productId={productId}
          onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
          onCancel={handleCancelForm}
          initialData={editingReview}
          isEdit={!!editingReview}
        />
      )}

      {/* Reviews List */}
      <section className="space-y-6" aria-labelledby="reviews-heading">
        <div className="flex items-center justify-between">
          <h3 id="reviews-heading" className="text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
            Customer Reviews ({pagination?.total || 0})
          </h3>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark rounded-xl">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4" aria-hidden="true">
              <MessageSquare
                size={32}
                className="text-theme-text-muted-light dark:text-theme-text-muted-dark"
              />
            </div>
            <h3 className="text-lg font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              No Reviews Yet
            </h3>
            <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
              Be the first to review this product
            </p>
          </div>
        ) : (
          <>
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

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <nav className="flex items-center justify-center gap-2 pt-6" aria-label="Reviews pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  aria-label="Go to previous page"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-theme-text-secondary-light dark:text-theme-text-secondary-dark" aria-current="page">
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                  aria-label="Go to next page"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}