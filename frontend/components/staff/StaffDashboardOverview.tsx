"use client";

import { useEffect, useState } from "react";
import { Users, DoorOpen, CheckCircle, AlertCircle } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { roomService } from "@/services/roomService";
import { userService } from "@/services/userService";
import { Booking } from "@/types/booking";
import { Room } from "@/types/room";

const getUserDisplay = (booking: Booking) => {
  if (typeof booking.userId === "object") {
    return booking.userId.name || booking.userId.email || booking.userId._id;
  }

  return booking.userId;
};

const getRoomDisplay = (booking: Booking) => {
  if (typeof booking.roomId === "object") {
    return booking.roomId.name || booking.roomId.location || booking.roomId._id;
  }

  return booking.roomId;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }

  return fallback;
};

export default function StaffDashboardOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [statsData, setStatsData] = useState({
    totalRooms: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    issuesReported: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [
          roomResponse,
          pendingBookingsResponse,
          activeUsersResponse,
          activeViolationsResponse,
          managementBookingsResponse,
        ] = await Promise.all([
          roomService.getRooms({ page: 1, limit: 100 }),
          bookingService.getPendingBookingsForReview({ page: 1, limit: 1 }),
          userService.getUsers({ status: "active", page: 1, limit: 1 }),
          userService.getViolatedUsers({ status: "active", page: 1, limit: 1 }),
          bookingService.getManagementBookings({ page: 1, limit: 3 }),
        ]);

        setRooms(roomResponse.rooms || []);
        setRecentBookings(managementBookingsResponse.bookings || []);

        setStatsData({
          totalRooms: roomResponse.total || roomResponse.rooms.length,
          pendingApprovals: pendingBookingsResponse.pagination?.total || 0,
          activeUsers: activeUsersResponse.pagination?.total || 0,
          issuesReported: activeViolationsResponse.pagination?.total || 0,
        });
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load dashboard data"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Total Rooms",
      value: String(statsData.totalRooms),
      icon: DoorOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending Approvals",
      value: String(statsData.pendingApprovals),
      icon: CheckCircle,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Active Users",
      value: String(statsData.activeUsers),
      icon: Users,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Issues Reported",
      value: String(statsData.issuesReported),
      icon: AlertCircle,
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Staff Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Welcome back! Here is your overview.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 text-white shadow-md hover:shadow-lg transition`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
                <Icon size={28} className="opacity-80" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Recent Bookings
          </h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-slate-500 text-sm">Loading...</div>
            ) : recentBookings.length === 0 ? (
              <div className="text-slate-500 text-sm">No recent bookings</div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking._id || booking.id}
                  className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {getRoomDisplay(booking)}
                    </p>
                    <p className="text-sm text-slate-600">
                      {getUserDisplay(booking)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">
                      {new Date(booking.startTime).toLocaleString()} -{" "}
                      {new Date(booking.endTime).toLocaleTimeString()}
                    </p>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        booking.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : booking.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Room Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Room Status</h2>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-slate-500 text-sm">Loading...</div>
            ) : rooms.length === 0 ? (
              <div className="text-slate-500 text-sm">No rooms found</div>
            ) : (
              rooms.slice(0, 4).map((room) => (
                <div
                  key={room.id}
                  className="flex justify-between items-center"
                >
                  <span className="font-medium text-slate-900">
                    {room.name}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      room.status === "available"
                        ? "bg-green-100 text-green-700"
                        : room.status === "maintenance"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {room.status ||
                      (room.isAvailable ? "available" : "unavailable")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
