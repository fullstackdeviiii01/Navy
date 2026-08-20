// page.tsx
"use client";

import { useState, useEffect } from "react";
import { reviewsApi } from "../../../../lib/api/reviews";
import ReviewManagementHeader from "../../components/reviews/ReviewManagementHeader";
import ReviewStatsCards from "../../components/reviews/ReviewStatsCards";
import ReviewFilters from "../../components/reviews/ReviewFilters";
import ReviewsTable from "../../components/reviews/ReviewsTable";
import ReviewPagination from "../../components/reviews/ReviewPagination";
import ReviewDetailModal from "../../components/reviews/ReviewDetailModal";
import Loader from "../../../components/shared/Loader";

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

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, statusFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsApi.getAllReviews({
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        search: searchTerm || undefined,
      });

      setReviews(data.reviews);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    fetchReviews();
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await reviewsApi.updateReviewStatus(reviewId, true);
      fetchReviews();
    } catch (error) {
      alert("Failed to approve review");
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await reviewsApi.updateReviewStatus(reviewId, false);
      fetchReviews();
    } catch (error) {
      alert("Failed to reject review");
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewsApi.deleteReview(reviewId);
      fetchReviews();
    } catch (error) {
      alert("Failed to delete review");
    }
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  if (loading) {
    return (
      <div className="relative h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <ReviewManagementHeader />

      <ReviewStatsCards
        totalReviews={pagination.total}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
      />

      <div className="bg-theme-surface-light dark:bg-theme-surface-dark rounded-lg shadow border border-theme-border-light dark:border-theme-border-dark p-3 sm:p-4 lg:p-6">
        <div className="space-y-3 sm:space-y-4">
          <ReviewFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            onSearchTermChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onSearch={handleSearch}
          />

          <ReviewsTable
            reviews={reviews}
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            onDelete={handleDelete}
          />

          {pagination.totalPages > 1 && (
            <ReviewPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      {showDetailModal && selectedReview && (
        <ReviewDetailModal
          review={selectedReview}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedReview(null);
          }}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}