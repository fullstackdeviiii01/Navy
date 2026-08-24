// app/(admin)/curation/components/TestimonialsDataTable.tsx
"use client";

import { Eye, Check, X, Trash2, Star, Image, Video, ShieldCheck } from "lucide-react";

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

interface TestimonialsDataTableProps {
  reviews: Review[];
  onViewDetails: (review: Review) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TestimonialsDataTable({
  reviews,
  onViewDetails,
  onApprove,
  onReject,
  onDelete,
}: TestimonialsDataTableProps) {
  if (reviews.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12 text-center text-xs text-theme-text-muted-light">
        No customer reviews found.
      </div>
    );
  }

  return (
    <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-theme-card-light/70 dark:bg-theme-card-dark/50 border-b border-theme-border-light dark:border-theme-border-dark text-[11px] uppercase tracking-wider text-theme-text-secondary-light dark:text-theme-text-secondary-dark font-semibold">
              <th className="py-3 px-4">Customer & Product</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Review Text</th>
              <th className="py-3 px-4">Media</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Moderation Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border-light/60 dark:divide-theme-border-dark/60">
            {reviews.map((r) => (
              <tr
                key={r._id}
                className="hover:bg-theme-card-light/40 dark:hover:bg-theme-card-dark/30 transition-colors"
              >
                {/* Customer & Product */}
                <td className="py-3.5 px-4 max-w-[200px]">
                  <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                    {r.user_id?.name || "Customer"}
                  </p>
                  <p className="text-[11px] text-theme-text-muted-light truncate">
                    {r.product_id?.name || "Product"}
                  </p>
                  {r.verified_purchase && (
                    <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Verified Buyer
                    </span>
                  )}
                </td>

                {/* Rating */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < r.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300 dark:text-neutral-700"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-[11px] ml-1">{r.rating}.0</span>
                  </div>
                </td>

                {/* Content */}
                <td className="py-3.5 px-4 max-w-[240px]">
                  {r.title && (
                    <p className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                      "{r.title}"
                    </p>
                  )}
                  <p className="text-[11px] text-theme-text-secondary-light dark:text-theme-text-secondary-dark line-clamp-2 mt-0.5">
                    {r.comment}
                  </p>
                </td>

                {/* Media */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-theme-text-muted-light">
                    {r.images?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                        <Image className="w-3 h-3" />
                        {r.images.length}
                      </span>
                    )}
                    {r.videos?.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        <Video className="w-3 h-3" />
                        {r.videos.length}
                      </span>
                    )}
                    {!r.images?.length && !r.videos?.length && (
                      <span className="text-[10px] text-theme-text-muted-light">—</span>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      r.is_approved
                        ? "bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300"
                        : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                    }`}
                  >
                    {r.is_approved ? "Approved" : "Pending Audit"}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-1">
                    {/* View Details */}
                    <button
                      type="button"
                      onClick={() => onViewDetails(r)}
                      className="p-1.5 text-theme-text-muted-light hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                      title="Audit Review Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Approve button */}
                    {!r.is_approved && (
                      <button
                        type="button"
                        onClick={() => onApprove(r._id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors"
                        title="Approve & Publish"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Reject button */}
                    {r.is_approved && (
                      <button
                        type="button"
                        onClick={() => onReject(r._id)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors"
                        title="Reject & Unpublish"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => onDelete(r._id)}
                      className="p-1.5 text-theme-text-muted-light hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="Permanently Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
