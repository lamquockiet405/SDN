"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  DoorOpen,
  Calendar,
  Clock,
  BarChart3,
  Image,
  Star,
  Lock,
  FileText,
  AlertTriangle,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Search,
  Bell,
  ChevronLeft,
} from "lucide-react";
import AdminDashboardOverview from "@/components/admin/AdminDashboardOverview";
import AdminUserManagement from "@/components/admin/AdminUserManagement";
import AdminStaffManagement from "@/components/admin/AdminStaffManagement";
import AdminRoomManagement from "@/components/admin/AdminRoomManagement";
import AdminBookingManagement from "@/components/admin/AdminBookingManagement";
import AdminTimeSlotManagement from "@/components/admin/AdminTimeSlotManagement";
import AdminUsageHistory from "@/components/admin/AdminUsageHistory";
import AdminEvidenceReview from "@/components/admin/AdminEvidenceReview";
import AdminRatingManagement from "@/components/admin/AdminRatingManagement";
import AdminPermissionsManagement from "@/components/admin/AdminPermissionsManagement";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import AdminViolations from "@/components/admin/AdminViolations";
import AdminSettings from "@/components/admin/AdminSettings";

export default function AdminDashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // Redirect to home if user is not admin
  useEffect(() => {
    if (!isLoading && user && user.role !== "admin") {
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
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "staff", label: "Staff Management", icon: UserCheck },
    { id: "rooms", label: "Room Management", icon: DoorOpen },
    { id: "bookings", label: "Booking Management", icon: Calendar },
    { id: "timeslots", label: "Time Slots", icon: Clock },
    { id: "history", label: "Usage History", icon: BarChart3 },
    { id: "evidence", label: "Evidence Review", icon: Image },
    { id: "ratings", label: "Ratings", icon: Star },
    { id: "permissions", label: "Permissions", icon: Lock },
    { id: "audit", label: "Audit Logs", icon: FileText },
    { id: "violations", label: "Violations", icon: AlertTriangle },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen && "justify-center w-full"
            }`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg flex items-center justify-center font-bold">
              A
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg">Admin Portal</span>
            )}
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
                    ? "bg-red-600 text-white shadow-lg"
                    : "text-slate-300 hover:bg-slate-700/50"
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
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-slate-700/50 transition"
          >
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400">Admin</p>
                </div>
                <ChevronDown size={16} />
              </>
            )}
          </button>

          {userMenuOpen && sidebarOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-700 rounded-lg shadow-xl border border-slate-600">
              <button
                onClick={() => {
                  setActiveNav("settings");
                  setUserMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-200 hover:bg-slate-600 rounded-t-lg"
              >
                Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-600 rounded-b-lg flex items-center gap-2"
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
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-slate-100 rounded-lg transition">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition"
                >
                  {user?.name?.charAt(0)?.toUpperCase()}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    <button
                      onClick={() => {
                        setActiveNav("settings");
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
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
          {activeNav === "dashboard" && <AdminDashboardOverview />}
          {activeNav === "users" && <AdminUserManagement />}
          {activeNav === "staff" && <AdminStaffManagement />}
          {activeNav === "rooms" && <AdminRoomManagement />}
          {activeNav === "bookings" && <AdminBookingManagement />}
          {activeNav === "timeslots" && <AdminTimeSlotManagement />}
          {activeNav === "history" && <AdminUsageHistory />}
          {activeNav === "evidence" && <AdminEvidenceReview />}
          {activeNav === "ratings" && <AdminRatingManagement />}
          {activeNav === "permissions" && <AdminPermissionsManagement />}
          {activeNav === "audit" && <AdminAuditLogs />}
          {activeNav === "violations" && <AdminViolations />}
          {activeNav === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}
