import api from "@/lib/axios";
import { Room, TimeSlot, RoomUsageRecord } from "@/types/room";

interface GetRoomsParams {
  page?: number;
  limit?: number;
  capacity?: number;
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

interface AvailableRoomsByTimeParams {
  startTime: string;
  endTime: string;
  capacity?: number;
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
}

type RoomPayload = Omit<
  Room,
  "id" | "_id" | "isAvailable" | "equipment" | "rating" | "floor"
> & {
  amenities?: string[];
};

const normalizeRoom = (room: any): Room => ({
  ...room,
  id: room.id || room._id,
  _id: room._id || room.id,
  equipment: room.equipment || room.amenities || [],
  amenities: room.amenities || room.equipment || [],
  isAvailable:
    room.isAvailable ??
    (room.status ? room.status === "available" : !!room.availability),
});

export const roomService = {
  async getRooms(
    params?: GetRoomsParams,
  ): Promise<{ rooms: Room[]; total: number }> {
    const response = await api.get("/rooms", { params });
    return {
      rooms: (response.data.rooms || []).map(normalizeRoom),
      total: response.data.total || 0,
    };
  },

  async getRoomById(id: string): Promise<Room> {
    const response = await api.get(`/rooms/${id}`);
    return normalizeRoom(response.data.room);
  },

  async getAvailableRoomsByTime(
    params: AvailableRoomsByTimeParams,
  ): Promise<{ rooms: Room[]; total: number }> {
    const response = await api.get("/rooms/available-by-time", { params });

    return {
      rooms: (response.data.rooms || []).map(normalizeRoom),
      total: response.data.count || 0,
    };
  },

  async searchRooms(query: string): Promise<Room[]> {
    const response = await api.get("/rooms/search", {
      params: { q: query },
    });
    return (response.data.rooms || []).map(normalizeRoom);
  },

  async createRoom(data: RoomPayload): Promise<Room> {
    const response = await api.post("/rooms", data);
    return normalizeRoom(response.data.room);
  },

  async updateRoom(id: string, data: Partial<RoomPayload>): Promise<Room> {
    const response = await api.put(`/rooms/${id}`, data);
    return normalizeRoom(response.data.room);
  },

  async deleteRoom(id: string): Promise<void> {
    await api.delete(`/rooms/${id}`);
  },

  async changeRoomStatus(
    id: string,
    status: "available" | "unavailable" | "maintenance",
  ): Promise<Room> {
    const response = await api.patch(`/rooms/${id}/status`, { status });
    return normalizeRoom(response.data.room);
  },

  async getTimeSlots(
    roomId: string,
    params?: { startDate?: string; endDate?: string },
  ): Promise<TimeSlot[]> {
    const response = await api.get(`/rooms/${roomId}/time-slots`, { params });
    return response.data.slots || [];
  },

  async createTimeSlot(
    roomId: string,
    payload: {
      startTime: string;
      endTime: string;
      status?: TimeSlot["status"];
    },
  ): Promise<TimeSlot> {
    const response = await api.post(`/rooms/${roomId}/time-slots`, payload);
    return response.data.slot;
  },

  async updateTimeSlot(
    roomId: string,
    slotId: string,
    payload: {
      startTime?: string;
      endTime?: string;
      status?: TimeSlot["status"];
    },
  ): Promise<TimeSlot> {
    const response = await api.put(
      `/rooms/${roomId}/time-slots/${slotId}`,
      payload,
    );
    return response.data.slot;
  },

  async deleteTimeSlot(roomId: string, slotId: string): Promise<void> {
    await api.delete(`/rooms/${roomId}/time-slots/${slotId}`);
  },

  async getUsageHistory(params?: {
    page?: number;
    limit?: number;
    roomId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ records: RoomUsageRecord[]; total: number }> {
    const response = await api.get("/rooms/management/usage-history", {
      params,
    });

    return {
      records: response.data.records || [],
      total: response.data.total || 0,
    };
  },

  async getRoomUsageHistory(
    roomId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<{ records: RoomUsageRecord[]; total: number }> {
    const response = await api.get(`/rooms/${roomId}/usage-history`, {
      params,
    });

    return {
      records: response.data.records || [],
      total: response.data.total || 0,
    };
  },
};
