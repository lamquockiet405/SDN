"use client";

import { useState } from "react";
import { Clock, Plus, Edit2, Trash2 } from "lucide-react";

interface TimeSlot {
  id: string;
  room: string;
  startTime: string;
  endTime: string;
  status: "active" | "inactive";
}

export default function AdminTimeSlotManagement() {
  const [slots, setSlots] = useState<TimeSlot[]>([
    {
      id: "1",
      room: "Study Room A",
      startTime: "08:00",
      endTime: "12:00",
      status: "active",
    },
    {
      id: "2",
      room: "Study Room A",
      startTime: "13:00",
      endTime: "17:00",
      status: "active",
    },
    {
      id: "3",
      room: "Lab Room B",
      startTime: "09:00",
      endTime: "14:00",
      status: "active",
    },
    {
      id: "4",
      room: "Lab Room B",
      startTime: "15:00",
      endTime: "18:00",
      status: "inactive",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    room: "",
    startTime: "08:00",
    endTime: "12:00",
  });

  const handleAddSlot = () => {
    if (formData.room && formData.startTime && formData.endTime) {
      setSlots([
        ...slots,
        {
          id: Date.now().toString(),
          ...formData,
          status: "active",
        },
      ]);
      setFormData({ room: "", startTime: "08:00", endTime: "12:00" });
      setShowForm(false);
    }
  };

  const handleDeleteSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setSlots(
      slots.map((s) =>
        s.id === id
          ? { ...s, status: s.status === "active" ? "inactive" : "active" }
          : s,
      ),
    );
  };

  const rooms = Array.from(new Set(slots.map((s) => s.room)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Clock size={32} className="text-orange-600" />
            Time Slot Management
          </h1>
          <p className="text-slate-600 mt-1">Total slots: {slots.length}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Time Slot
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Add New Time Slot
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Room
              </label>
              <select
                value={formData.room}
                onChange={(e) =>
                  setFormData({ ...formData, room: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) =>
                    setFormData({ ...formData, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) =>
                    setFormData({ ...formData, endTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddSlot}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
              >
                Add Slot
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    room: "",
                    startTime: "08:00",
                    endTime: "12:00",
                  });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slots Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {slots.map((slot) => {
                const [startH, startM] = slot.startTime.split(":").map(Number);
                const [endH, endM] = slot.endTime.split(":").map(Number);
                const duration = endH - startH;

                return (
                  <tr key={slot.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {slot.room}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {slot.startTime}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{slot.endTime}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {duration} hours
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          slot.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStatus(slot.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {slots.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Clock size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No time slots yet</p>
        </div>
      )}
    </div>
  );
}
