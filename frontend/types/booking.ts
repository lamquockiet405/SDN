export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  totalPrice: number;
  createdAt: string;
  paymentStatus: "pending" | "paid" | "refunded";
}

export interface BookingRequest {
  roomId: string;
  startTime: string;
  endTime: string;
}

export interface BookingStats {
  totalBookings: number;
  bookingsToday: number;
  totalRevenue: number;
  averageRating: number;
}
