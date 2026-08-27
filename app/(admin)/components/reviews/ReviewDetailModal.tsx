// app/(admin)/components/reviews/ReviewDetailModal.tsx
"use client";

import {
  X,
  Star,
  Check,
  ThumbsUp,
  CheckCircle,
  XCircle,
  Trash2,
  Play,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { getPrimaryProductImage } from "../../../../lib/utils/productImageUtils";

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
    images?: Array<{
      url: string;
      caption?: string;
    }>;
    videos?: Array<{
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

  const displayName = review.user_id?.name || review.guest_name || "Verified Customer";
  const displayEmail = review.user_id?.email || review.guest_email || "N/A";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-detail-title"
      >
        <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-theme-border-light dark:border-theme-border-dark sticky top-0 bg-theme-surface-light dark:bg-theme-surface-dark z-10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-theme-hover-light dark:text-theme-hover-dark font-medium">
                MODERATION
              </p>
              <h3 id="review-detail-title" className="text-xl italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
                Review Details
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 border border-theme-border-light dark:border-theme-border-dark hover:border-theme-hover-light transition-colors"
              aria-label="Close review details"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product & Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 p-4">
                <h4 className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2">
                  Product
                </h4>
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 border border-theme-border-light dark:border-theme-border-dark flex-shrink-0 overflow-hidden bg-black/5 rounded">
                    <img
                      src={getPrimaryProductImage(review.product_id)}
                      alt={review.product_id?.name || "Product"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      {review.product_id?.name}
                    </p>
                    <p className="text-[10px] text-theme-text-muted-light truncate">
                      ID: {review.product_id?._id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/50 dark:bg-theme-bg-dark/50 p-4">
                <h4 className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light dark:text-theme-text-muted-dark mb-2">
                  Customer Info
                </h4>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                    {displayEmail}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Content */}
            <div className="border border-theme-border-light dark:border-theme-border-dark bg-theme-surface-light dark:bg-theme-surface-dark p-6 space-y-4">
              {/* Rating & Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-theme-border-light dark:border-theme-border-dark">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? "fill-amber-500 text-amber-500"
                            : "text-theme-border-light dark:text-theme-border-dark"
                        }`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {review.rating}.0 / 5.0
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {review.verified_purchase && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300 text-[10px] uppercase tracking-wider font-medium">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] uppercase tracking-wider font-medium ${
                      review.is_approved
                        ? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {review.is_approved ? "Approved" : "Pending Approval"}
                  </span>
                </div>
              </div>

              {/* Title & Comment */}
              <div className="space-y-2">
                <h5 className="text-base italic text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {review.title}
                </h5>
                <p className="text-xs sm:text-sm text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
                  {review.comment}
                </p>
              </div>

              {/* Attached Photos & Videos */}
              {((review.images && review.images.length > 0) || (review.videos && review.videos.length > 0)) && (
                <div className="pt-4 border-t border-theme-border-light dark:border-theme-border-dark">
                  <h5 className="text-[10px] uppercase tracking-wider font-semibold text-theme-text-muted-light mb-3">
                    Attached Media (Click to preview)
                  </h5>
                  <div className="flex flex-wrap gap-3">
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
                        className="relative w-20 h-20 border border-theme-border-light dark:border-theme-border-dark overflow-hidden hover:opacity-80 transition-opacity"
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
                        className="relative w-24 h-20 border border-theme-border-light dark:border-theme-border-dark overflow-hidden bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                        aria-label={video.caption || `View video ${index + 1}`}
                      >
                        {video.thumbnail ? (
                          <img
                            src={video.thumbnail}
                            alt={video.caption || `Video ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps */}
            <div className="text-[10px] uppercase tracking-wider text-theme-text-muted-light flex justify-between">
              <span>Submitted: {new Date(review.created_at).toLocaleString()}</span>
              <span>ID: {review._id}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/30 dark:bg-theme-bg-dark/30">
            {!review.is_approved ? (
              <button
                onClick={() => {
                  onApprove(review._id);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>APPROVE REVIEW</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onReject(review._id);
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white text-xs uppercase tracking-[0.2em] font-medium transition-colors inline-flex items-center justify-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                <span>UNAPPROVE REVIEW</span>
              </button>
            )}
            
            <button
              onClick={() => {
                if (confirm("Are you sure you want to permanently delete this review?")) {
                  onDelete(review._id);
                  onClose();
                }
              }}
              className="py-3 px-6 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs uppercase tracking-[0.2em] font-medium transition-colors inline-flex items-center justify-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>DELETE</span>
            </button>
            <button
              onClick={onClose}
              className="py-3 px-6 border border-theme-border-light dark:border-theme-border-dark text-theme-text-secondary-light hover:border-theme-hover-light text-xs uppercase tracking-[0.2em] font-medium transition-colors"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-xs z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-10"
            aria-label="Close media viewer"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt={selectedMedia.caption || "Review media"}
                className="w-auto h-auto max-h-[80vh] object-contain border border-white/10"
              />
            ) : (
              <video
                src={selectedMedia.url}
                controls
                autoPlay
                className="w-full max-h-[80vh] border border-white/10"
              >
                Your browser does not support the video tag.
              </video>
            )}
            {selectedMedia.caption && (
              <p className="mt-3 text-center text-white text-xs sm:text-sm">
                {selectedMedia.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}