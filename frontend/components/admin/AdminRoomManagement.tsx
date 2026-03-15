"use client";

import { useState } from "react";
import { DoorOpen, Plus, Edit2, Trash2 } from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string;
  status: "available" | "maintenance" | "closed";
}

export default function AdminRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Study Room A",
      capacity: 30,
      equipment: "Projector, Whiteboard, AC",
      status: "available",
    },
    {
      id: "2",
      name: "Study Room B",
      capacity: 25,
      equipment: "Projector, AC",
      status: "available",
    },
    {
      id: "3",
      name: "Lab Room A",
      capacity: 20,
      equipment: "Lab Equipment, AC, WiFi",
      status: "maintenance",
    },
    {
      id: "4",
      name: "Meeting Room A",
      capacity: 15,
      equipment: "Video Call System, AC",
      status: "available",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 20,
    equipment: "",
  });

  const handleAddRoom = () => {
    if (formData.name && formData.capacity > 0) {
      setRooms([
        ...rooms,
        {
          id: Date.now().toString(),
          ...formData,
          status: "available",
        },
      ]);
      setFormData({ name: "", capacity: 20, equipment: "" });
      setShowForm(false);
    }
  };

  const handleChangeStatus = (id: string, status: Room["status"]) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleDeleteRoom = (id: string) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  const statusColors = {
    available: "bg-green-100 text-green-700",
    maintenance: "bg-yellow-100 text-yellow-700",
    closed: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <DoorOpen size={32} className="text-purple-600" />
            Room Management
          </h1>
          <p className="text-slate-600 mt-1">Total rooms: {rooms.length}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Room
        </button>
      </div>

      {/* Add Room Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Add New Room
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Room Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Study Room A"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Capacity
                </label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      capacity: parseInt(e.target.value),
                    })
                  }
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Equipment
              </label>
              <input
                type="text"
                value={formData.equipment}
                onChange={(e) =>
                  setFormData({ ...formData, equipment: e.target.value })
                }
                placeholder="e.g., Projector, Whiteboard, AC"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddRoom}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
              >
                Add Room
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", capacity: 20, equipment: "" });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Room Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Equipment
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
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {room.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{room.capacity}</td>
                  <td className="px-6 py-4 text-slate-700 text-sm">
                    {room.equipment}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={room.status}
                      onChange={(e) =>
                        handleChangeStatus(
                          room.id,
                          e.target.value as Room["status"],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                        statusColors[room.status]
                      } cursor-pointer`}
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {rooms.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <DoorOpen size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No rooms yet</p>
        </div>
      )}
    </div>
  );
}
