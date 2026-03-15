"use client";

import { useState } from "react";
import {
  Edit2,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
} from "lucide-react";

interface Room {
  id: string;
  name: string;
  capacity: number;
  equipment: string;
  status: "available" | "maintenance" | "closed";
}

export default function StaffRoomManagement() {
  const [rooms, setRooms] = useState<Room[]>([
    {
      id: "1",
      name: "Study Room A",
      capacity: 2,
      equipment: "Whiteboard, WiFi, Power Outlet",
      status: "available",
    },
    {
      id: "2",
      name: "Lab Room B",
      capacity: 4,
      equipment: "Equipment, Lab Chairs, Ventilation",
      status: "available",
    },
    {
      id: "3",
      name: "Meeting Room C",
      capacity: 8,
      equipment: "Projector, Video Call, WiFi",
      status: "maintenance",
    },
    {
      id: "4",
      name: "Quiet Zone D",
      capacity: 1,
      equipment: "Soundproof, Desk, WiFi",
      status: "closed",
    },
  ]);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<
    "available" | "maintenance" | "closed"
  >("available");

  const handleStatusChange = (roomId: string) => {
    setSelectedRoom(rooms.find((r) => r.id === roomId) || null);
    setShowStatusModal(true);
  };

  const handleStatusUpdate = () => {
    if (selectedRoom) {
      setRooms(
        rooms.map((r) =>
          r.id === selectedRoom.id ? { ...r, status: newStatus } : r,
        ),
      );
      setShowStatusModal(false);
      setSelectedRoom(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle size={16} className="text-green-600" />;
      case "maintenance":
        return <AlertCircle size={16} className="text-yellow-600" />;
      case "closed":
        return <XCircle size={16} className="text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "maintenance":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Room Management</h1>
          <p className="text-slate-600 mt-1">
            Manage study rooms and their status
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium">
          <Plus size={20} />
          Add Room
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Room Name
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Capacity
              </th>
              <th className="text-left py-4 px-6 font-semibold text-slate-700">
                Equipment
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
            {rooms.map((room) => (
              <tr
                key={room.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                <td className="py-4 px-6 font-medium text-slate-900">
                  {room.name}
                </td>
                <td className="py-4 px-6 text-slate-700">
                  {room.capacity} people
                </td>
                <td className="py-4 px-6 text-sm text-slate-700">
                  {room.equipment}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(room.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        room.status,
                      )}`}
                    >
                      {room.status.charAt(0).toUpperCase() +
                        room.status.slice(1)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(room.id)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-100 text-primary rounded-lg hover:bg-blue-200 transition font-medium"
                    >
                      <AlertCircle size={16} />
                      Change
                    </button>
                    <button className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-600">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded-lg transition text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Modal */}
      {showStatusModal && selectedRoom && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">
                Change Status: {selectedRoom.name}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  New Status
                </label>
                <div className="space-y-2">
                  {["available", "maintenance", "closed"].map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status"
                        value={status}
                        checked={newStatus === status}
                        onChange={(e) =>
                          setNewStatus(
                            e.target.value as
                              | "available"
                              | "maintenance"
                              | "closed",
                          )
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-slate-900">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
