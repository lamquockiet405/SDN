import api from "@/lib/axios";
import {
  RatingSummaryResponse,
  Review,
  ReviewListResponse,
} from "@/types/review";

interface ReviewQuery {
  page?: number;
  limit?: number;
  roomId?: string;
  userId?: string;
  status?: "active" | "hidden" | "deleted" | "flagged";
  rating?: number;
  isHidden?: boolean;
  isDeleted?: boolean;
  search?: string;
  sortBy?: "createdAt" | "rating" | "updatedAt";
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
}

export const reviewService = {
  async submitReview(payload: {
    roomId: string;
    bookingId?: string;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const response = await api.post("/reviews", payload);
    return response.data.data as Review;
  },

  async getMyReviews(page = 1, limit = 20): Promise<ReviewListResponse> {
    const response = await api.get("/reviews/my", { params: { page, limit } });
    return response.data as ReviewListResponse;
  },

  async getPublicReviews(params?: {
    page?: number;
    limit?: number;
    roomId?: string;
  }): Promise<ReviewListResponse> {
    const response = await api.get("/reviews", { params });
    return response.data as ReviewListResponse;
  },

  async getReviewManagement(params?: ReviewQuery): Promise<ReviewListResponse> {
    const response = await api.get("/reviews/management", { params });
    return response.data as ReviewListResponse;
  },

  async toggleHideReview(
    reviewId: string,
    hidden: boolean,
    note?: string,
  ): Promise<Review> {
    const response = await api.patch(`/reviews/${reviewId}/hide`, {
      hidden,
      note,
    });
    return response.data.data as Review;
  },

  async deleteReview(reviewId: string, note?: string): Promise<Review> {
    const response = await api.delete(`/reviews/${reviewId}`, {
      data: { note },
    });
    return response.data.data as Review;
  },

  async getRatingSummary(params?: {
    roomId?: string;
    startDate?: string;
    endDate?: string;
    groupBy?: "room" | "day";
  }): Promise<RatingSummaryResponse> {
    const response = await api.get("/reviews/ratings/summary", { params });
    return response.data as RatingSummaryResponse;
  },
};
