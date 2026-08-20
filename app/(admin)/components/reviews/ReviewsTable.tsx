// // ReviewsTableWithAI.tsx
"use client";

import { Eye } from "lucide-react";
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
      <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        Approved
      </span>
    ) : (
      <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
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
      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow p-6 sm:p-8 md:p-12 text-center border border-theme-border-light dark:border-theme-border-dark">
        <p className="text-sm sm:text-base text-theme-text-muted-light dark:text-theme-text-muted-dark">
          No reviews found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.values(reviewsByProduct).map(({ product, reviews: productReviews }) => (
        <div
          key={product._id}
          className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark overflow-hidden"
        >
          {/* Product Header with Generate Summary Button */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-theme-border-light dark:border-theme-border-dark p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                {product.images?.[0] && (
                  <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {product.name}
                  </h3>
                  <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark">
                    {productReviews.length} {productReviews.length === 1 ? "review" : "reviews"}
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
            <table className="min-w-full divide-y divide-theme-border-light dark:divide-theme-border-dark">
              <thead className="bg-theme-bg-light dark:bg-theme-bg-dark">
                <tr>
                  <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Review
                  </th>
                  <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-theme-text-muted-light dark:text-theme-text-secondary-dark uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-theme-surface-light dark:bg-theme-surface-dark divide-y divide-theme-border-light dark:divide-theme-border-dark">
                {productReviews.map((review) => (
                  <tr
                    key={review._id}
                    className="hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark"
                  >
                    <td className="px-4 lg:px-6 py-3 sm:py-4">
                      <div className="text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark truncate max-w-[150px]">
                        {review.user_id
                          ? review.user_id.name
                          : review.guest_name || "Deleted User"}
                      </div>
                      <div className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate max-w-[150px]">
                        {review.user_id
                          ? review.user_id.email
                          : review.guest_email || "N/A"}
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <span className="text-yellow-400 text-sm" aria-hidden="true">★</span>
                        <span className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                          {review.rating}.0
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 sm:py-4">
                      <div className="max-w-[200px]">
                        <div className="text-xs sm:text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                          {review.title}
                        </div>
                        <div className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark truncate">
                          {review.comment}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      {getStatusBadge(review.is_approved)}
                    </td>
                    <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-3">
                        <button
                          onClick={() => onViewDetails(review)}
                          className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Details"
                          aria-label="View review details"
                        >
                          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </button>
                        {!review.is_approved && (
                          <button
                            onClick={() => onApprove(review._id)}
                            className="px-2 py-0.5 sm:px-3 sm:py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => onReject(review._id)}
                            className="px-2 py-0.5 sm:px-3 sm:py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                          >
                            Unapprove
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(review._id)}
                          className="px-2 py-0.5 sm:px-3 sm:py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
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
              <div key={review._id} className="p-3 hover:bg-theme-hover-bg-light dark:hover:bg-theme-hover-bg-dark">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark truncate">
                        {review.user_id?.name || review.guest_name || "Deleted User"}
                      </span>
                      {getStatusBadge(review.is_approved)}
                    </div>
                    <p className="text-xs text-theme-text-muted-light dark:text-theme-text-muted-dark truncate">
                      {review.user_id?.email || review.guest_email || "N/A"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-yellow-400" aria-hidden="true">★</span>
                    <span className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark">
                      {review.rating}.0
                    </span>
                  </div>
                </div>

                <div className="mb-2">
                  <h4 className="text-sm font-medium text-theme-text-primary-light dark:text-theme-text-primary-dark mb-0.5 line-clamp-1">
                    {review.title}
                  </h4>
                  <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark line-clamp-2">
                    {review.comment}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-theme-border-light dark:border-theme-border-dark">
                  <div className="text-xs text-theme-text-primary-light dark:text-theme-text-primary-dark">
                    {new Date(review.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onViewDetails(review)}
                      className="p-1 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      title="View Details"
                      aria-label="View review details"
                    >
                      <Eye className="h-3.5 w-3.5"/>
                    </button>
                    {!review.is_approved && (
                      <button
                        onClick={() => onApprove(review._id)}
                        className="px-1.5 py-0.5 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
                      >
                        Approve
                      </button>
                    )}
                    {review.is_approved && (
                      <button
                        onClick={() => onReject(review._id)}
                        className="px-1.5 py-0.5 text-xs font-medium text-white bg-yellow-600 rounded hover:bg-yellow-700"
                      >
                        Unapprove
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(review._id)}
                      className="px-1.5 py-0.5 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
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