"use client";

import { useState } from "react";
import { BarChart3, Filter, Calendar } from "lucide-react";

interface UsageRecord {
  id: string;
  room: string;
  user: string;
  checkInTime: string;
  checkOutTime: string;
  duration: number;
  date: string;
}

export default function StaffUsageHistory() {
  const [records, setRecords] = useState<UsageRecord[]>([
    {
      id: "1",
      room: "Study Room A",
      user: "John Doe",
      checkInTime: "14:00",
      checkOutTime: "15:45",
      duration: 1.75,
      date: "2025-03-15",
    },
    {
      id: "2",
      room: "Lab Room B",
      user: "Jane Smith",
      checkInTime: "10:00",
      checkOutTime: "11:30",
      duration: 1.5,
      date: "2025-03-15",
    },
    {
      id: "3",
      room: "Study Room A",
      user: "Mike Johnson",
      checkInTime: "16:00",
      checkOutTime: "17:00",
      duration: 1,
      date: "2025-03-15",
    },
    {
      id: "4",
      room: "Meeting Room C",
      user: "Sarah Williams",
      checkInTime: "09:00",
      checkOutTime: "11:00",
      duration: 2,
      date: "2025-03-14",
    },
  ]);

  const [filterRoom, setFilterRoom] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const filteredRecords = records.filter((record) => {
    const roomMatch = filterRoom === "all" || record.room === filterRoom;
    const dateMatch = !filterDate || record.date === filterDate;
    return roomMatch && dateMatch;
  });

  const totalDuration = filteredRecords.reduce(
    (sum, record) => sum + record.duration,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Usage History</h1>
        <p className="text-slate-600 mt-1">
          Track room usage and booking history
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filter by Room
          </label>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Rooms</option>
            <option value="Study Room A">Study Room A</option>
            <option value="Lab Room B">Lab Room B</option>
            <option value="Meeting Room C">Meeting Room C</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <p className="text-blue-100 text-sm mb-1">Total Usage Records</p>
          <p className="text-3xl font-bold">{filteredRecords.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <p className="text-green-100 text-sm mb-1">Total Duration</p>
          <p className="text-3xl font-bold">{totalDuration.toFixed(2)}h</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <p className="text-purple-100 text-sm mb-1">Avg Duration</p>
          <p className="text-3xl font-bold">
            {(totalDuration / filteredRecords.length || 0).toFixed(2)}h
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Date
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Room
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                User
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Check-in
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Check-out
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Duration
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr
                key={record.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-4 px-6 text-slate-700">{record.date}</td>
                <td className="py-4 px-6 font-medium text-slate-900">
                  {record.room}
                </td>
                <td className="py-4 px-6 text-slate-700">{record.user}</td>
                <td className="py-4 px-6 text-slate-700">
                  {record.checkInTime}
                </td>
                <td className="py-4 px-6 text-slate-700">
                  {record.checkOutTime}
                </td>
                <td className="py-4 px-6 font-medium text-slate-900">
                  {record.duration}h
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BarChart3 size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No usage records found</p>
        </div>
      )}
    </div>
  );
}
