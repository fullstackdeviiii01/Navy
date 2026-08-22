// app/(admin)/curation/views/TestimonialsCurationView.tsx
"use client";

import { useState, useEffect } from "react";
import { reviewsApi } from "../../../../lib/api/reviews";
import ReviewSentimentMetrics from "../components/ReviewSentimentMetrics";
import TestimonialsFilterToolbar from "../components/TestimonialsFilterToolbar";
import TestimonialsDataTable from "../components/TestimonialsDataTable";
import TestimonialAuditModal from "../components/TestimonialAuditModal";
import Loader from "../../../components/shared/Loader";
import { MessageSquareQuote, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function TestimonialsCurationView() {
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
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const data = await reviewsApi.getAllReviews(params);
      setReviews(data.reviews || []);
      setPagination((prev) => ({
        ...prev,
        total: data.pagination?.total || 0,
        totalPages: data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchReviews();
  };

  const handleApprove = async (reviewId: string) => {
    try {
      await reviewsApi.updateReviewStatus(reviewId, true);
      fetchReviews();
    } catch (error) {
      console.error("Failed to approve review:", error);
    }
  };

  const handleReject = async (reviewId: string) => {
    try {
      await reviewsApi.updateReviewStatus(reviewId, false);
      fetchReviews();
    } catch (error) {
      console.error("Failed to unapprove review:", error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this customer review?")) {
      return;
    }

    try {
      await reviewsApi.deleteReview(reviewId);
      fetchReviews();
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const handleViewDetails = (review: Review) => {
    setSelectedReview(review);
    setShowDetailModal(true);
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const pendingCount = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) => r.is_approved).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-theme-border-light/80 dark:border-theme-border-dark/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-serif font-semibold text-theme-text-primary-light dark:text-theme-text-primary-dark tracking-tight">
              Customer Reviews
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              <MessageSquareQuote className="w-3 h-3" />
              All Reviews
            </span>
          </div>
          <p className="text-xs text-theme-text-secondary-light dark:text-theme-text-secondary-dark mt-0.5">
            Moderate customer reviews, approve ratings, and manage product feedback.
          </p>
        </div>
      </div>

      {/* KPI Ribbon */}
      <ReviewSentimentMetrics
        totalReviews={pagination.total}
        pendingCount={pendingCount}
        approvedCount={approvedCount}
      />

      {/* Filter Toolbar */}
      <TestimonialsFilterToolbar
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchTermChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onSearch={handleSearch}
      />

      {/* Table */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center bg-theme-surface-light dark:bg-theme-surface-dark rounded-xl border border-theme-border-light dark:border-theme-border-dark p-12">
          <Loader />
        </div>
      ) : (
        <TestimonialsDataTable
          reviews={reviews}
          onViewDetails={handleViewDetails}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-theme-surface-light dark:bg-theme-surface-dark p-3.5 sm:p-4 rounded-xl border border-theme-border-light dark:border-theme-border-dark text-xs">
          <span className="text-theme-text-muted-light">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total reviews)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light disabled:opacity-40 disabled:cursor-not-allowed hover:border-theme-hover-light transition-colors inline-flex items-center gap-1"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 border border-theme-border-light dark:border-theme-border-dark rounded-lg bg-theme-bg-light dark:bg-theme-bg-dark text-theme-text-secondary-light disabled:opacity-40 disabled:cursor-not-allowed hover:border-theme-hover-light transition-colors inline-flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Audit Modal */}
      {showDetailModal && selectedReview && (
        <TestimonialAuditModal
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
