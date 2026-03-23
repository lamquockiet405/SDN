import api from "@/lib/axios";
import {
  Booking,
  BookingEvidence,
  BookingRequest,
  BookingStats,
} from "@/types/booking";

interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  roomId?: string;
  userId?: string;
}

interface PaginatedBookingsResponse {
  bookings: Booking[];
  total: number;
  count: number;
  pages: number;
  page: number;
}

interface PendingReviewResponse {
  data: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface PendingEvidenceResponse {
  data: BookingEvidence[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const bookingService = {
  async getBookings(
    params?: GetBookingsParams,
  ): Promise<PaginatedBookingsResponse> {
    const response = await api.get("/bookings", { params });
    return response.data as PaginatedBookingsResponse;
  },

  async getManagementBookings(
    params?: GetBookingsParams,
  ): Promise<PaginatedBookingsResponse> {
    const response = await api.get("/bookings/management", { params });
    return response.data as PaginatedBookingsResponse;
  },

  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data.booking as Booking;
  },

  async createBooking(data: BookingRequest): Promise<Booking> {
    const response = await api.post("/bookings", data);
    return response.data.booking as Booking;
  },

  async createGroupBooking(data: BookingRequest): Promise<Booking> {
    const response = await api.post("/bookings/group", data);
    return response.data.booking as Booking;
  },

  async cancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/cancel`, { reason });
    return response.data.booking as Booking;
  },

  async forceCancelBooking(id: string, reason?: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/force-cancel`, {
      reason,
    });
    return response.data.booking as Booking;
  },

  async approveBooking(id: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/approve`);
    return response.data.booking as Booking;
  },

  async rejectBooking(id: string, reason?: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/reject`, { reason });
    return response.data.booking as Booking;
  },

  async checkInBooking(id: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/check-in`);
    return response.data.booking as Booking;
  },

  async checkOutBooking(id: string): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/check-out`);
    return response.data.booking as Booking;
  },

  async extendBooking(id: string, extendMinutes: number): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/extend`, {
      extendMinutes,
    });
    return response.data.booking as Booking;
  },

  async uploadUsageEvidence(
    id: string,
    payload: {
      url: string;
      type: "image" | "video" | "document";
      size: number;
    },
  ): Promise<BookingEvidence> {
    const response = await api.post(`/bookings/${id}/evidence`, payload);
    return response.data.data as BookingEvidence;
  },

  async getPendingBookingsForReview(
    params?: Pick<GetBookingsParams, "page" | "limit">,
  ): Promise<PendingReviewResponse> {
    const response = await api.get("/bookings/review/pending", { params });
    return response.data as PendingReviewResponse;
  },

  async getPendingEvidence(
    params?: Pick<GetBookingsParams, "page" | "limit"> & {
      status?: "pending" | "approved" | "rejected" | "all";
    },
  ): Promise<PendingEvidenceResponse> {
    const response = await api.get("/bookings/evidence/pending", { params });
    return response.data as PendingEvidenceResponse;
  },

  async reviewEvidence(
    evidenceId: string,
    payload: { status: "approved" | "rejected"; note?: string },
  ): Promise<BookingEvidence> {
    const response = await api.patch(
      `/bookings/evidence/${evidenceId}/review`,
      payload,
    );
    return response.data.data as BookingEvidence;
  },

  async getStats(): Promise<BookingStats> {
    const response = await api.get("/bookings/stats");
    return response.data;
  },

  async getUserBookings(
    page?: number,
    limit?: number,
    status?: string,
  ): Promise<PaginatedBookingsResponse> {
    const response = await api.get("/bookings/my-bookings", {
      params: { page, limit, status },
    });
    return response.data as PaginatedBookingsResponse;
  },

  async getBookingHistory(
    page?: number,
    limit?: number,
  ): Promise<PaginatedBookingsResponse> {
    const response = await api.get("/bookings/history", {
      params: { page, limit },
    });
    return response.data as PaginatedBookingsResponse;
  },
};
