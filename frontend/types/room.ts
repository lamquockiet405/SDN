export interface Room {
  id: string;
  _id?: string;
  roomCode?: string;
  name: string;
  capacity: number;
  description?: string;
  image?: string;
  equipment: string[];
  amenities?: string[];
  rating?: number;
  pricePerHour: number;
  floor?: number;
  location?: string;
  rules?: string[];
  status?: "available" | "unavailable" | "maintenance";
  availability?: boolean;
  isAvailable: boolean;
}

export interface RoomAvailability {
  roomId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  _id?: string;
  roomId?: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
  userId?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface RoomUsageRecord {
  id?: string;
  _id: string;
  roomId: string;
  userId: string;
  bookingId?: string;
  checkInTime: string;
  checkOutTime?: string;
  durationMinutes: number;
  status: "active" | "completed" | "cancelled";
}
