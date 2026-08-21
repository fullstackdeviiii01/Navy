// lib/api/reviews.ts
import { getAuthToken, handleResponse } from "./helpers";

export const reviewsApi = {
  // Upload review image
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/reviews/upload-image", {
      method: "POST",
      body: formData,
    });
    return handleResponse(response);
  },

  // Upload review video
  uploadVideo: async (file: File) => {
    const formData = new FormData();
    formData.append("video", file);

    const response = await fetch("/api/reviews/upload-video", {
      method: "POST",
      body: formData,
    });
    return handleResponse(response);
  },

  // Get reviews for a product
  getProductReviews: async (
    productId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: string;
      verified_only?: boolean;
      with_images?: boolean;
      with_videos?: boolean;
      min_rating?: number;
    }
  ) => {
    const queryParams = new URLSearchParams({
      product_id: productId,
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
      ...(params?.verified_only && { verified_only: "true" }),
      ...(params?.with_images && { with_images: "true" }),
      ...(params?.with_videos && { with_videos: "true" }),
      ...(params?.min_rating && { min_rating: params.min_rating.toString() }),
    });

    const response = await fetch(`/api/reviews?${queryParams}`);
    return handleResponse(response);
  },

  // Get user's own reviews
  getMyReviews: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams({
      my_reviews: "true",
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.sortBy && { sortBy: params.sortBy }),
      ...(params?.sortOrder && { sortOrder: params.sortOrder }),
    });

    const response = await fetch(`/api/reviews?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get all reviews (admin)
  getAllReviews: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams({
      admin: "true",
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.status && { status: params.status }),
      ...(params?.search && { search: params.search }),
    });

    const response = await fetch(`/api/reviews?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Get review statistics
  getReviewStats: async (productId: string) => {
    const response = await fetch(
      `/api/reviews/stats?product_id=${productId}`
    );
    return handleResponse(response);
  },

  // Check if user can review
  checkEligibility: async (productId: string) => {
    const response = await fetch(
      `/api/reviews/check-eligibility?product_id=${productId}`,
      {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      }
    );
    return handleResponse(response);
  },

  // Create a review (simplified)
  createReview: async (data: {
    product_id: string;
    rating: number;
    title: string;
    comment: string;
    detailed_ratings?: {
      quality?: number;
      durability?: number;
      matches_description?: number;
    };
    images?: Array<{ url: string; caption?: string }>;
    videos?: Array<{ url: string; thumbnail?: string; caption?: string }>;
  }) => {
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update a review (user updates own)
  updateReview: async (
    reviewId: string,
    data: {
      rating?: number;
      title?: string;
      comment?: string;
      detailed_ratings?: {
        quality?: number;
        durability?: number;
        matches_description?: number;
      };
      images?: Array<{ url: string; caption?: string }>;
      videos?: Array<{ url: string; thumbnail?: string; caption?: string }>;
    }
  ) => {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  // Update review status (admin approves/rejects)
  updateReviewStatus: async (reviewId: string, isApproved: boolean) => {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ is_approved: isApproved }),
    });
    return handleResponse(response);
  },

  // Delete a review (user deletes own OR admin deletes any)
  deleteReview: async (reviewId: string) => {
    const response = await fetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
    });
    return handleResponse(response);
  },

  // Mark review as helpful or not helpful
  markHelpful: async (reviewId: string, voteType: "helpful" | "not_helpful") => {
    const response = await fetch(`/api/reviews/${reviewId}/helpful`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ vote_type: voteType }),
    });
    return handleResponse(response);
  },

  // Get user's vote status for a review
  getUserVote: async (reviewId: string): Promise<"helpful" | "not_helpful" | null> => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote-status`);
      if (response.ok) {
        const data = await response.json();
        return data.vote;
      }
      return null;
    } catch {
      return null;
    }
  },
};