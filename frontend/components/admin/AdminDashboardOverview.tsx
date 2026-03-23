"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Shield, AlertTriangle } from "lucide-react";
import { userService, DashboardStats } from "@/services/userService";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await userService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load dashboard stats",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (isLoading) {
    return <div className="text-slate-600">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
        {error}
      </div>
    );
  }

  const cards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      title: "Total Staff",
      value: stats?.totalStaff || 0,
      icon: UserCheck,
      color: "text-green-600 bg-green-50 border-green-200",
    },
    {
      title: "Total Admins",
      value: stats?.totalAdmins || 0,
      icon: Shield,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
    {
      title: "Active Violations",
      value: stats?.activeViolations || 0,
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 border-red-200",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">User and violation overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`rounded-lg p-6 border ${card.color}`}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold">{card.title}</p>
                <Icon size={20} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Inactive Users</p>
          <p className="text-2xl font-bold text-slate-900">
            {stats?.inactiveUsers || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Locked Users</p>
          <p className="text-2xl font-bold text-slate-900">
            {stats?.lockedUsers || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <p className="text-sm text-slate-600">Total Violations</p>
          <p className="text-2xl font-bold text-slate-900">
            {stats?.totalViolations || 0}
          </p>
        </div>
      </div>

      <button
        onClick={loadStats}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Refresh
      </button>
    </div>
  );
}
