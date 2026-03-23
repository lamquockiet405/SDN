"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PaymentTransaction, paymentService } from "@/services/paymentService";
import { Calendar, CreditCard, Search } from "lucide-react";
import Link from "next/link";

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
      return "bg-gray-100 text-gray-700";
  }
};

const getBookingId = (payment: PaymentTransaction) => {
  if (typeof payment.bookingId === "object") {
    return payment.bookingId._id || "-";
  }

  return payment.bookingId;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const response = await paymentService.getPaymentHistory({
        page: 1,
        limit: 100,
      });
      setPayments(response.data || []);
    } catch (error) {
      console.error("Failed to fetch payments", error);
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    let result = payments;

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    if (search) {
      const keyword = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.txnRef.toLowerCase().includes(keyword) ||
          item.orderId.toLowerCase().includes(keyword),
      );
    }

    return result;
  }, [payments, search, statusFilter]);

  const stats = {
    totalPayments: filteredPayments.reduce((sum, item) => sum + item.amount, 0),
    successPayments: filteredPayments
      .filter((item) => item.status === "success")
      .reduce((sum, item) => sum + item.amount, 0),
    pendingPayments: filteredPayments
      .filter((item) => item.status === "pending")
      .reduce((sum, item) => sum + item.amount, 0),
  };

  return (
    <DashboardLayout title="Payments">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              {stats.totalPayments.toFixed(0)} VND
            </p>
          </div>

          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Success</h3>
              <div className="p-3 bg-green-50 rounded-lg text-green-600">
                <CreditCard size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.successPayments.toFixed(0)} VND
            </p>
          </div>

          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">Pending</h3>
              <div className="p-3 bg-yellow-50 rounded-lg text-yellow-600">
                <CreditCard size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.pendingPayments.toFixed(0)} VND
            </p>
          </div>
        </div>

        <div className="bg-white rounded-card shadow-soft-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by txnRef or orderId"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-btn font-medium transition"
            >
              Reset
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card shadow-soft-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Order ID
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
                      Txn Ref
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {payment.orderId}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {getBookingId(payment)}
                      </td>
                      <td className="py-4 px-6 font-semibold text-gray-900">
                        {payment.amount.toFixed(0)} {payment.currency}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          <span className="text-sm">
                            {new Date(payment.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            payment.status,
                          )}`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {payment.txnRef}
                      </td>
                      <td className="py-4 px-6">
                        {payment.status === "pending" &&
                        getBookingId(payment) !== "-" ? (
                          <Link
                            href={`/payments/pay-now?bookingId=${encodeURIComponent(getBookingId(payment))}`}
                            className="inline-flex items-center px-3 py-1.5 rounded-btn bg-primary text-white text-xs font-medium hover:bg-blue-600 transition"
                          >
                            Pay Now
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isLoading && filteredPayments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-card">
            <CreditCard size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-gray-900 font-semibold mb-1">
              No payments found
            </h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
