"use client";

import { useEffect, useState } from "react";
import { Clock, Plus } from "lucide-react";
import { roomService } from "@/services/roomService";
import { Room, TimeSlot } from "@/types/room";

interface TimeSlotRow extends TimeSlot {
  roomName: string;
}

const HOURS = Array.from({ length: 15 }, (_, index) => index + 8);

const toDateInputValue = (value: string | Date) => {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const toLocalHour = (value: string | Date) => {
  return new Date(value).getHours();
};

const buildIsoDateTime = (date: string, hour: number) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day, hour, 0, 0, 0).toISOString();
};

export default function AdminTimeSlotManagement() {
  const [slots, setSlots] = useState<TimeSlotRow[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    roomId: "",
    startDate: "",
    endDate: "",
    startHour: 8,
    endHour: 9,
    status: "available" as "available" | "booked" | "blocked",
    editingSlotId: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const roomData = await roomService.getRooms({ page: 1, limit: 100 });
      setRooms(roomData.rooms);

      const allSlots = await Promise.all(
        roomData.rooms.map(async (room) => {
          const slotsData = await roomService.getTimeSlots(room.id);
          return slotsData.map((slot) => ({
            ...slot,
            id: slot.id || slot._id || `${room.id}-${slot.startTime}`,
            roomName: room.name,
          }));
        }),
      );

      setSlots(allSlots.flat());
    } catch (error) {
      console.error("Failed to load time slots", error);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSlot = async () => {
    if (!formData.roomId || !formData.startDate || !formData.endDate) {
      alert("Please select room and date range");
      return;
    }

    if (formData.startHour < 8 || formData.endHour > 22) {
      alert("Operating hours must be between 08:00 and 22:00");
      return;
    }

    if (formData.endHour <= formData.startHour) {
      alert("End hour must be greater than start hour");
      return;
    }

    try {
      if (formData.editingSlotId) {
        await roomService.updateTimeSlot(
          formData.roomId,
          formData.editingSlotId,
          {
            startTime: buildIsoDateTime(formData.startDate, formData.startHour),
            endTime: buildIsoDateTime(formData.startDate, formData.endHour),
            status: formData.status,
          },
        );
      } else {
        const startDate = new Date(`${formData.startDate}T00:00:00`);
        const endDate = new Date(`${formData.endDate}T00:00:00`);

        if (endDate < startDate) {
          alert("End date must be after or equal to start date");
          return;
        }

        const dates: string[] = [];
        const cursor = new Date(startDate);

        while (cursor <= endDate) {
          dates.push(toDateInputValue(cursor));
          cursor.setDate(cursor.getDate() + 1);
        }

        const slotRequests = dates.flatMap((date) => {
          const requests: Array<Promise<TimeSlot>> = [];

          for (let hour = formData.startHour; hour < formData.endHour; hour++) {
            requests.push(
              roomService.createTimeSlot(formData.roomId, {
                startTime: buildIsoDateTime(date, hour),
                endTime: buildIsoDateTime(date, hour + 1),
                status: formData.status,
              }),
            );
          }

          return requests;
        });

        const results = await Promise.allSettled(slotRequests);

        const failed = results.filter(
          (item) => item.status === "rejected",
        ).length;
        if (failed > 0) {
          alert(
            `Created ${results.length - failed}/${results.length} slots. ${failed} failed due to conflict or invalid data.`,
          );
        }
      }

      await fetchData();
      setFormData({
        roomId: "",
        startDate: "",
        endDate: "",
        startHour: 8,
        endHour: 9,
        status: "available",
        editingSlotId: "",
      });
      setShowForm(false);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to save time slot");
    }
  };

  const handleEditSlot = (slot: TimeSlotRow) => {
    const startDate = toDateInputValue(slot.startTime);

    setFormData({
      roomId: slot.roomId || "",
      startDate,
      endDate: startDate,
      startHour: toLocalHour(slot.startTime),
      endHour: toLocalHour(slot.endTime),
      status: slot.status,
      editingSlotId: slot._id || slot.id,
    });
    setShowForm(true);
  };

  const handleDeleteSlot = async (slot: TimeSlotRow) => {
    const slotId = slot._id || slot.id;
    if (!slot.roomId || !slotId) {
      return;
    }

    const confirmed = window.confirm(
      `Delete this slot for ${slot.roomName} (${new Date(slot.startTime).toLocaleString()} - ${new Date(slot.endTime).toLocaleString()})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      await roomService.deleteTimeSlot(slot.roomId, slotId);
      await fetchData();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to delete time slot");
    }
  };

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
            {formData.editingSlotId ? "Update Time Slot" : "Add New Time Slot"}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Room
              </label>
              <select
                value={formData.roomId}
                onChange={(e) =>
                  setFormData({ ...formData, roomId: e.target.value })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
              >
                <option value="">Select a room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Date {formData.editingSlotId ? "(same day)" : ""}
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  disabled={Boolean(formData.editingSlotId)}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 disabled:bg-slate-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Start Hour
                </label>
                <select
                  value={formData.startHour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startHour: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
                >
                  {HOURS.slice(0, -1).map((hour) => (
                    <option key={hour} value={hour}>
                      {String(hour).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  End Hour
                </label>
                <select
                  value={formData.endHour}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      endHour: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
                >
                  {HOURS.slice(1).map((hour) => (
                    <option key={hour} value={hour}>
                      {String(hour).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Room operating time is limited to 08:00 - 22:00. Create mode
              supports setting the same slot across multiple days.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleSubmitSlot}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
              >
                {formData.editingSlotId ? "Update Slot" : "Add Slot"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    roomId: "",
                    startDate: "",
                    endDate: "",
                    startHour: 8,
                    endHour: 9,
                    status: "available",
                    editingSlotId: "",
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
                const start = new Date(slot.startTime);
                const end = new Date(slot.endTime);
                const duration = Math.max(
                  0,
                  Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
                );

                return (
                  <tr key={slot.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {slot.roomName}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(slot.startTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {new Date(slot.endTime).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {duration} mins
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          slot.status === "available"
                            ? "bg-green-100 text-green-700"
                            : slot.status === "booked"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSlot(slot)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition text-xs"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition text-xs"
                        >
                          Delete
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

      {loading && (
        <div className="text-center py-10 text-slate-500">
          Loading time slots...
        </div>
      )}

      {slots.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Clock size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No time slots yet</p>
        </div>
      )}
    </div>
  );
}
