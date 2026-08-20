// app/components/product-detail/ProductReviewSection-with-ai.tsx
"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Plus } from "lucide-react";
import { reviewsApi } from "../../../lib/api/reviews";
import { useUser } from "../../context/UserContext";
import ReviewCard from "../reviews/ReviewCard";
import ReviewForm from "../reviews/ReviewForm";
import ReviewStats from "../reviews/ReviewStats";
import AllReviewsModal from "../reviews/AllReviewsModal";
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
  const [showForm, setShowForm] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState("");
  const [userVotes, setUserVotes] = useState
    <Record<string, "helpful" | "not_helpful" | null>
  >({});
  const [sessionId, setSessionId] = useState<string | null>(null);

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

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLatestReviews(),
        fetchStats(),
        checkEligibility(),
      ]);
    } catch (error) {
      console.error("fetchInitialData failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestReviews = async () => {
    try {
      const data = await reviewsApi.getProductReviews(productId, {
        page: 1,
        limit: 5,
        sortBy: "created_at",
        sortOrder: "desc",
      });
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
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
      fetchInitialData();
      alert(
        "Review submitted successfully! It will be published after approval.",
      );
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
    <div className="py-2">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 sm:mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1">
              Customer Reviews
            </h2>
            {hasReviews && (
              <p className="text-sm text-theme-text-muted-light dark:text-theme-text-muted-dark">
                See what customers are saying about this product
              </p>
            )}
          </div>
          {hasReviews && (
            <button
              onClick={() => setShowAllModal(true)}
              className="self-start sm:self-auto px-4 py-2.5 border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white font-medium transition-all duration-200 text-sm sm:text-base"
              aria-label="View all customer reviews"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              View All Reviews
            </button>
          )}
        </div>

        {/* AI Summary - Only shown if reviews exist */}
        {hasReviews && <AISummaryDisplay productId={productId} />}

        {/* Stats Section */}
        {hasReviews && (
          <div className="mb-8 sm:mb-10">
            <ReviewStats stats={stats} />
          </div>
        )}

        {/* Action Buttons & Messages */}
        <div className="mb-6 sm:mb-8 space-y-4">
          {canReview && !showForm && (
            <div className="flex justify-center sm:justify-start">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                aria-label="Write a product review"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Plus size={20} />
                Write a Review
              </button>
            </div>
          )}

          {!canReview && !showForm && eligibilityMessage && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg" role="status">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {eligibilityMessage}
              </p>
            </div>
          )}
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="mb-8 sm:mb-10">
            <ReviewForm
              productId={productId}
              onSubmit={handleCreateReview}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {/* Reviews List */}
        {hasReviews ? (
          <div className="space-y-5">
            <h3 className="text-lg sm:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Recent Reviews
            </h3>
            
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

            {stats.totalReviews > 5 && (
              <div className="pt-6 text-center">
                <button
                  onClick={() => setShowAllModal(true)}
                  className="px-8 py-3 border-2 border-theme-primary text-theme-primary rounded-lg hover:bg-theme-primary hover:text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                  aria-label={`Load ${stats.totalReviews - 5} more reviews`}
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  Load More Reviews ({stats.totalReviews - 5} remaining)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 sm:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/30 dark:to-gray-800/30 border-2 border-dashed border-theme-border-light dark:border-theme-border-dark rounded-2xl">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-5">
              <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-theme-text-muted-light dark:text-theme-text-muted-dark" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
              No Reviews Yet
            </h3>
            <p className="text-sm sm:text-base text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-6 max-w-md mx-auto">
              Be the first to share your experience with this product and help others make informed decisions
            </p>
            {canReview && !showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-theme-primary text-white rounded-lg hover:bg-theme-primary-hover transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                aria-label="Write the first review for this product"
                style={{ minWidth: '44px', minHeight: '44px' }}
              >
                <Plus size={20}/>
                Write the First Review
              </button>
            )}
          </div>
        )}

        {/* All Reviews Modal */}
        {showAllModal && (
          <AllReviewsModal
            productId={productId}
            onClose={() => setShowAllModal(false)}
            currentUserId={dbUser?._id}
            currentSessionId={sessionId}
          />
        )}
      </div>
    </div>
  );
}