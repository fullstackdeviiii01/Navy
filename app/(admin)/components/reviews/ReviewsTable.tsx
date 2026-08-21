// app/(admin)/components/reviews/ReviewsTable.tsx
"use client";

import { Eye, Star } from "lucide-react";
import GenerateSummaryButton from "./GenerateSummaryButton";

interface Review {
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
  images?: any[];
  videos?: any[];
  verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  created_at: string;
}

interface ReviewsTableProps {
  reviews: Review[];
  onViewDetails: (review: Review) => void;
  onApprove: (reviewId: string) => void;
  onReject: (reviewId: string) => void;
  onDelete: (reviewId: string) => void;
}

export default function ReviewsTable({
  reviews,
  onViewDetails,
  onApprove,
  onReject,
  onDelete,
}: ReviewsTableProps) {
  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300">
        Approved
      </span>
    ) : (
      <span className="inline-flex px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
        Pending
      </span>
    );
  };

  // Group reviews by product
  const validReviews = reviews.filter((r) => r.product_id != null);
  const reviewsByProduct = validReviews.reduce((acc, review) => {
    const productId = review.product_id._id;
    if (!acc[productId]) {
      acc[productId] = {
        product: review.product_id,
        reviews: [],
      };
    }
    acc[productId].reviews.push(review);
    return acc;
  }, {} as Record<string, { product: any; reviews: Review[] }>);

  if (reviews.length === 0) {
    return (
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark p-12 text-center">
        <p className="text-xs uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No customer reviews found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.values(reviewsByProduct).map(({ product, reviews: productReviews }) => (
        <div
          key={product._id}
          className="bg-theme-surface-light dark:bg-theme-surface-dark border border-theme-border-light dark:border-theme-border-dark overflow-hidden"
        >
          {/* Product Header */}
          <div className="bg-theme-card-light/50 dark:bg-theme-card-dark/40 border-b border-theme-border-light dark:border-theme-border-dark p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                {product.images?.[0] && (
                  <div className="relative h-12 w-12 border border-theme-border-light dark:border-theme-border-dark overflow-hidden flex-shrink-0">
                    <img
                      src={product.images[0].url || product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-serif italic text-base text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {product.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-wider text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {productReviews.length} {productReviews.length === 1 ? "Review" : "Reviews"}
                  </p>
                </div>
              </div>
              <GenerateSummaryButton
                productId={product._id}
                productName={product.name}
              />
            </div>
          </div>

          {/* Reviews Table - Desktop */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark text-xs">
              <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-theme-text-secondary-light uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-theme-text-secondary-light uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-theme-text-secondary-light uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-theme-text-secondary-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-theme-text-secondary-light uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right font-semibold text-theme-text-secondary-light uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme-border-light dark:divide-theme-border-dark">
                {productReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[160px]">
                        {review.user_id
                          ? review.user_id.name
                          : review.guest_name || "Verified Customer"}
                      </div>
                      <div className="text-[10px] text-theme-text-muted-light truncate max-w-[160px]">
                        {review.user_id
                          ? review.user_id.email
                          : review.guest_email || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-bold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {review.rating}.0
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[260px]">
                        <div className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {review.title}
                        </div>
                        <div className="text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate">
                          {review.comment}
                        </div>
                        {((review.images && review.images.length > 0) || (review.videos && review.videos.length > 0)) && (
                          <div className="mt-1 text-[10px] text-theme-hover-light dark:text-theme-hover-dark uppercase tracking-wider">
                            {(review.images?.length || 0) + (review.videos?.length || 0)} Media Attachments
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(review.is_approved)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-theme-text-muted-light">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewDetails(review)}
                          className="px-2.5 py-1 text-[11px] uppercase tracking-wider border border-theme-border-light dark:border-theme-border-dark text-theme-text-primary-light hover:border-theme-hover-light transition-colors"
                          title="View Details"
                        >
                          Details
                        </button>
                        {!review.is_approved ? (
                          <button
                            onClick={() => onApprove(review._id)}
                            className="px-2.5 py-1 text-[11px] uppercase tracking-wider bg-green-600 hover:bg-green-700 text-white font-medium transition-colors"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => onReject(review._id)}
                            className="px-2.5 py-1 text-[11px] uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors"
                          >
                            Unapprove
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(review._id)}
                          className="px-2.5 py-1 text-[11px] uppercase tracking-wider border border-red-500/30 text-red-600 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden divide-y divide-theme-border-light dark:divide-theme-border-dark">
            {productReviews.map((review) => (
              <div key={review._id} className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                        {review.user_id?.name || review.guest_name || "Verified Customer"}
                      </span>
                      {getStatusBadge(review.is_approved)}
                    </div>
                    <p className="text-[10px] text-theme-text-muted-light">
                      {review.user_id?.email || review.guest_email || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-xs font-bold text-theme-text-primary-light">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-theme-text-primary-light truncate">
                    {review.title}
                  </h4>
                  <p className="text-xs text-theme-text-secondary-light line-clamp-2">
                    {review.comment}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
                  <span className="text-[10px] text-theme-text-muted-light">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onViewDetails(review)}
                      className="px-2 py-0.5 text-[10px] uppercase tracking-wider border border-theme-border-light text-theme-text-primary-light"
                    >
                      View
                    </button>
                    {!review.is_approved ? (
                      <button
                        onClick={() => onApprove(review._id)}
                        className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-green-600 text-white font-medium"
                      >
                        Approve
                      </button>
                    ) : (
                      <button
                        onClick={() => onReject(review._id)}
                        className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-amber-600 text-white font-medium"
                      >
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(review._id)}
                      className="px-2 py-0.5 text-[10px] uppercase tracking-wider border border-red-500/30 text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}