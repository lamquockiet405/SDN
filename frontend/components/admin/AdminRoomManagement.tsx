"use client";

import { useEffect, useState } from "react";
import { DoorOpen, Plus, Trash2 } from "lucide-react";
import { roomService } from "@/services/roomService";
import { Room } from "@/types/room";

export default function AdminRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: 20,
    location: "",
    pricePerHour: 20,
    amenities: "",
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomService.getRooms({ limit: 100, status: "" });
      setRooms(response.rooms);
    } catch (error) {
      console.error("Failed to fetch rooms", error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoom = async () => {
    if (formData.name && formData.capacity > 0 && formData.location) {
      await roomService.createRoom({
        name: formData.name,
        capacity: formData.capacity,
        location: formData.location,
        pricePerHour: formData.pricePerHour,
        amenities: formData.amenities
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await fetchRooms();
      setFormData({
        name: "",
        capacity: 20,
        location: "",
        pricePerHour: 20,
        amenities: "",
      });
      setShowForm(false);
    }
  };

  const handleChangeStatus = async (
    id: string,
    status: "available" | "unavailable" | "maintenance",
  ) => {
    await roomService.changeRoomStatus(id, status);
    await fetchRooms();
  };

  const handleDeleteRoom = async (id: string) => {
    await roomService.deleteRoom(id);
    await fetchRooms();
  };

  const statusColors = {
    available: "bg-green-100 text-green-700",
    maintenance: "bg-yellow-100 text-yellow-700",
    unavailable: "bg-red-100 text-red-700",
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
                Room Name *
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
                  Capacity *
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
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Price Per Hour *
                </label>
                <input
                  type="number"
                  value={formData.pricePerHour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pricePerHour: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  min="0"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Building A - Floor 2"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Amenities (comma separated)
              </label>
              <input
                type="text"
                value={formData.amenities}
                onChange={(e) =>
                  setFormData({ ...formData, amenities: e.target.value })
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
                  setFormData({
                    name: "",
                    capacity: 20,
                    location: "",
                    pricePerHour: 20,
                    amenities: "",
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
                  Location
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
                    {room.location || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={
                        room.status ||
                        (room.isAvailable ? "available" : "unavailable")
                      }
                      onChange={(e) =>
                        handleChangeStatus(
                          room.id,
                          e.target.value as
                            | "available"
                            | "unavailable"
                            | "maintenance",
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                        statusColors[
                          (room.status ||
                            (room.isAvailable
                              ? "available"
                              : "unavailable")) as
                            | "available"
                            | "unavailable"
                            | "maintenance"
                        ]
                      } cursor-pointer`}
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="unavailable">Unavailable</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
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

      {loading && (
        <div className="text-center py-10 text-slate-500">Loading rooms...</div>
      )}

      {rooms.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <DoorOpen size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No rooms yet</p>
        </div>
      )}
    </div>
  );
}
