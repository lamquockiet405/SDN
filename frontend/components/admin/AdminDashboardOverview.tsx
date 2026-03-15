"use client";

import { useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  UserCheck,
  DoorOpen,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardOverview() {
  const [timeRange, setTimeRange] = useState("month");

  const stats = [
    {
      title: "Total Users",
      value: "1,245",
      change: "+12%",
      icon: Users,
      color: "from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Staff",
      value: "48",
      change: "+3",
      icon: UserCheck,
      color: "from-green-50 to-green-100",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Total Rooms",
      value: "32",
      change: "All Active",
      icon: DoorOpen,
      color: "from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200",
    },
    {
      title: "Pending Approvals",
      value: "18",
      change: "Action needed",
      icon: AlertTriangle,
      color: "from-red-50 to-red-100",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
    },
  ];

  const detailedStats = [
    {
      label: "Bookings Today",
      value: "127",
      trend: "↑ 8%",
      trendColor: "text-green-600",
    },
    {
      label: "Active Bookings",
      value: "89",
      trend: "↓ 3%",
      trendColor: "text-red-600",
    },
    {
      label: "Violations",
      value: "12",
      trend: "↑ 2",
      trendColor: "text-red-600",
    },
    {
      label: "System Issues",
      value: "2",
      trend: "Resolved",
      trendColor: "text-green-600",
    },
  ];

  const recentActivities = [
    {
      user: "John Doe",
      action: "Created booking",
      room: "Study Room A",
      time: "2 hours ago",
      status: "success",
    },
    {
      user: "Jane Smith",
      action: "Suspended user",
      room: "System",
      time: "5 hours ago",
      status: "warning",
    },
    {
      user: "Admin User",
      action: "Updated room",
      room: "Lab Room B",
      time: "1 day ago",
      status: "info",
    },
    {
      user: "Mike Johnson",
      action: "Evidence rejected",
      room: "Meeting Room C",
      time: "2 days ago",
      status: "error",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">System overview and analytics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
        >
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
          <option value="year">Last year</option>
        </select>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.color} rounded-lg p-6 border ${stat.borderColor} shadow-sm hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 bg-white rounded-lg ${stat.iconColor}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {stat.change}
              </p>
            </div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {detailedStats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm"
          >
            <p className="text-xs text-slate-600 font-medium mb-1">
              {stat.label}
            </p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className={`text-sm font-semibold ${stat.trendColor}`}>
                {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Booking Trends
            </h2>
            <button className="text-sm text-blue-600 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {[
              { day: "Mon", value: 85, max: 100 },
              { day: "Tue", value: 92, max: 100 },
              { day: "Wed", value: 78, max: 100 },
              { day: "Thu", value: 88, max: 100 },
              { day: "Fri", value: 95, max: 100 },
              { day: "Sat", value: 65, max: 100 },
              { day: "Sun", value: 72, max: 100 },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-600 w-10">
                  {item.day}
                </span>
                <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: `${(item.value / item.max) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold text-slate-900 w-10">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Room Usage */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 size={20} className="text-purple-600" />
              Room Usage Statistics
            </h2>
            <button className="text-sm text-purple-600 hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-4">
            {[
              { room: "Study Room A", usage: 92, capacity: 30 },
              { room: "Study Room B", usage: 78, capacity: 30 },
              { room: "Lab Room A", usage: 85, capacity: 20 },
              { room: "Lab Room B", usage: 61, capacity: 20 },
              { room: "Meeting Room A", usage: 74, capacity: 15 },
              { room: "Meeting Room B", usage: 68, capacity: 15 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">
                    {item.room}
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      style={{ width: `${item.usage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.usage}%
                  </p>
                  <p className="text-xs text-slate-600">
                    {item.capacity} users
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6">
          Recent Activities
        </h2>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => {
            const statusColors = {
              success: "bg-green-100 text-green-700",
              warning: "bg-yellow-100 text-yellow-700",
              info: "bg-blue-100 text-blue-700",
              error: "bg-red-100 text-red-700",
            };
            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-slate-300 transition"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {activity.user}
                  </p>
                  <p className="text-sm text-slate-600">
                    {activity.action}
                    {activity.room !== "System" && ` in ${activity.room}`}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-1 mr-2 ${
                      statusColors[activity.status as keyof typeof statusColors]
                    }`}
                  >
                    {activity.status}
                  </span>
                  <p className="text-xs text-slate-600">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
