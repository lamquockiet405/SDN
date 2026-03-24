"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";

const getBookingId = (booking: Booking) => booking._id || booking.id || "";

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

export default function StaffBookingApproval() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const fetchPendingBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getPendingBookingsForReview({
        page: 1,
        limit: 100,
      });
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to fetch pending bookings", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingBookings();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await bookingService.approveBooking(id);
      await fetchPendingBookings();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Approve booking failed"));
    }
  };

  const handleReject = async (id: string) => {
    try {
      await bookingService.rejectBooking(id, "Rejected by staff");
      await fetchPendingBookings();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Reject booking failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Booking Approval</h1>
        <p className="text-slate-600 mt-1">
          Review and approve pending room bookings
        </p>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>{bookings.length}</strong> pending booking(s) awaiting
          approval
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
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
                  Start
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  End
                </th>
                <th className="text-left py-4 px-6 font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr
                  key={getBookingId(booking)}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-4 px-6 font-medium text-slate-900">
                    {getUserDisplay(booking)}
                  </td>
                  <td className="py-4 px-6 text-slate-700">
                    {getRoomDisplay(booking)}
                  </td>
                  <td className="py-4 px-6 text-slate-700">
                    {new Date(booking.startTime).toLocaleString()}
                  </td>
                  <td className="py-4 px-6 text-slate-700">
                    {new Date(booking.endTime).toLocaleString()}
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
                      <button
                        onClick={() => handleApprove(getBookingId(booking))}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(getBookingId(booking))}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
                    {getUserDisplay(selectedBooking)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Room:</span>
                  <span className="font-medium text-slate-900">
                    {getRoomDisplay(selectedBooking)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Start:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(selectedBooking.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">End:</span>
                  <span className="font-medium text-slate-900">
                    {new Date(selectedBooking.endTime).toLocaleString()}
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
              <button
                onClick={async () => {
                  await handleApprove(getBookingId(selectedBooking));
                  setShowDetailsModal(false);
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Approve
              </button>
              <button
                onClick={async () => {
                  await handleReject(getBookingId(selectedBooking));
                  setShowDetailsModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
