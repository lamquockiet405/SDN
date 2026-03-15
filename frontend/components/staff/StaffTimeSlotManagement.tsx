"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Clock } from "lucide-react";

interface TimeSlot {
  id: string;
  room: string;
  startTime: string;
  endTime: string;
  status: "available" | "booked" | "blocked";
}

export default function StaffTimeSlotManagement() {
  const [slots, setSlots] = useState<TimeSlot[]>([
    {
      id: "1",
      room: "Study Room A",
      startTime: "08:00",
      endTime: "10:00",
      status: "available",
    },
    {
      id: "2",
      room: "Study Room A",
      startTime: "10:00",
      endTime: "12:00",
      status: "booked",
    },
    {
      id: "3",
      room: "Lab Room B",
      startTime: "08:00",
      endTime: "09:00",
      status: "blocked",
    },
    {
      id: "4",
      room: "Lab Room B",
      startTime: "14:00",
      endTime: "16:00",
      status: "available",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    room: "",
    startTime: "",
    endTime: "",
    status: "available" as const,
  });

  const handleAddSlot = () => {
    if (formData.room && formData.startTime && formData.endTime) {
      setSlots([
        ...slots,
        {
          id: Date.now().toString(),
          room: formData.room,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: formData.status,
        },
      ]);
      setFormData({
        room: "",
        startTime: "",
        endTime: "",
        status: "available",
      });
      setShowModal(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "booked":
        return "bg-blue-100 text-blue-700";
      case "blocked":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Time Slot Management
          </h1>
          <p className="text-slate-600 mt-1">
            Create and manage room booking time slots
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          <Plus size={20} />
          Create Time Slot
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Room
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Start Time
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                End Time
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Duration
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Status
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {slots.map((slot) => {
              const startHour = parseInt(slot.startTime);
              const endHour = parseInt(slot.endTime);
              const duration = endHour - startHour;

              return (
                <tr
                  key={slot.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition"
                >
                  <td className="py-4 px-6 font-medium text-slate-900">
                    {slot.room}
                  </td>
                  <td className="py-4 px-6 text-slate-700">{slot.startTime}</td>
                  <td className="py-4 px-6 text-slate-700">{slot.endTime}</td>
                  <td className="py-4 px-6 text-slate-700">
                    {duration} hour(s)
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        slot.status,
                      )}`}
                    >
                      {slot.status.charAt(0).toUpperCase() +
                        slot.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-600">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg transition text-red-600">
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Create Time Slot
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Room *
                </label>
                <select
                  value={formData.room}
                  onChange={(e) =>
                    setFormData({ ...formData, room: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a room</option>
                  <option value="Study Room A">Study Room A</option>
                  <option value="Lab Room B">Lab Room B</option>
                  <option value="Meeting Room C">Meeting Room C</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as
                        | "available"
                        | "booked"
                        | "blocked",
                    })
                  }
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSlot}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
