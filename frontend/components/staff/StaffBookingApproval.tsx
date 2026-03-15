"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Clock,
  Users,
} from "lucide-react";

interface Booking {
  id: string;
  user: string;
  room: string;
  date: string;
  startTime: string;
  endTime: string;
  participants: number;
  status: "pending" | "approved" | "rejected";
}

export default function StaffBookingApproval() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "b1",
      user: "John Doe",
      room: "Study Room A",
      date: "2025-03-20",
      startTime: "14:00",
      endTime: "16:00",
      participants: 2,
      status: "pending",
    },
    {
      id: "b2",
      user: "Jane Smith",
      room: "Lab Room B",
      date: "2025-03-20",
      startTime: "10:00",
      endTime: "12:00",
      participants: 1,
      status: "pending",
    },
    {
      id: "b3",
      user: "Mike Johnson",
      room: "Meeting Room C",
      date: "2025-03-19",
      startTime: "09:00",
      endTime: "11:00",
      participants: 4,
      status: "approved",
    },
  ]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleApprove = (id: string) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: "approved" } : b)),
    );
  };

  const handleReject = (id: string) => {
    setBookings(
      bookings.map((b) => (b.id === id ? { ...b, status: "rejected" } : b)),
    );
  };

  const pendingBookings = bookings.filter((b) => b.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Booking Approval</h1>
        <p className="text-slate-600 mt-1">
          Review and approve pending room bookings
        </p>
      </div>

      {/* Pending Count */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>{pendingBookings.length}</strong> pending booking(s) awaiting
          approval
        </p>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                User
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Room
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Date
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Time
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Participants
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Status
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-4 px-6 font-medium text-slate-900">
                  {booking.user}
                </td>
                <td className="py-4 px-6 text-slate-700">{booking.room}</td>
                <td className="py-4 px-6 text-slate-700">{booking.date}</td>
                <td className="py-4 px-6 text-slate-700">
                  {booking.startTime} - {booking.endTime}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-1 text-slate-700">
                    <Users size={16} />
                    {booking.participants}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailsModal(true);
                      }}
                      className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-600"
                    >
                      <Eye size={18} />
                    </button>
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                        >
                          <XCircle size={16} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Booking Details
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">User:</span>
                  <span className="font-medium text-slate-900">
                    {selectedBooking.user}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Room:</span>
                  <span className="font-medium text-slate-900">
                    {selectedBooking.room}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-medium text-slate-900">
                    {selectedBooking.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Time:</span>
                  <span className="font-medium text-slate-900">
                    {selectedBooking.startTime} - {selectedBooking.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Participants:</span>
                  <span className="font-medium text-slate-900">
                    {selectedBooking.participants}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      selectedBooking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : selectedBooking.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Close
              </button>
              {selectedBooking.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      handleApprove(selectedBooking.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedBooking.id);
                      setShowDetailsModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
