"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Payment } from "@/services/paymentService";
import {
  CreditCard,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Search,
  Filter,
  MoreVertical,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
  });

  // Mock data
  const mockPayments: Payment[] = [
    {
      id: "pay1",
      bookingId: "book1",
      amount: 100,
      status: "completed",
      transactionId: "TXN001",
      createdAt: "2024-03-20T10:00:00Z",
    },
    {
      id: "pay2",
      bookingId: "book2",
      amount: 60,
      status: "completed",
      transactionId: "TXN002",
      createdAt: "2024-03-21T14:00:00Z",
    },
    {
      id: "pay3",
      bookingId: "book3",
      amount: 320,
      status: "pending",
      createdAt: "2024-03-22T09:00:00Z",
    },
    {
      id: "pay4",
      bookingId: "book4",
      amount: 120,
      status: "completed",
      transactionId: "TXN004",
      createdAt: "2024-03-19T15:00:00Z",
    },
    {
      id: "pay5",
      bookingId: "book5",
      amount: 75,
      status: "failed",
      createdAt: "2024-03-18T11:00:00Z",
    },
  ];

  // Summary stats
  const stats = {
    totalPayments: mockPayments.reduce((sum, p) => sum + p.amount, 0),
    completedPayments: mockPayments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0),
    pendingPayments: mockPayments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + p.amount, 0),
  };

  useEffect(() => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPayments(mockPayments);
      setFilteredPayments(mockPayments);
      setIsLoading(false);
    }, 500);
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = payments;

    if (filters.status !== "all") {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.search) {
      filtered = filtered.filter(
        (p) =>
          p.transactionId?.includes(filters.search) ||
          p.id.includes(filters.search),
      );
    }

    setFilteredPayments(filtered);
  }, [filters, payments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "failed":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Payments */}
          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Total Payments
              </h3>
              <div className="p-3 bg-blue-50 rounded-lg text-primary">
                <CreditCard size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              €{stats.totalPayments}
            </p>
            <p className="text-xs text-gray-500 mt-2">All time transactions</p>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Completed</h3>
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <ArrowDownRight size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              €{stats.completedPayments}
            </p>
            <p className="text-xs text-gray-500 mt-2">Successfully processed</p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                <ArrowUpRight size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              €{stats.pendingPayments}
            </p>
            <p className="text-xs text-gray-500 mt-2">Awaiting confirmation</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-card shadow-soft-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by ID or transaction..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Reset */}
            <button
              onClick={() => setFilters({ status: "all", search: "" })}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-btn font-medium transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-gray-600">
            Found{" "}
            <span className="font-semibold">{filteredPayments.length}</span>{" "}
            {filteredPayments.length === 1 ? "payment" : "payments"}
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

        {/* Payments Table */}
        {!isLoading && (
          <div className="bg-white rounded-card shadow-soft-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Payment ID
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Booking ID
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Date & Time
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Transaction ID
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {payment.id}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">
                          {payment.bookingId}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        €{payment.amount}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {formatDate(payment.createdAt)}{" "}
                            {formatTime(payment.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                            payment.status,
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {payment.transactionId || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={20} />
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
        {!isLoading && filteredPayments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-card">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-gray-900 font-semibold mb-1">
              No payments found
            </h3>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
