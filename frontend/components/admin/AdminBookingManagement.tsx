"use client";

import { useState } from "react";
import { Calendar, XCircle, Eye } from "lucide-react";

interface Booking {
  id: string;
  user: string;
  room: string;
  date: string;
  time: string;
  status: "approved" | "pending" | "rejected";
}

export default function AdminBookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "b1",
      user: "John Doe",
      room: "Study Room A",
      date: "2025-03-20",
      time: "10:00 - 12:00",
      status: "approved",
    },
    {
      id: "b2",
      user: "Jane Smith",
      room: "Lab Room B",
      date: "2025-03-20",
      time: "14:00 - 16:00",
      status: "pending",
    },
    {
      id: "b3",
      user: "Mike Johnson",
      room: "Meeting Room A",
      date: "2025-03-21",
      time: "09:00 - 11:00",
      status: "approved",
    },
    {
      id: "b4",
      user: "Sarah Williams",
      room: "Study Room B",
      date: "2025-03-21",
      time: "15:00 - 17:00",
      status: "pending",
    },
  ]);

  const handleCancelBooking = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id));
  };

  const statusColors = {
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
    rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar size={32} className="text-blue-600" />
          Booking Management
        </h1>
        <p className="text-slate-600 mt-1">Total bookings: {bookings.length}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-semibold mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-900">
            {bookings.filter((b) => b.status === "approved").length}
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-semibold mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">
            {bookings.filter((b) => b.status === "pending").length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-semibold mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-900">
            {bookings.filter((b) => b.status === "rejected").length}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {booking.user}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{booking.room}</td>
                  <td className="px-6 py-4 text-slate-700">{booking.date}</td>
                  <td className="px-6 py-4 text-slate-700">{booking.time}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[booking.status]
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {bookings.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No bookings found</p>
        </div>
      )}
    </div>
  );
}
