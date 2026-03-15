"use client";

import { useState } from "react";
import {
  CreditCard,
  Download,
  Eye,
  Trash2,
  Plus,
  Filter,
  ChevronDown,
} from "lucide-react";

interface Payment {
  id: string;
  bookingId: string;
  roomName: string;
  amount: number;
  status: "completed" | "pending" | "failed";
  date: string;
  method: string;
}

interface Booking {
  id: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  status: "completed" | "pending";
}

export default function UserPaymentsPage() {
  const [activeTab, setActiveTab] = useState<"history" | "pending" | "make">(
    "history",
  );
  const [filterStatus, setFilterStatus] = useState("all");

  const [payments] = useState<Payment[]>([
    {
      id: "p1",
      bookingId: "b1",
      roomName: "Study Room A",
      amount: 50,
      status: "completed",
      date: "2025-03-10",
      method: "Credit Card",
    },
    {
      id: "p2",
      bookingId: "b2",
      roomName: "Lab Room B",
      amount: 70,
      status: "completed",
      date: "2025-03-08",
      method: "Credit Card",
    },
    {
      id: "p3",
      bookingId: "b3",
      roomName: "Meeting Room C",
      amount: 100,
      status: "pending",
      date: "2025-03-15",
      method: "Bank Transfer",
    },
  ]);

  const [pendingBookings] = useState<Booking[]>([
    {
      id: "b4",
      roomName: "Study Room A",
      date: "2025-03-20",
      startTime: "10:00",
      endTime: "12:00",
      amount: 50,
      status: "pending",
    },
    {
      id: "b5",
      roomName: "Meeting Room C",
      date: "2025-03-22",
      startTime: "14:00",
      endTime: "17:00",
      amount: 150,
      status: "pending",
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const totalSpent = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Payments</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium">
          <Plus size={20} />
          New Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-md">
          <p className="text-blue-100 mb-2">Total Spent</p>
          <p className="text-3xl font-bold">${totalSpent}</p>
          <p className="text-sm text-blue-100 mt-2">All completed payments</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-md">
          <p className="text-yellow-100 mb-2">Pending Balance</p>
          <p className="text-3xl font-bold">
            ${pendingBookings.reduce((sum, b) => sum + b.amount, 0)}
          </p>
          <p className="text-sm text-yellow-100 mt-2">
            {pendingBookings.length} pending bookings
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-md">
          <p className="text-purple-100 mb-2">Payment Methods</p>
          <p className="text-3xl font-bold">2</p>
          <p className="text-sm text-purple-100 mt-2">Active payment methods</p>
        </div>
      </div>

      {/* Tabs */}
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

      {/* Payment History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">
              Payment History
            </h2>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <Filter size={18} />
                Filter
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Room
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Amount
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Method
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-4 px-6 font-medium text-slate-900">
                      {payment.roomName}
                    </td>
                    <td className="py-4 px-6 text-slate-700">{payment.date}</td>
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      ${payment.amount}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          payment.status,
                        )}`}
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {payment.method}
                    </td>
                    <td className="py-4 px-6 flex gap-2">
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition">
                        <Eye size={18} className="text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition">
                        <Download size={18} className="text-slate-600" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pending Payments Tab */}
      {activeTab === "pending" && (
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
                  key={booking.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-bold text-slate-900">
                      {booking.roomName}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {booking.date} • {booking.startTime} - {booking.endTime}
                    </p>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-2xl font-bold text-slate-900">
                      ${booking.amount}
                    </p>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium">
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium">
                        Pay Now
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Make Payment Tab */}
      {activeTab === "make" && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Make a Payment
          </h2>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Booking
              </label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Select a booking...</option>
                {pendingBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.roomName} - ${booking.amount}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Payment Method
              </label>
              <select className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <option>Credit/Debit Card</option>
                <option>Bank Transfer</option>
                <option>Digital Wallet</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-600 font-medium">
                  $
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium">
              Continue to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
