"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { bookingService } from "@/services/bookingService";
import { paymentService } from "@/services/paymentService";
import {
  Zap,
  CreditCard,
  MessageSquare,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Search,
  Bell,
  ChevronLeft,
  Shield,
} from "lucide-react";

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

  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: { error?: string } } }).response?.data
      ?.error
  ) {
    return (error as { response: { data: { error: string } } }).response.data
      .error;
  }

  return fallback;
};

export default function PayNowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const bookingId = searchParams.get("bookingId") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [orderInfo, setOrderInfo] = useState({
    productName: "Room Booking",
    quantity: 1,
    price: 0,
    total: 0,
  });

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        setError("Missing bookingId");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const booking = await bookingService.getBookingById(bookingId);

        const roomName =
          typeof booking.roomId === "object"
            ? booking.roomId.name || booking.roomId.location || "Room Booking"
            : "Room Booking";

        const total = booking.totalPrice || 0;
        setOrderInfo({
          productName: roomName,
          quantity: 1,
          price: total,
          total,
        });
      } catch (loadError: unknown) {
        setError(getErrorMessage(loadError, "Failed to load booking"));
      } finally {
        setIsLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const canPay = useMemo(() => {
    return Boolean(bookingId) && orderInfo.total > 0;
  }, [bookingId, orderInfo.total]);

  const handlePayNow = async () => {
    if (!canPay) {
      return;
    }

    try {
      setIsPaying(true);
      setError("");

      await paymentService.createDirectPayment({
        bookingId,
        amount: orderInfo.total,
      });
      router.push("/dashboard/user");
    } catch (payError: unknown) {
      setError(getErrorMessage(payError, "Payment failed"));
      setIsPaying(false);
    }
  };

  const navigationItems = [
    { id: "rooms", label: "Rooms", icon: Zap },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
    { id: "2fa", label: "2FA", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleNavClick = (id: string) => {
    router.push(`/dashboard/user?tab=${id}`);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <aside
          className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div
              className={`flex items-center gap-3 ${
                !sidebarOpen && "justify-center w-full"
              }`}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold">
                SH
              </div>
              {sidebarOpen && (
                <span className="font-bold text-lg">StudyHub</span>
              )}
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    item.id === "payments"
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-800 transition"
            >
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              {sidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.role}
                    </p>
                  </div>
                  <ChevronDown size={16} />
                </>
              )}
            </button>

            {userMenuOpen && sidebarOpen && (
              <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 rounded-lg shadow-xl">
                <button
                  onClick={() => {
                    router.push("/dashboard/user?tab=profile");
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded-t-lg"
                >
                  View Profile
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/user?tab=settings");
                    setUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700"
                >
                  Settings
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 rounded-b-lg flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </aside>

        <main
          className={`transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-20"
          }`}
        >
          <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-sm">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4 flex-1">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
                </button>

                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search
                      size={20}
                      className="absolute left-3 top-3 text-slate-400"
                    />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="date"
                  className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
                  <Bell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </header>

          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Payment</h1>
              <p className="text-slate-600 mt-1">Complete your order</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12 bg-white rounded-card shadow-soft-md">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="bg-white rounded-card shadow-soft-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Order Information
                  </h2>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Tên sản phẩm</span>
                      <span className="font-semibold text-slate-900">
                        {orderInfo.productName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Số lượng</span>
                      <span className="font-semibold text-slate-900">
                        {orderInfo.quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Giá</span>
                      <span className="font-semibold text-slate-900">
                        {orderInfo.price.toFixed(0)} VND
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-900 font-semibold">
                        Tổng tiền
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        {orderInfo.total.toFixed(0)} VND
                      </span>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-card shadow-soft-md p-6 space-y-4">
                  <h2 className="text-xl font-bold text-slate-900">
                    Thanh toán
                  </h2>

                  <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                    Thanh toán trực tiếp trong hệ thống.
                  </p>

                  {error && (
                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => router.push("/payments")}
                      className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-btn hover:bg-slate-50 transition font-medium"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={handlePayNow}
                      disabled={!canPay || isPaying}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-btn hover:bg-blue-600 disabled:opacity-70 transition font-medium"
                    >
                      {isPaying ? "Đang xử lý..." : "Xác nhận thanh toán"}
                    </button>
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
