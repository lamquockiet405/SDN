"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, Eye, XCircle } from "lucide-react";
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "approved":
    case "confirmed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "checked_in":
      return "bg-blue-100 text-blue-700";
    case "checked_out":
    case "completed":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const statusLabel = (status: string) =>
  status
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (char: string) => char.toUpperCase());

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

export default function AdminBookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getManagementBookings({
        page: 1,
        limit: 100,
      });
      setBookings(response.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    try {
      setActionLoadingId(id);
      await bookingService.forceCancelBooking(id, "Cancelled by admin");
      await fetchBookings();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Force cancel booking failed"));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleApproveBooking = async (id: string) => {
    try {
      setActionLoadingId(id);
      await bookingService.approveBooking(id);
      await fetchBookings();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Approve booking failed"));
    } finally {
      setActionLoadingId("");
    }
  };

  const handleRejectBooking = async (id: string) => {
    try {
      setActionLoadingId(id);
      await bookingService.rejectBooking(id, "Rejected by admin");
      await fetchBookings();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Reject booking failed"));
    } finally {
      setActionLoadingId("");
    }
  };

  const stats = useMemo(() => {
    const approved = bookings.filter((b) =>
      ["approved", "confirmed"].includes(b.status),
    ).length;
    const pending = bookings.filter((b) => b.status === "pending").length;
    const rejected = bookings.filter((b) =>
      ["rejected", "cancelled"].includes(b.status),
    ).length;
    return { approved, pending, rejected };
  }, [bookings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar size={32} className="text-blue-600" />
          Booking Management
        </h1>
        <p className="text-slate-600 mt-1">Total bookings: {bookings.length}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-semibold mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-900">{stats.approved}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600 font-semibold mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-semibold mb-1">
            Rejected/Cancelled
          </p>
          <p className="text-2xl font-bold text-red-900">{stats.rejected}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : (
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
                  <tr
                    key={getBookingId(booking)}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {getUserDisplay(booking)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {getRoomDisplay(booking)}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(booking.startTime).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                      {new Date(booking.endTime).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {statusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Eye size={18} />
                        </button>
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleApproveBooking(getBookingId(booking))
                              }
                              disabled={
                                actionLoadingId === getBookingId(booking)
                              }
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-btn hover:bg-green-200 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleRejectBooking(getBookingId(booking))
                              }
                              disabled={
                                actionLoadingId === getBookingId(booking)
                              }
                              className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-btn hover:bg-yellow-200 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {![
                          "cancelled",
                          "rejected",
                          "checked_out",
                          "completed",
                        ].includes(booking.status) && (
                          <button
                            onClick={() =>
                              handleCancelBooking(getBookingId(booking))
                            }
                            disabled={actionLoadingId === getBookingId(booking)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {bookings.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Calendar size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No bookings found</p>
        </div>
      )}
    </div>
  );
}
