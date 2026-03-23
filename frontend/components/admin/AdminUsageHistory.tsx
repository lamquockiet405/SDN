"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3 } from "lucide-react";
import { roomService } from "@/services/roomService";
import { Room, RoomUsageRecord } from "@/types/room";

export default function AdminUsageHistory() {
  const [records, setRecords] = useState<RoomUsageRecord[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterRoom, setFilterRoom] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomData, usageData] = await Promise.all([
        roomService.getRooms({ page: 1, limit: 100 }),
        roomService.getUsageHistory({ page: 1, limit: 200 }),
      ]);
      setRooms(roomData.rooms);
      setRecords(usageData.records);
    } catch (error) {
      console.error("Failed to load usage history", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const roomMatch = filterRoom === "all" || record.roomId === filterRoom;
      const dateMatch =
        !filterDate ||
        new Date(record.checkInTime).toISOString().slice(0, 10) === filterDate;
      return roomMatch && dateMatch;
    });
  }, [records, filterRoom, filterDate]);

  const totalDuration = filteredRecords.reduce(
    (sum, record) => sum + (record.durationMinutes || 0),
    0,
  );
  const avgDuration =
    filteredRecords.length > 0
      ? (totalDuration / filteredRecords.length).toFixed(1)
      : "0";

  const roomMap = useMemo(
    () => new Map(rooms.map((room) => [room.id, room.name])),
    [rooms],
  );

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
              <option key={room.id} value={room.id}>
                {room.name}
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
                <tr
                  key={record._id || record.id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {new Date(record.checkInTime).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {roomMap.get(record.roomId) || record.roomId}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{record.userId}</td>
                  <td className="px-6 py-4 text-slate-700">
                    {new Date(record.checkInTime).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {record.checkOutTime
                      ? new Date(record.checkOutTime).toLocaleTimeString()
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-semibold">
                    {record.durationMinutes}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="text-center py-10 text-slate-500">
          Loading usage history...
        </div>
      )}

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <BarChart3 size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No records found</p>
        </div>
      )}
    </div>
  );
}
