"use client";

import {
  LayoutDashboard,
  Users,
  DoorOpen,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function StaffDashboardOverview() {
  const stats = [
    {
      label: "Total Rooms",
      value: "12",
      icon: DoorOpen,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Pending Approvals",
      value: "8",
      icon: CheckCircle,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      label: "Active Users",
      value: "45",
      icon: Users,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Issues Reported",
      value: "3",
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
          Welcome back! Here's your overview.
        </p>
      </div>

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
                  <p className="text-3xl font-bold">{stat.value}</p>
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
            {[
              {
                room: "Study Room A",
                user: "John Doe",
                time: "14:00 - 16:00",
                status: "approved",
              },
              {
                room: "Lab Room B",
                user: "Jane Smith",
                time: "10:00 - 12:00",
                status: "pending",
              },
              {
                room: "Meeting Room C",
                user: "Mike Johnson",
                time: "09:00 - 10:00",
                status: "approved",
              },
            ].map((booking, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-slate-900">{booking.room}</p>
                  <p className="text-sm text-slate-600">{booking.user}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {booking.time}
                  </p>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      booking.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Status */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Room Status</h2>
          <div className="space-y-3">
            {[
              { name: "Study Room A", status: "Available", color: "green" },
              { name: "Lab Room B", status: "Maintenance", color: "yellow" },
              { name: "Meeting Room C", status: "Available", color: "green" },
              { name: "Quiet Zone D", status: "Closed", color: "red" },
            ].map((room, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="font-medium text-slate-900">{room.name}</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    room.color === "green"
                      ? "bg-green-100 text-green-700"
                      : room.color === "yellow"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
