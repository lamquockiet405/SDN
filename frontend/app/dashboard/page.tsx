"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import {
  TrendingUp,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { bookingService } from "@/services/bookingService";
import { roomService } from "@/services/roomService";
import { BookingStats } from "@/types/booking";
import { Room } from "@/types/room";

// Mock data for charts (in real app, fetch from API)
const bookingTrendData = [
  { name: "Mon", bookings: 40, revenue: 2400 },
  { name: "Tue", bookings: 35, revenue: 2100 },
  { name: "Wed", bookings: 50, revenue: 3000 },
  { name: "Thu", bookings: 45, revenue: 2700 },
  { name: "Fri", bookings: 55, revenue: 3300 },
  { name: "Sat", bookings: 30, revenue: 1800 },
  { name: "Sun", bookings: 25, revenue: 1500 },
];

const roomUsageData = [
  { name: "Meeting Room A", value: 35 },
  { name: "Study Room B", value: 25 },
  { name: "Lab Room C", value: 20 },
  { name: "Conference D", value: 20 },
];

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

export default function DashboardPage() {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // In a real app, fetch actual data from API
        // const statsData = await bookingService.getStats();
        // const roomsData = await roomService.getRooms();
        // setStats(statsData);
        // setRooms(roomsData.rooms);

        // Mock data
        setStats({
          totalBookings: 156,
          bookingsToday: 12,
          totalRevenue: 4200,
          averageRating: 4.8,
        });

        setRooms([
          {
            id: "1",
            name: "Meeting Room A",
            capacity: 8,
            rating: 4.8,
            pricePerHour: 50,
            equipment: ["Projector", "Whiteboard"],
            floor: 2,
            isAvailable: true,
          },
          {
            id: "2",
            name: "Study Room B",
            capacity: 4,
            rating: 4.6,
            pricePerHour: 30,
            equipment: ["Desk", "Chair"],
            floor: 1,
            isAvailable: true,
          },
          {
            id: "3",
            name: "Lab Room C",
            capacity: 20,
            rating: 4.9,
            pricePerHour: 80,
            equipment: ["Lab Equipment", "Computers"],
            floor: 3,
            isAvailable: false,
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Bookings"
            value={stats?.totalBookings || 0}
            icon={<Calendar size={24} />}
            color="blue"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Available Rooms"
            value={rooms.filter((r) => r.isAvailable).length}
            icon={<BookOpen size={24} />}
            color="green"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Bookings Today"
            value={stats?.bookingsToday || 0}
            icon={<TrendingUp size={24} />}
            color="purple"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Total Revenue"
            value={`€${stats?.totalRevenue || 0}`}
            icon={<DollarSign size={24} />}
            color="orange"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Trend Chart */}
          <div className="lg:col-span-2 bg-white rounded-card shadow-soft-md p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Booking Trend</h2>
              <p className="text-sm text-gray-500">
                Weekly booking and revenue
              </p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={bookingTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: "#3B82F6" }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: "#10B981" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Room Usage Chart */}
          <div className="bg-white rounded-card shadow-soft-md p-6">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">Room Usage</h2>
              <p className="text-sm text-gray-500">Usage by room</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomUsageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomUsageData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Rooms */}
        <div className="bg-white rounded-card shadow-soft-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Available Rooms
              </h2>
              <p className="text-sm text-gray-500">Most popular study spaces</p>
            </div>
            <a
              href="/rooms"
              className="text-primary hover:text-blue-600 font-medium text-sm"
            >
              View All →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Room Name
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Capacity
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Price/hour
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Rating
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{room.name}</td>
                    <td className="py-3 px-4">{room.capacity} people</td>
                    <td className="py-3 px-4">€{room.pricePerHour}</td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1">
                        ⭐ {room.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          room.isAvailable
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {room.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
