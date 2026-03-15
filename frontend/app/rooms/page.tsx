"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { RoomCard } from "@/components/RoomCard";
import { Room } from "@/types/room";
import { Search, Filter, Users, DollarSign, Star } from "lucide-react";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    capacity: "",
    priceRange: "all",
    availability: "all",
  });

  // Mock data
  const mockRooms: Room[] = [
    {
      id: "1",
      name: "Meeting Room A",
      capacity: 8,
      description: "Perfect for team meetings and discussions",
      rating: 4.8,
      pricePerHour: 50,
      equipment: ["Projector", "Whiteboard", "Video Conference"],
      floor: 2,
      isAvailable: true,
    },
    {
      id: "2",
      name: "Study Room B",
      capacity: 4,
      description: "Quiet study space for focused work",
      rating: 4.6,
      pricePerHour: 30,
      equipment: ["Desk", "Chair", "Bookshelf"],
      floor: 1,
      isAvailable: true,
    },
    {
      id: "3",
      name: "Lab Room C",
      capacity: 20,
      description: "Equipped laboratory for research",
      rating: 4.9,
      pricePerHour: 80,
      equipment: ["Lab Equipment", "Computers", "Monitors"],
      floor: 3,
      isAvailable: false,
    },
    {
      id: "4",
      name: "Conference Room D",
      capacity: 12,
      description: "Large conference space with advanced AV",
      rating: 4.7,
      pricePerHour: 60,
      equipment: ["4K Projector", "Sound System", "WiFi"],
      floor: 2,
      isAvailable: true,
    },
    {
      id: "5",
      name: "Creative Studio E",
      capacity: 6,
      description: "Creative workspace for collaborative projects",
      rating: 4.5,
      pricePerHour: 40,
      equipment: ["Whiteboard", "Creative Tools", "Lighting"],
      floor: 1,
      isAvailable: true,
    },
    {
      id: "6",
      name: "Quiet Corner F",
      capacity: 2,
      description: "Intimate space for one-on-one meetings",
      rating: 4.4,
      pricePerHour: 20,
      equipment: ["Table", "Chairs"],
      floor: 1,
      isAvailable: true,
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setRooms(mockRooms);
      setFilteredRooms(mockRooms);
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = rooms;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Capacity filter
    if (filters.capacity) {
      const capacity = parseInt(filters.capacity);
      filtered = filtered.filter((room) => room.capacity >= capacity);
    }

    // Price range filter
    if (filters.priceRange !== "all") {
      filtered = filtered.filter((room) => {
        if (filters.priceRange === "0-30") return room.pricePerHour <= 30;
        if (filters.priceRange === "30-60")
          return room.pricePerHour > 30 && room.pricePerHour <= 60;
        if (filters.priceRange === "60+") return room.pricePerHour > 60;
        return true;
      });
    }

    // Availability filter
    if (filters.availability !== "all") {
      const isAvailable = filters.availability === "available";
      filtered = filtered.filter((room) => room.isAvailable === isAvailable);
    }

    setFilteredRooms(filtered);
  }, [searchTerm, filters, rooms]);

  const handleBooking = (roomId: string) => {
    alert(`Booking room ${roomId}. Redirecting to booking form...`);
    // In a real app, navigate to booking page
  };

  return (
    <DashboardLayout title="Browse Rooms">
      <div className="space-y-6">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-card shadow-soft-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Capacity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Capacity
              </label>
              <select
                value={filters.capacity}
                onChange={(e) =>
                  setFilters({ ...filters, capacity: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Any</option>
                <option value="2">2+ people</option>
                <option value="4">4+ people</option>
                <option value="8">8+ people</option>
                <option value="12">12+ people</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) =>
                  setFilters({ ...filters, priceRange: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All prices</option>
                <option value="0-30">€0 - €30</option>
                <option value="30-60">€30 - €60</option>
                <option value="60+">€60+</option>
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) =>
                  setFilters({ ...filters, availability: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All rooms</option>
                <option value="available">Available only</option>
                <option value="unavailable">Unavailable only</option>
              </select>
            </div>
          </div>

          {/* Filter Tags */}
          <div className="mt-4 flex flex-wrap gap-2">
            {searchTerm && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Search: {searchTerm}
                <button
                  onClick={() => setSearchTerm("")}
                  className="font-bold hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.capacity && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Capacity: {filters.capacity}+
                <button
                  onClick={() => setFilters({ ...filters, capacity: "" })}
                  className="font-bold hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filters.priceRange !== "all" && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                Price: {filters.priceRange}
                <button
                  onClick={() => setFilters({ ...filters, priceRange: "all" })}
                  className="font-bold hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredRooms.length}</span>{" "}
            {filteredRooms.length === 1 ? "room" : "rooms"}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        )}

        {/* Rooms Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onBook={() => handleBooking(room.id)}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredRooms.length === 0 && (
          <div className="text-center py-12 bg-white rounded-card">
            <div className="text-gray-400 mb-3">
              <Search size={48} className="mx-auto" />
            </div>
            <h3 className="text-gray-900 font-semibold mb-1">No rooms found</h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters or search term
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
