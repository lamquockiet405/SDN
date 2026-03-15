import api from "@/lib/axios";
import { Booking, BookingRequest, BookingStats } from "@/types/booking";

interface GetBookingsParams {
  page?: number;
  limit?: number;
  status?: string;
  roomId?: string;
}

export const bookingService = {
  async getBookings(
    params?: GetBookingsParams,
  ): Promise<{ bookings: Booking[]; total: number }> {
    const response = await api.get("/bookings", { params });
    return response.data;
  },

  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async createBooking(data: BookingRequest): Promise<Booking> {
    const response = await api.post("/bookings", data);
    return response.data;
  },

  async cancelBooking(id: string): Promise<void> {
    await api.post(`/bookings/${id}/cancel`);
  },

  async getStats(): Promise<BookingStats> {
    const response = await api.get("/bookings/stats");
    return response.data;
  },

  async getUserBookings(
    page?: number,
    limit?: number,
  ): Promise<{ bookings: Booking[]; total: number }> {
    const response = await api.get("/bookings/my-bookings", {
      params: { page, limit },
    });
    return response.data;
  },

  async getBookingHistory(): Promise<Booking[]> {
    const response = await api.get("/bookings/history");
    return response.data;
  },
};
