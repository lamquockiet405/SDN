"use client";

import { useEffect, useMemo, useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { PaymentTransaction, paymentService } from "@/services/paymentService";
import { bookingService } from "@/services/bookingService";
import { Booking } from "@/types/booking";

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
    case "success":
      return "bg-green-100 text-green-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "cancelled":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function UserPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"history" | "pending" | "make">(
    "history",
  );
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [paymentsRes, bookingsRes] = await Promise.all([
        paymentService.getPaymentHistory({ page: 1, limit: 100 }),
        bookingService.getUserBookings(1, 100),
      ]);

      setPayments(paymentsRes.data || []);
      setBookings(bookingsRes.bookings || []);
    } catch (error) {
      console.error("Failed to load payment data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const pendingBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          (booking.paymentStatus === "pending" || !booking.paymentStatus) &&
          !["cancelled", "rejected"].includes(booking.status),
      ),
    [bookings],
  );

  const totalSpent = payments
    .filter((payment) => payment.status === "success")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingBalance = pendingBookings.reduce(
    (sum, booking) => sum + booking.totalPrice,
    0,
  );

  const handleCreatePayment = (bookingId: string) => {
    if (!bookingId) {
      return;
    }

    window.location.href = `/payments/pay-now?bookingId=${encodeURIComponent(bookingId)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <button
          onClick={() => setActiveTab("make")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          <Plus size={20} />
          New Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <p className="text-blue-100 mb-2">Total Spent</p>
          <p className="text-3xl font-bold">{totalSpent.toFixed(0)} VND</p>
          <p className="text-sm text-blue-100 mt-2">All completed payments</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <p className="text-yellow-100 mb-2">Pending Balance</p>
          <p className="text-3xl font-bold">{pendingBalance.toFixed(0)} VND</p>
          <p className="text-sm text-yellow-100 mt-2">
            {pendingBookings.length} pending bookings
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-md">
          <p className="text-purple-100 mb-2">Transactions</p>
          <p className="text-3xl font-bold">{payments.length}</p>
          <p className="text-sm text-purple-100 mt-2">Payment records</p>
        </div>
      </div>

      <div className="flex gap-6 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 font-medium transition ${
            activeTab === "history"
              ? "text-primary border-b-2 border-primary -mb-[2px]"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Payment History
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`py-3 font-medium transition flex items-center gap-2 ${
            activeTab === "pending"
              ? "text-primary border-b-2 border-primary -mb-[2px]"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Pending Payments
          {pendingBookings.length > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {pendingBookings.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("make")}
          className={`py-3 font-medium transition ${
            activeTab === "make"
              ? "text-primary border-b-2 border-primary -mb-[2px]"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Make Payment
        </button>
      </div>

      {isLoading && <div className="text-slate-500">Loading...</div>}

      {!isLoading && activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Payment History</h2>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Booking ID
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {payment.orderId}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {typeof payment.bookingId === "object"
                        ? payment.bookingId._id
                        : payment.bookingId}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      {payment.amount.toFixed(0)} {payment.currency}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {new Date(payment.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && activeTab === "pending" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Pending Payments</h2>

          <div className="space-y-4">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <CreditCard size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">No pending payments</p>
              </div>
            ) : (
              pendingBookings.map((booking) => (
                <div
                  key={getBookingId(booking)}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {getRoomName(booking)}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {new Date(booking.startTime).toLocaleDateString()} •{" "}
                      {new Date(booking.startTime).toLocaleTimeString()} -{" "}
                      {new Date(booking.endTime).toLocaleTimeString()}
                    </p>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold text-slate-900">
                      {booking.totalPrice.toFixed(0)} VND
                    </p>
                    <button
                      onClick={() => handleCreatePayment(getBookingId(booking))}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {!isLoading && activeTab === "make" && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Make a Payment
          </h2>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Booking
              </label>
              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a booking...</option>
                {pendingBookings.map((booking) => (
                  <option
                    key={getBookingId(booking)}
                    value={getBookingId(booking)}
                  >
                    {getRoomName(booking)} - {booking.totalPrice.toFixed(0)} VND
                  </option>
                ))}
              </select>
            </div>

            <button
              disabled={!selectedBooking}
              onClick={() => {
                const booking = pendingBookings.find(
                  (item) => getBookingId(item) === selectedBooking,
                );

                if (booking) {
                  handleCreatePayment(getBookingId(booking));
                }
              }}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
