// app/components/account/MyReviewsTab.tsx
"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  Edit2,
  Trash2,
  Star,
  BadgeCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
} from "lucide-react";
import { reviewsApi } from "../../../lib/api/reviews";
import ReviewForm from "../reviews/ReviewForm";
import Image from "next/image";
import Loader from "../shared/Loader";

interface MyReviewsTabProps {
  authUser: any;
}

export default function MyReviewsTab({ authUser }: MyReviewsTabProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<any>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  useEffect(() => {
    fetchMyReviews();
  }, [pagination.page]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getMyReviews({
        page: pagination.page,
        limit: pagination.limit,
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

  const handleEditClick = (review: any) => {
    setEditingReview(review);
    setShowEditForm(true);
  };

  const handleUpdateReview = async (formData: any) => {
    try {
      await reviewsApi.updateReview(editingReview._id, formData);
      setShowEditForm(false);
      setEditingReview(null);
      fetchMyReviews();
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
      fetchMyReviews();
    } catch (error) {
      alert("Failed to delete review");
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingReview(null);
  };

  const DetailedRatingDisplay = ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark w-24 flex-shrink-0">
        {label}:
      </span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
        <span className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark ml-1">
          {value}/5
        </span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-12 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
          My Reviews
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
          Manage your product reviews
        </p>
      </div>

      <div className="p-4 sm:p-6">
        {showEditForm && editingReview && (
          <div className="mb-6">
            <ReviewForm
              productId={editingReview.product_id._id}
              onSubmit={handleUpdateReview}
              onCancel={handleCancelEdit}
              initialData={{
                rating: editingReview.rating,
                title: editingReview.title,
                comment: editingReview.comment,
                detailed_ratings: editingReview.detailed_ratings,
                images: editingReview.images,
                videos: editingReview.videos || [], // Add this
              }}
              isEdit={true}
            />
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Reviews Yet
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Reviews you write will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review._id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Header */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                    {review.product_id?.images?.[0] && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={review.product_id.images[0].url}
                          alt={review.product_id.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {review.product_id?.name || "Product Deleted"}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Overall Rating */}
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Status Badges */}
                        {review.is_approved ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 text-xs font-medium rounded">
                            <BadgeCheck className="w-3 h-3" />
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 text-xs font-medium rounded">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}

                        {review.verified_purchase && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-medium rounded">
                            Verified
                          </span>
                        )}

                        {review.images && review.images.length > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 text-xs font-medium rounded">
                            <ImageIcon className="w-3 h-3" />
                            {review.images.length} photo
                            {review.images.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(review.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </p>
                    </div>
                    <div className="flex gap-1 self-start">
                      <button
                        aria-label="Edit review"
                        onClick={() => handleEditClick(review)}
                        className="p-3 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="p-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                        aria-label="Delete review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="p-4 space-y-3">
                  <h5 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">
                    {review.title}
                  </h5>

                  {/* Detailed Ratings */}
                  {review.detailed_ratings && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg space-y-2">
                      <h6 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                        Detailed Ratings
                      </h6>
                      <DetailedRatingDisplay
                        label="Quality"
                        value={review.detailed_ratings.quality}
                      />
                      <DetailedRatingDisplay
                        label="Durability"
                        value={review.detailed_ratings.durability}
                      />
                      <DetailedRatingDisplay
                        label="Matches Description"
                        value={review.detailed_ratings.matches_description}
                      />
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>

                  {/* Review Images */}
                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2 pt-2">
                      {review.images.map((image: any, index: number) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                        >
                          <img
                            src={image.url}
                            alt={
                              image.caption ||
                              `Review photo ${index + 1} for ${review.product_id?.name}`
                            }
                            className="w-full h-full object-cover"
                          />
                          {image.caption && (
                            <div className="absolute inset-x-0 bottom-0 bg-black/70 text-white text-xs p-1 truncate">
                              {image.caption}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Helpful Count */}
                  {review.helpful_count > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                      {review.helpful_count}{" "}
                      {review.helpful_count === 1 ? "person" : "people"} found
                      this helpful
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <button
                aria-label="Go to previous page of reviews"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={pagination.page === 1}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                aria-label="Go to next page of reviews"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="flex items-center gap-1 px-3 sm:px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
