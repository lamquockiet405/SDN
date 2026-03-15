"use client";

import { useState } from "react";
import { BarChart3, Filter } from "lucide-react";

interface UsageRecord {
  id: string;
  date: string;
  room: string;
  user: string;
  checkIn: string;
  checkOut: string;
  duration: string;
}

export default function AdminUsageHistory() {
  const [records, setRecords] = useState<UsageRecord[]>([
    {
      id: "1",
      date: "2025-03-15",
      room: "Study Room A",
      user: "John Doe",
      checkIn: "10:00",
      checkOut: "12:30",
      duration: "2h 30m",
    },
    {
      id: "2",
      date: "2025-03-15",
      room: "Lab Room B",
      user: "Jane Smith",
      checkIn: "14:00",
      checkOut: "16:45",
      duration: "2h 45m",
    },
    {
      id: "3",
      date: "2025-03-15",
      room: "Meeting Room A",
      user: "Mike Johnson",
      checkIn: "09:00",
      checkOut: "11:00",
      duration: "2h",
    },
    {
      id: "4",
      date: "2025-03-14",
      room: "Study Room B",
      user: "Sarah Williams",
      checkIn: "13:00",
      checkOut: "15:30",
      duration: "2h 30m",
    },
    {
      id: "5",
      date: "2025-03-14",
      room: "Study Room A",
      user: "Tom Brown",
      checkIn: "10:00",
      checkOut: "11:45",
      duration: "1h 45m",
    },
  ]);

  const [filterRoom, setFilterRoom] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const rooms = Array.from(new Set(records.map((r) => r.room)));

  const filteredRecords = records.filter((r) => {
    const roomMatch = filterRoom === "all" || r.room === filterRoom;
    const dateMatch = !filterDate || r.date === filterDate;
    return roomMatch && dateMatch;
  });

  const totalDuration =
    filteredRecords.length > 0
      ? filteredRecords.reduce((sum, r) => {
          const [h, m] = r.duration
            .replace("h ", "")
            .replace("m", "")
            .split(" ");
          return sum + parseInt(h) * 60 + parseInt(m);
        }, 0)
      : 0;

  const avgDuration =
    filteredRecords.length > 0
      ? (totalDuration / filteredRecords.length).toFixed(1)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 size={32} className="text-indigo-600" />
          Usage History
        </h1>
        <p className="text-slate-600 mt-1">Total records: {records.length}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter by Room
          </label>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
          >
            <option value="all">All Rooms</option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
          />
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <p className="text-sm text-indigo-600 font-semibold mb-1">
            Total Records
          </p>
          <p className="text-2xl font-bold text-indigo-900">
            {filteredRecords.length}
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-semibold mb-1">
            Total Duration
          </p>
          <p className="text-2xl font-bold text-purple-900">
            {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
          </p>
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
          <p className="text-sm text-pink-600 font-semibold mb-1">
            Average Duration
          </p>
          <p className="text-2xl font-bold text-pink-900">{avgDuration}m</p>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Check-in
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Check-out
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {record.date}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{record.room}</td>
                  <td className="px-6 py-4 text-slate-700">{record.user}</td>
                  <td className="px-6 py-4 text-slate-700">{record.checkIn}</td>
                  <td className="px-6 py-4 text-slate-700">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold">
                    {record.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BarChart3 size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No records found</p>
        </div>
      )}
    </div>
  );
}
