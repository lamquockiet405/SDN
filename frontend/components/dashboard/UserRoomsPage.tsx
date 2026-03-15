"use client";

import { useState } from "react";
import { Plus, MapPin, Users, Star, ChevronRight, Filter } from "lucide-react";

interface Room {
  id: string;
  name: string;
  description: string;
  capacity: number;
  rating: number;
  image: string;
  pricePerHour: number;
  amenities: string[];
  available: boolean;
}

export default function UserRoomsPage() {
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCapacity, setFilterCapacity] = useState(0);

  const [rooms] = useState<Room[]>([
    {
      id: "1",
      name: "Study Room A",
      description:
        "Perfect for focused individual study or small group sessions",
      capacity: 2,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      pricePerHour: 25,
      amenities: ["Whiteboard", "Desk", "WiFi", "Power Outlet"],
      available: true,
    },
    {
      id: "2",
      name: "Lab Room B",
      description: "Well-equipped laboratory space for technical projects",
      capacity: 4,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      pricePerHour: 35,
      amenities: ["Equipment", "Lab Chairs", "Ventilation", "Storage"],
      available: true,
    },
    {
      id: "3",
      name: "Meeting Room C",
      description: "Large meeting space ideal for team collaborations",
      capacity: 8,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      pricePerHour: 50,
      amenities: ["Projector", "Conference Table", "Video Call", "WiFi"],
      available: true,
    },
    {
      id: "4",
      name: "Quiet Zone D",
      description: "Distraction-free zone for deep concentration work",
      capacity: 1,
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      pricePerHour: 15,
      amenities: ["Soundproof", "Desk", "WiFi", "Power Outlet"],
      available: false,
    },
  ]);

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCapacity =
      filterCapacity === 0 || room.capacity >= filterCapacity;
    return matchesSearch && matchesCapacity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Study Rooms</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium">
          <Plus size={20} />
          My Bookings
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <select
            value={filterCapacity}
            onChange={(e) => setFilterCapacity(parseInt(e.target.value))}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={0}>All Capacities</option>
            <option value={1}>1 person</option>
            <option value={2}>2+ people</option>
            <option value={4}>4+ people</option>
            <option value={8}>8+ people</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setViewType("grid")}
            className={`px-4 py-2 rounded-lg transition ${
              viewType === "grid"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewType("list")}
            className={`px-4 py-2 rounded-lg transition ${
              viewType === "list"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            List
          </button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-slate-600">
        {filteredRooms.length} rooms available
      </p>

      {/* Grid View */}
      {viewType === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-slate-200 overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden relative">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full text-sm font-semibold shadow-sm">
                  ${room.pricePerHour}/hr
                </div>
                {!room.available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white font-bold">Not Available</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                    <Star
                      size={16}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="text-sm font-semibold text-yellow-700">
                      {room.rating}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-3">
                  {room.description}
                </p>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{room.capacity} people</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-4">
                  <p className="text-xs font-semibold text-slate-700 mb-2">
                    Amenities:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Button */}
                <button
                  disabled={!room.available}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition mt-auto ${
                    room.available
                      ? "bg-primary text-white hover:bg-blue-600"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {room.available ? "Book Now" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewType === "list" && (
        <div className="space-y-4">
          {filteredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition border border-slate-200 p-6 flex gap-6 items-center"
            >
              {/* Thumbnail */}
              <img
                src={room.image}
                alt={room.name}
                className="w-24 h-24 rounded-lg object-cover"
              />

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {room.name}
                    </h3>
                    <p className="text-sm text-slate-600">{room.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star
                      size={18}
                      className="text-yellow-500 fill-yellow-500"
                    />
                    <span className="font-semibold text-slate-900">
                      {room.rating}
                    </span>
                  </div>
                </div>

                <div className="flex gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{room.capacity} people</span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {room.amenities.slice(0, 2).map((amenity) => (
                      <span
                        key={amenity}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded"
                      >
                        {amenity}
                      </span>
                    ))}
                    {room.amenities.length > 2 && (
                      <span className="text-xs text-slate-600">
                        +{room.amenities.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price & Button */}
              <div className="text-right space-y-2">
                <p className="text-2xl font-bold text-slate-900">
                  ${room.pricePerHour}
                  <span className="text-sm text-slate-600">/hr</span>
                </p>
                <button
                  disabled={!room.available}
                  className={`w-32 py-2 px-4 rounded-lg font-medium transition ${
                    room.available
                      ? "bg-primary text-white hover:bg-blue-600"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {room.available ? "Book Now" : "Unavailable"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
