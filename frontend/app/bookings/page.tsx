"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Booking } from "@/types/booking";
import {
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // Mock data
  const mockBookings: Booking[] = [
    {
      id: "1",
      userId: "user1",
      roomId: "room1",
      roomName: "Meeting Room A",
      startTime: "2024-03-20 10:00",
      endTime: "2024-03-20 12:00",
      status: "confirmed",
      totalPrice: 100,
      createdAt: "2024-03-15T10:00:00Z",
      paymentStatus: "paid",
    },
    {
      id: "2",
      userId: "user1",
      roomId: "room2",
      roomName: "Study Room B",
      startTime: "2024-03-21 14:00",
      endTime: "2024-03-21 16:00",
      status: "confirmed",
      totalPrice: 60,
      createdAt: "2024-03-16T10:00:00Z",
      paymentStatus: "paid",
    },
    {
      id: "3",
      userId: "user1",
      roomId: "room3",
      roomName: "Lab Room C",
      startTime: "2024-03-22 09:00",
      endTime: "2024-03-22 13:00",
      status: "pending",
      totalPrice: 320,
      createdAt: "2024-03-17T10:00:00Z",
      paymentStatus: "pending",
    },
    {
      id: "4",
      userId: "user1",
      roomId: "room4",
      roomName: "Conference Room D",
      startTime: "2024-03-19 15:00",
      endTime: "2024-03-19 17:00",
      status: "completed",
      totalPrice: 120,
      createdAt: "2024-03-14T10:00:00Z",
      paymentStatus: "paid",
    },
    {
      id: "5",
      userId: "user1",
      roomId: "room1",
      roomName: "Meeting Room A",
      startTime: "2024-03-18 11:00",
      endTime: "2024-03-18 12:30",
      status: "cancelled",
      totalPrice: 75,
      createdAt: "2024-03-13T10:00:00Z",
      paymentStatus: "refunded",
    },
  ];

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setBookings(mockBookings);
      setFilteredBookings(mockBookings);
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = bookings;

    if (filters.status !== "all") {
      filtered = filtered.filter((b) => b.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter((b) =>
        b.roomName.toLowerCase().includes(filters.search.toLowerCase()),
      );
    }

    setFilteredBookings(filtered);
  }, [filters, bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "refunded":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      // Parse "2024-03-20 10:00" format
      const [date, time] = timeStr.split(" ");
      return time;
    } catch {
      return timeStr;
    }
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-card shadow-soft-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by room name
              </label>
              <input
                type="text"
                placeholder="Meeting Room A..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: "all", search: "" })}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-btn font-medium transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div>
          <p className="text-gray-600">
            Found{" "}
            <span className="font-semibold">{filteredBookings.length}</span>{" "}
            {filteredBookings.length === 1 ? "booking" : "bookings"}
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

        {/* Bookings Table */}
        {!isLoading && (
          <div className="bg-white rounded-card shadow-soft-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Room
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Duration
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Payment
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">
                          {booking.roomName}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {formatDate(booking.startTime)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={16} />
                          <span className="text-sm">
                            {formatTime(booking.startTime)} -{" "}
                            {formatTime(booking.endTime)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        €{booking.totalPrice}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            booking.status,
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getPaymentStatusColor(
                            booking.paymentStatus,
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-primary hover:text-blue-600 font-medium text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredBookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-card">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-gray-900 font-semibold mb-1">
              No bookings found
            </h3>
            <p className="text-gray-500 text-sm">
              Try adjusting your filters or start booking a room
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
