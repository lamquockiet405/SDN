"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  Phone,
  X,
  Calendar,
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: number;
  rating: number;
  image: string;
  isAvailable: boolean;
  pricePerHour: number;
}

interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  date: string;
  status: "available" | "booked" | "pending";
  userName?: string;
  price: number;
}

interface TimeSlot {
  time: string;
  bookings: Booking[];
}

export default function UserBookingDashboard() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Study Room A",
      capacity: 2,
      rating: 4.8,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      isAvailable: true,
      pricePerHour: 25,
    },
    {
      id: "2",
      name: "Lab Room B",
      capacity: 4,
      rating: 4.6,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      isAvailable: true,
      pricePerHour: 35,
    },
    {
      id: "3",
      name: "Meeting Room C",
      capacity: 8,
      rating: 4.9,
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      isAvailable: true,
      pricePerHour: 50,
    },
    {
      id: "4",
      name: "Quiet Zone D",
      capacity: 1,
      rating: 4.7,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      isAvailable: false,
      pricePerHour: 15,
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "b1",
      roomId: "1",
      roomName: "Study Room A",
      startTime: "09:00",
      endTime: "11:00",
      date: new Date().toISOString().split("T")[0],
      status: "booked",
      userName: "John Doe",
      price: 50,
    },
    {
      id: "b2",
      roomId: "1",
      roomName: "Study Room A",
      startTime: "14:00",
      endTime: "16:00",
      date: new Date().toISOString().split("T")[0],
      status: "pending",
      userName: "Jane Smith",
      price: 50,
    },
    {
      id: "b3",
      roomId: "2",
      roomName: "Lab Room B",
      startTime: "10:00",
      endTime: "12:00",
      date: new Date().toISOString().split("T")[0],
      status: "booked",
      userName: "Mike Johnson",
      price: 70,
    },
  ]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ time: string } | null>(
    null,
  );

  const timeSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
  ];

  const handleBookRoom = (room: Room, time: string) => {
    setSelectedRoom(room);
    setSelectedSlot({ time });
    setShowBookingModal(true);
  };

  const getBookingForSlot = (roomId: string, time: string) => {
    return bookings.find(
      (b) =>
        b.roomId === roomId &&
        b.date === selectedDate &&
        b.startTime <= time &&
        b.endTime > time,
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-red-100";
      case "pending":
        return "bg-yellow-100";
      default:
        return "bg-green-100";
    }
  };

  const scrollRoomsLeft = () => {
    const container = document.getElementById("room-carousel");
    if (container) {
      container.scrollLeft -= 400;
    }
  };

  const scrollRoomsRight = () => {
    const container = document.getElementById("room-carousel");
    if (container) {
      container.scrollLeft += 400;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Booking Dashboard</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium">
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button className="p-2 hover:bg-slate-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-slate-600">
            Selected: {selectedDate}
          </span>
        </div>
      </div>

      {/* Rooms Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">Available Rooms</h2>
          <div className="flex gap-2">
            <button
              onClick={scrollRoomsLeft}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRoomsRight}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          id="room-carousel"
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
        >
          {rooms.map((room) => (
            <div
              key={room.id}
              className="flex-shrink-0 w-80 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border border-slate-200"
            >
              {/* Room Image */}
              <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden relative">
                <img
                  src={room.image}
                  alt={room.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                  ${room.pricePerHour}/hr
                </div>
              </div>

              {/* Room Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-slate-900">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                    <span className="text-sm font-semibold text-yellow-700">
                      {room.rating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Users size={16} />
                    <span>{room.capacity} people</span>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      room.isAvailable
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {room.isAvailable ? "Available" : "Busy"}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedRoom(room);
                    setShowBookingModal(true);
                  }}
                  disabled={!room.isAvailable}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                    room.isAvailable
                      ? "bg-primary text-white hover:bg-blue-600"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {room.isAvailable ? "Book Now" : "Not Available"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Timeline Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Booking Grid</h2>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
          {/* Header with Room Names */}
          <div className="grid grid-cols-[120px_repeat(4,1fr)] gap-0 min-w-full sticky top-0 bg-slate-50 border-b border-slate-200">
            <div className="p-4 font-semibold text-slate-700 text-sm">Time</div>
            {rooms.slice(0, 4).map((room) => (
              <div
                key={room.id}
                className="p-4 font-semibold text-slate-700 text-sm border-l border-slate-200"
              >
                {room.name}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="grid grid-cols-[120px_repeat(4,1fr)] gap-0 min-w-full">
            {timeSlots.map((time) => (
              <div key={time} className="contents">
                {/* Time Label */}
                <div className="p-4 bg-slate-50 font-medium text-slate-700 text-sm border-b border-slate-200 border-r">
                  {time}
                </div>

                {/* Booking Cells */}
                {rooms.slice(0, 4).map((room) => {
                  const booking = getBookingForSlot(room.id, time);
                  const isFirstSlot =
                    !bookings
                      .filter((b) => b.roomId === room.id)
                      .some((b) => b.startTime < time && b.endTime > time) ||
                    booking?.startTime === time;

                  return (
                    <div
                      key={`${room.id}-${time}`}
                      className="p-2 border-b border-l border-slate-200 min-h-[80px] cursor-pointer hover:bg-slate-50 transition"
                      onClick={() => {
                        if (!booking) {
                          handleBookRoom(room, time);
                        }
                      }}
                    >
                      {booking && isFirstSlot && (
                        <div
                          className={`${getStatusColor(booking.status)} rounded-lg p-3 text-white text-xs h-full flex flex-col justify-between`}
                          style={{
                            gridRow: `span ${
                              Math.floor(
                                (new Date(
                                  `2000-01-01T${booking.endTime}`,
                                ).getTime() -
                                  new Date(
                                    `2000-01-01T${booking.startTime}`,
                                  ).getTime()) /
                                  3600000,
                              ) * 4
                            }`,
                          }}
                        >
                          <div>
                            <p className="font-semibold">{booking.userName}</p>
                            <p className="text-xs opacity-90">
                              {booking.startTime} - {booking.endTime}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            {booking.status === "booked" && (
                              <CheckCircle size={12} />
                            )}
                            {booking.status === "pending" && (
                              <AlertCircle size={12} />
                            )}
                            <span>${booking.price}</span>
                          </div>
                        </div>
                      )}
                      {!booking && (
                        <div className="bg-green-50 hover:bg-green-100 rounded-lg p-3 h-full flex items-center justify-center border border-dashed border-green-300 transition">
                          <span className="text-xs text-green-700 font-medium">
                            Available
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                Book {selectedRoom.name}
              </h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Room Details */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Room Details
                </h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Room Name:</span>
                    <span className="font-medium">{selectedRoom.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">
                      {selectedRoom.capacity} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price/Hour:</span>
                    <span className="font-medium">
                      ${selectedRoom.pricePerHour}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Start Time:</span>
                    <span className="font-medium">{selectedSlot?.time}</span>
                  </div>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration (hours)
                </label>
                <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option>1 hour</option>
                  <option>2 hours</option>
                  <option>3 hours</option>
                  <option>4 hours</option>
                </select>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Number of Participants
                </label>
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  max={selectedRoom.capacity}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  placeholder="Any special requests or notes..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                ></textarea>
              </div>

              {/* Price Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Total Price:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${selectedRoom.pricePerHour * 1}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
