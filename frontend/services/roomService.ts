import api from "@/lib/axios";
import { Room, RoomAvailability } from "@/types/room";

interface GetRoomsParams {
  page?: number;
  limit?: number;
  capacity?: number;
  search?: string;
}

export const roomService = {
  async getRooms(
    params?: GetRoomsParams,
  ): Promise<{ rooms: Room[]; total: number }> {
    const response = await api.get("/rooms", { params });
    return response.data;
  },

  async getRoomById(id: string): Promise<Room> {
    const response = await api.get(`/rooms/${id}`);
    return response.data;
  },

  async getAvailability(
    roomId: string,
    date: string,
  ): Promise<RoomAvailability> {
    const response = await api.get(`/rooms/${roomId}/availability`, {
      params: { date },
    });
    return response.data;
  },

  async checkAvailability(
    roomId: string,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    const response = await api.get(`/rooms/${roomId}/check-availability`, {
      params: { startTime, endTime },
    });
    return response.data.available;
  },

  async searchRooms(query: string): Promise<Room[]> {
    const response = await api.get("/rooms/search", {
      params: { q: query },
    });
    return response.data;
  },
};
