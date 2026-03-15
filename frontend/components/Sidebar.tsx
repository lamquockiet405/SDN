"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  CreditCard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

export const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links: SidebarLink[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { label: "Rooms", href: "/rooms", icon: <BookOpen size={20} /> },
    { label: "Bookings", href: "/bookings", icon: <Calendar size={20} /> },
    { label: "Payments", href: "/payments", icon: <CreditCard size={20} /> },
    { label: "Feedback", href: "/feedback", icon: <MessageSquare size={20} /> },
    {
      label: "Users",
      href: "/users",
      icon: <Users size={20} />,
      adminOnly: true,
    },
    { label: "Settings", href: "/settings", icon: <Settings size={20} /> },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const visibleLinks = links.filter(
    (link) => !link.adminOnly || user?.role === "admin",
  );

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-soft"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-secondary text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-40 overflow-y-auto`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <BookOpen size={28} />
              StudyHub
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            {visibleLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-btn transition-colors ${
                    isActive(link.href)
                      ? "bg-primary text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.icon}
                  <span>{link.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {user && (
            <div className="px-4 py-2 bg-gray-700 rounded-btn">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="font-semibold truncate">{user.name}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-btn bg-danger hover:bg-red-600 transition-colors text-white font-medium"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};
