"use client";

import { useEffect, useMemo, useState } from "react";
import { Booking } from "@/types/booking";
import { AlertCircle, Calendar, Clock } from "lucide-react";
import { bookingService } from "@/services/bookingService";

const getBookingId = (booking: Booking) => booking._id || booking.id || "";

const getRoomName = (booking: Booking) => {
  if (booking.roomName) {
    return booking.roomName;
  }

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
    case "checked_in":
      return "bg-blue-100 text-blue-700";
    case "checked_out":
    case "completed":
      return "bg-indigo-100 text-indigo-700";
    case "cancelled":
    case "rejected":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getPaymentStatusColor = (status?: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "refunded":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const normalizeStatusLabel = (status: string) =>
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

interface Props {
  title?: string;
}

export default function UserBookingHistoryPage({
  title = "Booking History",
}: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingCheckout, setIsSubmittingCheckout] = useState(false);
  const [checkoutBooking, setCheckoutBooking] = useState<Booking | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidenceError, setEvidenceError] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getUserBookings(1, 100);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    let result = bookings;

    if (filters.status !== "all") {
      result = result.filter((item) => item.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter((item) =>
        getRoomName(item).toLowerCase().includes(search),
      );
    }

    return result;
  }, [bookings, filters]);

  const handleCancel = async (booking: Booking) => {
    try {
      await bookingService.cancelBooking(getBookingId(booking));
      await fetchBookings();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Cancel booking failed"));
    }
  };

  const handleCheckIn = async (booking: Booking) => {
    try {
      await bookingService.checkInBooking(getBookingId(booking));
      await fetchBookings();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Check-in failed"));
    }
  };

  const openCheckOutModal = (booking: Booking) => {
    setCheckoutBooking(booking);
    setEvidenceFile(null);
    setEvidenceError("");
  };

  const closeCheckOutModal = () => {
    if (isSubmittingCheckout) {
      return;
    }

    setCheckoutBooking(null);
    setEvidenceFile(null);
    setEvidenceError("");
  };

  const getEvidenceType = (file: File): "image" | "video" | "document" => {
    const mime = file.type || "";
    if (mime.startsWith("image/")) {
      return "image";
    }

    if (mime.startsWith("video/")) {
      return "video";
    }

    return "document";
  };

  const toDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Failed to read selected file"));
      reader.readAsDataURL(file);
    });

  const handleCheckOut = async () => {
    if (!checkoutBooking) {
      return;
    }

    if (!evidenceFile) {
      setEvidenceError("Please upload evidence before check-out");
      return;
    }

    const bookingId = getBookingId(checkoutBooking);
    if (!bookingId) {
      setEvidenceError("Invalid booking ID");
      return;
    }

    try {
      setIsSubmittingCheckout(true);
      setEvidenceError("");

      const evidenceType = getEvidenceType(evidenceFile);
      const evidenceUrl = await toDataUrl(evidenceFile);

      await bookingService.uploadUsageEvidence(bookingId, {
        url: evidenceUrl,
        type: evidenceType,
        size: evidenceFile.size,
      });

      await bookingService.checkOutBooking(bookingId);

      closeCheckOutModal();
      await fetchBookings();
    } catch (error: unknown) {
      setEvidenceError(getErrorMessage(error, "Check-out failed"));
    } finally {
      setIsSubmittingCheckout(false);
    }
  };

  const handleMakePayment = (booking: Booking) => {
    const bookingId = getBookingId(booking);
    if (!bookingId) {
      return;
    }

    window.location.href = `/payments/pay-now?bookingId=${encodeURIComponent(bookingId)}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="text-gray-600 mt-1">
          Manage your booking history and usage flow
        </p>
      </div>

      <div className="bg-white rounded-card shadow-soft-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by room name
            </label>
            <input
              type="text"
              placeholder="Room name..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="checked_in">Checked in</option>
              <option value="checked_out">Checked out</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

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

      <div>
        <p className="text-gray-600">
          Found <span className="font-semibold">{filteredBookings.length}</span>{" "}
          {filteredBookings.length === 1 ? "booking" : "bookings"}
        </p>
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      )}

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
                    key={getBookingId(booking)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-6">
                      <p className="font-medium text-gray-900">
                        {getRoomName(booking)}
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
                      ${booking.totalPrice}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          booking.status,
                        )}`}
                      >
                        {normalizeStatusLabel(booking.status)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          booking.paymentStatus,
                        )}`}
                      >
                        {booking.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {booking.status === "pending" && (
                          <button
                            onClick={() => handleCancel(booking)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-btn hover:bg-red-200"
                          >
                            Cancel
                          </button>
                        )}
                        {booking.status === "approved" && (
                          <button
                            onClick={() => handleCheckIn(booking)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-btn hover:bg-blue-200"
                          >
                            Check in
                          </button>
                        )}
                        {booking.status === "checked_in" && (
                          <button
                            onClick={() => openCheckOutModal(booking)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-btn hover:bg-green-200"
                          >
                            Check out
                          </button>
                        )}
                        {(booking.paymentStatus === "pending" ||
                          !booking.paymentStatus) &&
                          !["cancelled", "rejected"].includes(
                            booking.status,
                          ) && (
                            <button
                              onClick={() => handleMakePayment(booking)}
                              className="px-3 py-1 text-sm bg-primary/10 text-primary rounded-btn hover:bg-primary/20"
                            >
                              Make Payment
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {checkoutBooking && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-card shadow-soft-md p-6 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">
              Check-out with usage evidence
            </h3>
            <p className="text-sm text-slate-600">
              Room:{" "}
              <span className="font-medium">
                {getRoomName(checkoutBooking)}
              </span>
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Upload evidence file (required)
              </label>
              <input
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setEvidenceFile(file);
                  setEvidenceError("");
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-btn"
                disabled={isSubmittingCheckout}
              />
              <p className="text-xs text-slate-500">Max file size: 10MB</p>
            </div>

            {evidenceError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {evidenceError}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={closeCheckOutModal}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-btn hover:bg-slate-50"
                disabled={isSubmittingCheckout}
              >
                Cancel
              </button>
              <button
                onClick={handleCheckOut}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-btn hover:bg-blue-600 disabled:opacity-70"
                disabled={isSubmittingCheckout}
              >
                {isSubmittingCheckout ? "Processing..." : "Upload & Check out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
