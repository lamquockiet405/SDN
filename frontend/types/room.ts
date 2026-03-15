export interface Room {
  id: string;
  name: string;
  capacity: number;
  description?: string;
  image?: string;
  equipment: string[];
  rating: number;
  pricePerHour: number;
  floor: number;
  isAvailable: boolean;
}

export interface RoomAvailability {
  roomId: string;
  date: string;
  timeSlots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "pending";
  userId?: string;
}
