"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { bookingService } from "@/services/bookingService";
import { roomService } from "@/services/roomService";
import { Booking } from "@/types/booking";
import { Room, TimeSlot } from "@/types/room";
import { Plus, ChevronLeft, ChevronRight, Users, X } from "lucide-react";

interface SelectedSlot {
  room: Room;
  slot: TimeSlot;
}

const GRID_TIME_LABELS = Array.from({ length: 14 }, (_, index) => {
  const hour = index + 8;
  return `${String(hour).padStart(2, "0")}:00`;
});

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHour = (value: string) => {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
};

const getRoomId = (booking: Booking) => {
  if (typeof booking.roomId === "object" && booking.roomId?._id) {
    return booking.roomId._id;
  }

  return String(booking.roomId);
};

export default function UserBookingDashboard() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    toDateInputValue(new Date()),
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomSlots, setRoomSlots] = useState<Record<string, TimeSlot[]>>({});
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedHour, setSelectedHour] = useState(GRID_TIME_LABELS[0]);
  const [focusedRoomId, setFocusedRoomId] = useState<string | null>(null);

  const loadDashboardData = async (dateValue: string) => {
    try {
      setIsLoading(true);

      const [roomData, bookingsData] = await Promise.all([
        roomService.getRooms({ page: 1, limit: 100 }),
        bookingService.getUserBookings(1, 200),
      ]);

      const fetchedRooms = roomData.rooms || [];
      setRooms(fetchedRooms);
      setMyBookings(bookingsData.bookings || []);

      const startOfDay = new Date(`${dateValue}T00:00:00`);
      const endOfDay = new Date(`${dateValue}T23:59:59`);

      const slotList = await Promise.all(
        fetchedRooms.map(async (room) => {
          try {
            const slots = await roomService.getTimeSlots(room.id, {
              startDate: startOfDay.toISOString(),
              endDate: endOfDay.toISOString(),
            });
            return [room.id, slots] as const;
          } catch (error) {
            console.error(`Failed to fetch slots for room ${room.id}`, error);
            return [room.id, []] as const;
          }
        }),
      );

      setRoomSlots(Object.fromEntries(slotList));
    } catch (error) {
      console.error("Failed to load booking dashboard data", error);
      setRooms([]);
      setRoomSlots({});
      setMyBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(selectedDate);
  }, [selectedDate]);

  const timeLabels = GRID_TIME_LABELS;
  const hasAnySlot = Object.values(roomSlots).some((slots) => slots.length > 0);

  const sortedRooms = useMemo(() => {
    return [...rooms].sort((left, right) => {
      const leftAvailableCount = (roomSlots[left.id] || []).filter(
        (slot) => slot.status === "available",
      ).length;
      const rightAvailableCount = (roomSlots[right.id] || []).filter(
        (slot) => slot.status === "available",
      ).length;

      const leftHasAvailable = leftAvailableCount > 0 ? 1 : 0;
      const rightHasAvailable = rightAvailableCount > 0 ? 1 : 0;

      if (leftHasAvailable !== rightHasAvailable) {
        return rightHasAvailable - leftHasAvailable;
      }

      if (leftAvailableCount !== rightAvailableCount) {
        return rightAvailableCount - leftAvailableCount;
      }

      return left.name.localeCompare(right.name);
    });
  }, [rooms, roomSlots]);

  const scrollRoomsLeft = () => {
    const container = document.getElementById("room-carousel");
    if (container) {
      container.scrollLeft -= 400;
    }
  };

  const scrollRoomsRight = () => {
    const container = document.getElementById("room-carousel");
    if (container) {
      container.scrollLeft += 400;
    }
  };

  const getSlotByTime = (roomId: string, timeLabel: string) => {
    const slots = roomSlots[roomId] || [];
    return slots.find((slot) => formatHour(slot.startTime) === timeLabel);
  };

  const getBookingForSlot = (roomId: string, slot: TimeSlot) => {
    return myBookings.find((booking) => {
      return (
        getRoomId(booking) === roomId &&
        new Date(booking.startTime).getTime() ===
          new Date(slot.startTime).getTime() &&
        new Date(booking.endTime).getTime() === new Date(slot.endTime).getTime()
      );
    });
  };

  const getBookingForHour = (roomId: string, timeLabel: string) => {
    return myBookings.find((booking) => {
      if (getRoomId(booking) !== roomId) {
        return false;
      }

      const bookingDate = toDateInputValue(new Date(booking.startTime));
      if (bookingDate !== selectedDate) {
        return false;
      }

      return formatHour(booking.startTime) === timeLabel;
    });
  };

  const getHourAvailabilityForRoom = (room: Room, hour: string) => {
    const slot = getSlotByTime(room.id, hour);
    const booking = slot ? getBookingForSlot(room.id, slot) : null;
    const isAvailable = !!slot && slot.status === "available" && !booking;

    return { slot, booking, isAvailable };
  };

  const handleDateShift = (direction: -1 | 1) => {
    const current = new Date(`${selectedDate}T00:00:00`);
    current.setDate(current.getDate() + direction);
    setSelectedDate(toDateInputValue(current));
  };

  const openBookingModal = (room: Room, slot: TimeSlot) => {
    setSelectedSlot({ room, slot });
    setSpecialRequests("");
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedSlot) {
      return;
    }

    try {
      setIsSubmitting(true);
      const createdBooking = await bookingService.createBooking({
        roomId: selectedSlot.room.id,
        startTime: selectedSlot.slot.startTime,
        endTime: selectedSlot.slot.endTime,
        specialRequests: specialRequests.trim() || undefined,
      });

      const createdBookingId = createdBooking._id || createdBooking.id;
      if (!createdBookingId) {
        throw new Error("Booking created but missing booking ID");
      }

      setShowBookingModal(false);
      setSelectedSlot(null);
      window.location.href = `/payments/pay-now?bookingId=${encodeURIComponent(createdBookingId)}`;
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to create booking");
      await loadDashboardData(selectedDate);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableRoomsBySelectedHour = sortedRooms.filter((room) => {
    const availability = getHourAvailabilityForRoom(room, selectedHour);
    return availability.isAvailable;
  });

  const roomsForBookingGrid = focusedRoomId
    ? sortedRooms.filter((room) => room.id === focusedRoomId)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Booking Dashboard</h1>
        <button
          onClick={() => {
            const firstRoom = sortedRooms[0];
            const firstAvailableSlot = firstRoom
              ? (roomSlots[firstRoom.id] || []).find(
                  (slot) => slot.status === "available",
                )
              : null;

            if (firstRoom && firstAvailableSlot) {
              openBookingModal(firstRoom, firstAvailableSlot);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
        >
          <Plus size={20} />
          New Booking
        </button>
      </div>

      {/* Date Selector */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            onClick={() => handleDateShift(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={() => handleDateShift(1)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            <ChevronRight size={20} />
          </button>
          <div>
            <label className="text-xs text-slate-500 block mb-1">Hour</label>
            <select
              value={selectedHour}
              onChange={(event) => {
                setSelectedHour(event.target.value);
                setFocusedRoomId(null);
              }}
              className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {timeLabels.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1" />
          <div className="text-right">
            <p className="text-sm text-slate-600">Selected: {selectedDate}</p>
            <p className="text-xs text-slate-500">
              {availableRoomsBySelectedHour.length} room(s) available at{" "}
              {selectedHour}
            </p>
          </div>
        </div>
      </div>

      {/* Rooms Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900">
            Available Rooms at {selectedHour}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={scrollRoomsLeft}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollRoomsRight}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          id="room-carousel"
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
        >
          {availableRoomsBySelectedHour.map((room) => {
            const availability = getHourAvailabilityForRoom(room, selectedHour);
            const roomHasAvailableSlot = availability.isAvailable;

            return (
              <div
                key={room.id}
                onClick={() => setFocusedRoomId(room.id)}
                className={`flex-shrink-0 w-80 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition border cursor-pointer ${
                  focusedRoomId === room.id
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-slate-200"
                }`}
              >
                {/* Room Image */}
                <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden relative">
                  <img
                    src={
                      room.image ||
                      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop"
                    }
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${room.pricePerHour}/hr
                  </div>
                </div>

                {/* Room Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
                      <span className="text-sm font-semibold text-yellow-700">
                        {(room.rating ?? 0).toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{room.capacity} people</span>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        roomHasAvailableSlot
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {roomHasAvailableSlot ? "Available" : "Busy"}
                    </div>
                  </div>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (availability.slot) {
                        openBookingModal(room, availability.slot);
                      }
                    }}
                    disabled={!roomHasAvailableSlot}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition ${
                      roomHasAvailableSlot
                        ? "bg-primary text-white hover:bg-blue-600"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    }`}
                  >
                    {roomHasAvailableSlot
                      ? `Book ${selectedHour}`
                      : "Not Available"}
                  </button>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      router.push(`/rooms/${room.id}?tab=reviews`);
                    }}
                    className="w-full mt-2 py-2 px-4 rounded-lg font-medium transition bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    Xem feedback
                  </button>
                </div>
              </div>
            );
          })}

          {!isLoading && availableRoomsBySelectedHour.length === 0 && (
            <div className="w-full bg-white rounded-lg border border-slate-200 p-6 text-slate-500 text-sm">
              No rooms available at {selectedHour}. Try another hour.
            </div>
          )}
        </div>
      </div>

      {/* Booking Timeline Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Booking Grid</h2>

        <div className="space-y-4">
          {roomsForBookingGrid.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden"
            >
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 font-semibold text-slate-800">
                {room.name}
              </div>

              <div className="divide-y divide-slate-200">
                {timeLabels.map((time) => {
                  const slot = getSlotByTime(room.id, time);
                  const booking = slot
                    ? getBookingForSlot(room.id, slot)
                    : getBookingForHour(room.id, time);

                  const isAvailable = slot?.status === "available" && !booking;
                  const isUserBooked = !!booking;
                  const isBooked = slot?.status === "booked" || !!booking;
                  const isBlocked = slot?.status === "blocked";

                  return (
                    <div
                      key={`${room.id}-${time}`}
                      className="grid grid-cols-[110px_1fr]"
                    >
                      <div className="px-4 py-3 text-sm font-medium text-slate-700 bg-slate-50 border-r border-slate-200">
                        {time}
                      </div>

                      <div
                        className="p-2 min-h-[62px] cursor-pointer hover:bg-slate-50 transition"
                        onClick={() => {
                          if (slot && isAvailable) {
                            openBookingModal(room, slot);
                          }
                        }}
                      >
                        {!slot && !isUserBooked && (
                          <div className="bg-red-50 rounded-lg p-3 h-full flex items-center justify-center border border-dashed border-red-300">
                            <span className="text-xs text-red-700 font-medium">
                              No slot
                            </span>
                          </div>
                        )}
                        {slot && isAvailable && (
                          <div className="bg-green-50 hover:bg-green-100 rounded-lg p-3 h-full flex items-center justify-center border border-dashed border-green-300 transition">
                            <span className="text-xs text-green-700 font-medium">
                              Available
                            </span>
                          </div>
                        )}
                        {isUserBooked && (
                          <div className="bg-yellow-50 rounded-lg p-3 h-full flex flex-col justify-center border border-yellow-300">
                            <span className="text-xs text-yellow-800 font-semibold">
                              My {booking?.status || "booked"}
                            </span>
                            <span className="text-[11px] text-yellow-700">
                              {booking
                                ? `${formatHour(booking.startTime)} - ${formatHour(
                                    booking.endTime,
                                  )}`
                                : slot
                                  ? `${formatHour(slot.startTime)} - ${formatHour(
                                      slot.endTime,
                                    )}`
                                  : time}
                            </span>
                          </div>
                        )}
                        {!isUserBooked && slot && isBooked && (
                          <div className="bg-blue-50 rounded-lg p-3 h-full flex flex-col justify-center border border-blue-200">
                            <span className="text-xs text-blue-700 font-semibold">
                              Booked
                            </span>
                            <span className="text-[11px] text-blue-600">
                              {formatHour(slot.startTime)} -{" "}
                              {formatHour(slot.endTime)}
                            </span>
                          </div>
                        )}
                        {slot && isBlocked && (
                          <div className="bg-red-50 rounded-lg p-3 h-full flex items-center justify-center border border-red-200">
                            <span className="text-xs text-red-700 font-medium">
                              Blocked
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {!isLoading && !focusedRoomId && (
            <div className="p-6 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg">
              Select a room above to view its booking grid.
            </div>
          )}

          {!isLoading && !hasAnySlot && (
            <div className="p-6 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg">
              No time slots configured for the selected date.
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                Book {selectedSlot.room.name}
              </h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Room Details */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-900 mb-3">
                  Room Details
                </h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between">
                    <span>Room Name:</span>
                    <span className="font-medium">
                      {selectedSlot.room.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <span className="font-medium">
                      {selectedSlot.room.capacity} people
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price/Hour:</span>
                    <span className="font-medium">
                      ${selectedSlot.room.pricePerHour}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="font-medium">
                      {formatHour(selectedSlot.slot.startTime)} -{" "}
                      {formatHour(selectedSlot.slot.endTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Special Requests
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  placeholder="Any special requests or notes..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              {/* Price Summary */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700">Total Price:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${selectedSlot.room.pricePerHour}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-70 transition font-medium"
              >
                {isSubmitting ? "Processing..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
