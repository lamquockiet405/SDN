export interface Booking {
  _id?: string;
  id?: string;
  userId:
    | string
    | {
        _id: string;
        name?: string;
        email?: string;
      };
  roomId:
    | string
    | {
        _id: string;
        name?: string;
        location?: string;
      };
  roomName?: string;
  startTime: string;
  endTime: string;
  status:
    | "pending"
    | "approved"
    | "rejected"
    | "checked_in"
    | "checked_out"
    | "cancelled"
    | "confirmed"
    | "completed";
  totalPrice: number;
  createdAt?: string;
  paymentStatus?: "pending" | "completed" | "failed" | "refunded";
  participants?: string[];
  groupBooking?: boolean;
  evidenceStatus?: "none" | "pending" | "approved" | "rejected";
}

export interface BookingRequest {
  roomId: string;
  startTime: string;
  endTime: string;
  specialRequests?: string;
  participants?: string[];
}

export interface BookingStats {
  totalBookings: number;
  bookingsToday: number;
  totalRevenue: number;
  averageRating: number;
}

export interface BookingEvidence {
  _id: string;
  bookingId: string;
  uploadedBy: string;
  url: string;
  type: "image" | "video" | "document";
  size: number;
  status: "pending" | "approved" | "rejected";
  reviewNote?: string;
  reviewedAt?: string;
  createdAt?: string;
  booking?: Booking;
  uploadedByUser?: {
    _id: string;
    name?: string;
    email?: string;
  };
}
