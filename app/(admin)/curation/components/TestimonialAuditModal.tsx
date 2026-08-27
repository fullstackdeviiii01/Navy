// app/(admin)/curation/components/TestimonialAuditModal.tsx
"use client";

import { X, Star, Check, Trash2, Image, ShieldCheck, User } from "lucide-react";
import { openImagePreview } from "../../../../lib/utils/mediaPreview";

interface Review {
  _id: string;
  user_id: {
    name: string;
    email: string;
    avatar_url?: string;
  };
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
}

interface TestimonialAuditModalProps {
  review: Review | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TestimonialAuditModal({
  review,
  onClose,
  onApprove,
  onReject,
  onDelete,
}: TestimonialAuditModalProps) {
  if (!review) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark w-full max-w-2xl rounded-2xl border border-theme-border-light dark:border-theme-border-dark shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-theme-border-light dark:border-theme-border-dark">
          <div>
            <h3 className="text-base font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
              Customer Review Details
            </h3>
            <p className="text-xs text-theme-text-muted-light mt-0.5">
              Reviewing submission for: {review.product_id?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-theme-text-muted-light hover:text-theme-text-primary-light rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Customer Info */}
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-theme-border-light dark:border-theme-border-dark bg-theme-bg-light/60 dark:bg-theme-bg-dark/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold">
                {review.user_id?.name ? review.user_id.name.charAt(0) : "C"}
              </div>
              <div>
                <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                  {review.user_id?.name || "Customer"}
                </p>
                <p className="text-[11px] text-theme-text-muted-light">
                  {review.user_id?.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < review.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Testimonial Content */}
          <div className="space-y-2">
            {review.title && (
              <h4 className="font-bold text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                "{review.title}"
              </h4>
            )}
            <p className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark leading-relaxed">
              {review.comment}
            </p>
          </div>

          {/* Media Attachments */}
          {review.images && review.images.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-theme-border-light/60 dark:border-theme-border-dark/60">
              <span className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark block">
                Customer Photos ({review.images.length})
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {review.images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() =>
                      openImagePreview(
                        img.url,
                        `${review.user_id?.name || "Customer"}'s Review Photo #${i + 1}`
                      )
                    }
                    className="aspect-square rounded-lg overflow-hidden border border-theme-border-light dark:border-theme-border-dark group relative cursor-pointer"
                  >
                    <img src={img.url} alt={img.caption || "Review media"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-theme-border-light dark:border-theme-border-dark flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onDelete(review._id);
              onClose();
            }}
            className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-semibold transition-colors"
          >
            Delete Testimonial
          </button>

          <div className="flex items-center gap-2">
            {!review.is_approved ? (
              <button
                type="button"
                onClick={() => {
                  onApprove(review._id);
                  onClose();
                }}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 rounded-lg text-xs font-semibold shadow-xs hover:shadow active:scale-[0.99] transition-all"
              >
                Approve & Publish
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onReject(review._id);
                  onClose();
                }}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Unpublish Testimonial
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
