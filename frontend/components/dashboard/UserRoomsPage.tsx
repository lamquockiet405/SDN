"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RoomCard } from "@/components/RoomCard";
import { roomService } from "@/services/roomService";
import { Room } from "@/types/room";

export default function UserRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const data = await roomService.getRooms({ page: 1, limit: 50 });
        setRooms(data.rooms || []);
      } catch (error) {
        console.error("Failed to load rooms", error);
        setRooms([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) {
      return rooms;
    }

    const keyword = searchTerm.toLowerCase();
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(keyword) ||
        room.description?.toLowerCase().includes(keyword),
    );
  }, [rooms, searchTerm]);

  const handleBook = (roomId: string) => {
    window.location.href = `/rooms/${roomId}`;
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Browse Rooms</h2>
          <p className="text-slate-600 text-sm">
            Find and book available study rooms
          </p>
        </div>

        <div className="relative w-full max-w-sm">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search rooms..."
            className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-slate-500">
          Loading rooms...
        </div>
      )}

      {!isLoading && filteredRooms.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-6 text-slate-500">
          No rooms found.
        </div>
      )}

      {!isLoading && filteredRooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={() => handleBook(room.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
