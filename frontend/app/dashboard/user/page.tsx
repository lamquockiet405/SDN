"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
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
import UserBookingDashboard from "@/components/dashboard/UserBookingDashboard";
import UserProfilePage from "@/components/dashboard/UserProfilePage";
import UserPaymentsPage from "@/components/dashboard/UserPaymentsPage";
import UserFeedbackPage from "@/components/dashboard/UserFeedbackPage";
import UserRoomsPage from "@/components/dashboard/UserRoomsPage";
import UserSettingsPage from "@/components/dashboard/UserSettingsPage";
import UserTwoFactorPage from "@/components/dashboard/UserTwoFactorPage";

const VALID_TABS = new Set([
  "bookings",
  "rooms",
  "payments",
  "feedback",
  "profile",
  "2fa",
  "settings",
]);

export default function UserDashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("bookings");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shouldRedirect = localStorage.getItem("redirectToProfile");
    if (shouldRedirect === "1") {
      localStorage.removeItem("redirectToProfile");
      setActiveNav("profile");
    }
  }, []);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.has(tab)) {
      setActiveNav(tab);
    }
  }, [searchParams]);

  // Redirect to home if user is admin or staff
  useEffect(() => {
    if (
      !isLoading &&
      user &&
      (user.role === "admin" || user.role === "staff")
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigationItems = [
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "rooms", label: "Rooms", icon: Zap },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
    { id: "2fa", label: "2FA", icon: Shield },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-slate-900 text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen && "justify-center w-full"
            }`}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold">
              SH
            </div>
            {sidebarOpen && <span className="font-bold text-lg">StudyHub</span>}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeNav === item.id
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

        {/* User Section */}
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
                  setActiveNav("profile");
                  setUserMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-700 rounded-t-lg"
              >
                View Profile
              </button>
              <button
                onClick={() => {
                  setActiveNav("settings");
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

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-slate-200 z-30 shadow-sm">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-slate-100 rounded-lg transition"
              >
                {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
              </button>

              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="text"
                    placeholder="Search rooms..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Date Selector */}
              <input
                type="date"
                className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {/* Notifications */}
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition"
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    <button
                      onClick={() => {
                        setActiveNav("profile");
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveNav("profile");
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        setActiveNav("settings");
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      Settings
                    </button>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {activeNav === "bookings" && <UserBookingDashboard />}
          {activeNav === "rooms" && <UserRoomsPage />}
          {activeNav === "profile" && <UserProfilePage />}
          {activeNav === "2fa" && <UserTwoFactorPage />}
          {activeNav === "payments" && <UserPaymentsPage />}
          {activeNav === "feedback" && <UserFeedbackPage />}
          {activeNav === "settings" && <UserSettingsPage />}
        </div>
      </main>
    </div>
  );
}
