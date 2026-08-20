// // ReviewDetailModal.tsx
"use client";

import {
  X,
  Star,
  BadgeCheck,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Trash2,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ReviewDetailModalProps {
  review: {
    _id: string;
    user_id?: {
      name: string;
      email: string;
      avatar_url?: string;
    } | null;
    guest_email?: string;
    guest_name?: string;
    product_id: {
      _id: string;
      name: string;
      images: any[];
    };
    rating: number;
    title: string;
    comment: string;
    detailed_ratings: {
      quality: number;
      durability: number;
      matches_description: number;
    };
    images: Array<{
      url: string;
      caption?: string;
    }>;
    videos: Array<{
      url: string;
      thumbnail?: string;
      caption?: string;
    }>;
    verified_purchase: boolean;
    is_approved: boolean;
    helpful_count: number;
    created_at: string;
  };
  onClose: () => void;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

export default function ReviewDetailModal({
  review,
  onClose,
  onApprove,
  onReject,
  onDelete,
}: ReviewDetailModalProps) {
  const [selectedMedia, setSelectedMedia] = useState<{
    type: "image" | "video";
    url: string;
    caption?: string;
  } | null>(null);

  const DetailedRatingBar = ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark">
          {label}
        </span>
        <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
          {value}/5
        </span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 transition-all duration-300"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-3 md:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-detail-title"
      >
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-3 md:mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 md:p-6 border-b border-theme-border-light dark:border-theme-border-dark sticky top-0 bg-theme-surface-light dark:bg-theme-surface-dark z-10">
            <h3 id="review-detail-title" className="text-base sm:text-lg md:text-xl font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
              Review Details
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark rounded-lg transition-colors flex-shrink-0"
              aria-label="Close review details"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
            {/* Product Info */}
            <div className="bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2 sm:mb-3">
                Product
              </h4>
              <div className="flex items-center gap-2 sm:gap-3">
                {review.product_id.images?.[0] && (
                  <div className="relative h-12 w-12 sm:h-16 sm:w-16 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={review.product_id.images[0].url}
                      alt={review.product_id.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {review.product_id.name}
                  </p>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                    ID: {review.product_id._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg p-3 sm:p-4">
              <h4 className="text-xs sm:text-sm font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2 sm:mb-3">
                Customer
              </h4>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                  {review.user_id?.avatar_url ? (
                    <Image
                      src={review.user_id.avatar_url}
                      alt={review.user_id.name}
                      fill
                      className="object-cover"
                      sizes="40px sm:48px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base sm:text-xl font-semibold text-gray-500 dark:text-gray-400">
                      {(review.user_id
                        ? review.user_id.name
                        : review.guest_name
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm sm:text-base font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {review.user_id ? review.user_id.name : review.guest_name}
                  </p>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                    {review.user_id ? review.user_id.email : review.guest_email}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-theme-text-secondary-light dark:text-theme-text-secondary-dark mb-2 sm:mb-3">
                Review
              </h4>

              {/* Rating */}
              <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      star <= review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-1 sm:ml-2 text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {review.rating}.0
                </span>
              </div>

              {/* Detailed Ratings */}
              {review.detailed_ratings && (
                <div className="space-y-2 mb-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <h5 className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
                    Detailed Ratings
                  </h5>
                  <DetailedRatingBar
                    label="Quality"
                    value={review.detailed_ratings.quality}
                  />
                  <DetailedRatingBar
                    label="Durability"
                    value={review.detailed_ratings.durability}
                  />
                  <DetailedRatingBar
                    label="Matches Description"
                    value={review.detailed_ratings.matches_description}
                  />
                </div>
              )}

              {/* Title */}
              <h5 className="text-base sm:text-lg font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-1.5 sm:mb-2 break-words">
                {review.title}
              </h5>

              {/* Comment */}
              <p className="text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed mb-3 sm:mb-4 break-words">
                {review.comment}
              </p>

              {/* Media */}
              {(review.images?.length > 0 || review.videos?.length > 0) && (
                <div className="mb-3">
                  <h5 className="text-xs sm:text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark mb-2">
                    Attachments
                  </h5>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                    {review.images?.map((image, index) => (
                      <button
                        key={`img-${index}`}
                        onClick={() =>
                          setSelectedMedia({
                            type: "image",
                            url: image.url,
                            caption: image.caption,
                          })
                        }
                        className="relative aspect-square rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark hover:opacity-80 transition-opacity"
                        aria-label={image.caption || `View image ${index + 1}`}
                      >
                        <img
                          src={image.url}
                          alt={image.caption || `Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                    {review.videos?.map((video, index) => (
                      <button
                        key={`vid-${index}`}
                        onClick={() =>
                          setSelectedMedia({
                            type: "video",
                            url: video.url,
                            caption: video.caption,
                          })
                        }
                        className="relative aspect-square rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark hover:opacity-80 transition-opacity"
                        aria-label={video.caption || `View video ${index + 1}`}
                      >
                        {video.thumbnail && (
                          <img
                            src={video.thumbnail}
                            alt={video.caption || `Video ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {review.verified_purchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs sm:text-sm font-medium rounded-full">
                    <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                    Verified Purchase
                  </span>
                )}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm font-medium rounded-full ${
                    review.is_approved
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {review.is_approved ? (
                    <>
                      <CheckCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                      Approved
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                      Pending
                    </>
                  )}
                </span>
                {review.helpful_count > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs sm:text-sm font-medium rounded-full">
                    <ThumbsUp className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
                    {review.helpful_count} helpful
                  </span>
                )}
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 bg-theme-bg-light dark:bg-theme-bg-dark rounded-lg p-3 sm:p-4">
              <div className="min-w-0">
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1">
                  Review ID
                </p>
                <p className="text-xs sm:text-sm font-mono text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                  {review._id}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark mb-1">
                  Submitted On
                </p>
                <p className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {new Date(review.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 p-3 sm:p-4 md:p-6 border-t border-theme-border-light dark:border-theme-border-dark">
            {!review.is_approved ? (
              <button
                onClick={() => {
                  onApprove(review._id);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm font-medium"
                aria-label="Approve review"
              >
                <CheckCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                <span className="hidden xs:inline">Approve Review</span>
                <span className="xs:hidden">Approve</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onReject(review._id);
                  onClose();
                }}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6 py-2 sm:py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs sm:text-sm font-medium"
                aria-label="Unapprove review"
              >
                <XCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                <span className="hidden xs:inline">Unapprove Review</span>
                <span className="xs:hidden">Unapprove</span>
              </button>
            )}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this review?")) {
                    onDelete(review._id);
                    onClose();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium"
                aria-label="Delete review"
              >
                <Trash2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                <span className="hidden xs:inline">Delete</span>
                <span className="xs:hidden">Delete</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2 sm:py-3 border border-theme-border-light dark:border-theme-border-dark rounded-lg text-theme-text-secondary-light dark:text-theme-text-secondary-dark hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors text-xs sm:text-sm"
              >
                <span className="hidden xs:inline">Close</span>
                <span className="xs:hidden">Close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Media Viewer */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Media viewer"
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            aria-label="Close media viewer"
          >
            <X className="h-8 w-8" />
          </button>

          <div
            className="max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.caption || "Review media"}
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full h-auto max-h-[80vh] rounded-lg"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {selectedMedia.caption && (
              <p className="mt-4 text-center text-white text-sm sm:text-base">
                {selectedMedia.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}