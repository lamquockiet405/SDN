const Room = require("../models/Room");
const TimeSlot = require("../models/TimeSlot");
const RoomUsageHistory = require("../models/RoomUsageHistory");
const Booking = require("../models/Booking");
const AuditLog = require("../models/AuditLog");
const { getIpAddress, getUserAgent } = require("../utils/helpers");

const allowedRoomStatuses = ["available", "unavailable", "maintenance"];

const validateSlotOperatingHours = (start, end) => {
  if (start.toDateString() !== end.toDateString()) {
    return "Time slot must be within the same day";
  }

  if (
    start.getMinutes() !== 0 ||
    start.getSeconds() !== 0 ||
    end.getMinutes() !== 0 ||
    end.getSeconds() !== 0
  ) {
    return "Time slot must use whole-hour boundaries (e.g. 08:00 - 09:00)";
  }

  const startHour = start.getHours();
  const endHour = end.getHours();

  if (startHour < 8 || endHour > 22 || endHour <= startHour) {
    return "Time slot must be within operating hours 08:00 - 22:00";
  }

  return null;
};

const normalizeRoom = (roomDoc) => {
  const room = roomDoc.toObject ? roomDoc.toObject() : roomDoc;
  const status =
    room.status || (room.availability ? "available" : "unavailable");

  return {
    ...room,
    id: room._id.toString(),
    status,
    isAvailable: status === "available" && room.availability !== false,
    equipment: room.amenities || [],
  };
};

const logRoomAudit = async (req, action, metadata = {}) => {
  if (!req.user?._id) {
    return;
  }

  try {
    await AuditLog.create({
      userId: req.user._id,
      action,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      status: "success",
      metadata,
    });
  } catch (error) {
    console.error("Room audit log error:", error.message);
  }
};

const buildRoomQuery = (query, isPrivileged) => {
  const {
    capacity,
    location,
    minPrice,
    maxPrice,
    search,
    status,
    availability,
  } = query;

  const mongoQuery = {};

  if (!isPrivileged) {
    mongoQuery.availability = true;
    mongoQuery.status = "available";
  }

  if (capacity) {
    mongoQuery.capacity = { $gte: parseInt(capacity, 10) };
  }

  if (location) {
    mongoQuery.location = { $regex: location, $options: "i" };
  }

  if (minPrice || maxPrice) {
    mongoQuery.pricePerHour = {};
    if (minPrice) mongoQuery.pricePerHour.$gte = parseFloat(minPrice);
    if (maxPrice) mongoQuery.pricePerHour.$lte = parseFloat(maxPrice);
  }

  if (search) {
    mongoQuery.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
    ];
  }

  if (isPrivileged && status && allowedRoomStatuses.includes(status)) {
    mongoQuery.status = status;
  }

  if (isPrivileged && availability !== undefined) {
    if (String(availability) === "true") mongoQuery.availability = true;
    if (String(availability) === "false") mongoQuery.availability = false;
  }

  return mongoQuery;
};

exports.getAllRooms = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;
    const isPrivileged = ["staff", "admin"].includes(req.user?.role);

    const mongoQuery = buildRoomQuery(req.query, isPrivileged);
    const sortDirection = String(sortOrder).toLowerCase() === "desc" ? -1 : 1;

    const rooms = await Room.find(mongoQuery)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(limitNumber);

    const total = await Room.countDocuments(mongoQuery);

    res.status(200).json({
      success: true,
      count: rooms.length,
      total,
      pages: Math.ceil(total / limitNumber),
      page: pageNumber,
      rooms: rooms.map(normalizeRoom),
    });
  } catch (error) {
    console.error("Get all rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching rooms",
      error: error.message,
    });
  }
};

exports.searchRooms = async (req, res) => {
  req.query.search = req.query.q || req.query.search || "";
  return exports.getAllRooms(req, res);
};

exports.getAvailableRoomsByTime = async (req, res) => {
  try {
    const { startTime, endTime } = req.query;
    const isPrivileged = ["staff", "admin"].includes(req.user?.role);

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "startTime and endTime are required",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid time range",
      });
    }

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "endTime must be greater than startTime",
      });
    }

    if (!isPrivileged && start < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Cannot check availability for past time slots",
      });
    }

    const roomQuery = buildRoomQuery(req.query, false);

    const conflictingBookings = await Booking.find({
      startTime: { $lt: end },
      endTime: { $gt: start },
      status: { $in: ["pending", "approved", "checked_in", "confirmed"] },
    }).select("roomId");

    const bookedRoomIds = conflictingBookings.map((item) => item.roomId);

    const rooms = await Room.find({
      ...roomQuery,
      _id: { $nin: bookedRoomIds },
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms: rooms.map(normalizeRoom),
      range: {
        startTime: start,
        endTime: end,
      },
    });
  } catch (error) {
    console.error("Get available rooms by time error:", error);
    return res.status(500).json({
      success: false,
      message: "Error suggesting available rooms",
      error: error.message,
    });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const isPrivileged = ["staff", "admin"].includes(req.user?.role);
    if (!isPrivileged && (!room.availability || room.status !== "available")) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    res.status(200).json({
      success: true,
      room: normalizeRoom(room),
    });
  } catch (error) {
    console.error("Get room error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room",
      error: error.message,
    });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      location,
      amenities,
      pricePerHour,
      rules,
      image,
      status,
    } = req.body;

    if (!name || !capacity || !location || pricePerHour === undefined) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const roomStatus =
      status && allowedRoomStatuses.includes(status) ? status : "available";

    const room = await Room.create({
      name,
      description,
      capacity,
      location,
      amenities: Array.isArray(amenities) ? amenities : [],
      pricePerHour,
      rules: Array.isArray(rules) ? rules : [],
      image,
      status: roomStatus,
      availability: roomStatus === "available",
    });

    await logRoomAudit(req, "ROOM_CREATE", {
      roomId: room._id,
      name: room.name,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: normalizeRoom(room),
    });
  } catch (error) {
    console.error("Create room error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating room",
      error: error.message,
    });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const {
      name,
      description,
      capacity,
      location,
      amenities,
      pricePerHour,
      rules,
      image,
      availability,
      status,
    } = req.body;

    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (name !== undefined) room.name = name;
    if (description !== undefined) room.description = description;
    if (capacity !== undefined) room.capacity = capacity;
    if (location !== undefined) room.location = location;
    if (Array.isArray(amenities)) room.amenities = amenities;
    if (pricePerHour !== undefined) room.pricePerHour = pricePerHour;
    if (Array.isArray(rules)) room.rules = rules;
    if (image !== undefined) room.image = image;
    if (availability !== undefined) room.availability = Boolean(availability);
    if (status && allowedRoomStatuses.includes(status)) {
      room.status = status;
      room.availability = status === "available";
    }

    await room.save();

    await logRoomAudit(req, "ROOM_UPDATE", {
      roomId: room._id,
      name: room.name,
    });

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room: normalizeRoom(room),
    });
  } catch (error) {
    console.error("Update room error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating room",
      error: error.message,
    });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    await Room.deleteOne({ _id: req.params.id });
    await TimeSlot.deleteMany({ roomId: req.params.id });

    await logRoomAudit(req, "ROOM_DELETE", {
      roomId: req.params.id,
      name: room.name,
    });

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting room",
      error: error.message,
    });
  }
};

exports.changeRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!allowedRoomStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: available, unavailable, maintenance",
      });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    room.status = status;
    room.availability = status === "available";
    await room.save();

    await logRoomAudit(req, "ROOM_STATUS_CHANGE", {
      roomId: room._id,
      name: room.name,
      status,
    });

    res.status(200).json({
      success: true,
      message: "Room status updated successfully",
      room: normalizeRoom(room),
    });
  } catch (error) {
    console.error("Change room status error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing room status",
      error: error.message,
    });
  }
};

exports.getRoomTimeSlots = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { startDate, endDate } = req.query;
    const isPrivileged = ["staff", "admin"].includes(req.user?.role);

    const timeSlotQuery = { roomId };
    if (!isPrivileged) {
      timeSlotQuery.status = "available";
    }

    if (startDate || endDate) {
      timeSlotQuery.startTime = {};
      if (startDate) timeSlotQuery.startTime.$gte = new Date(startDate);
      if (endDate) timeSlotQuery.startTime.$lte = new Date(endDate);
    }

    if (!isPrivileged) {
      const now = new Date();
      if (!timeSlotQuery.startTime) {
        timeSlotQuery.startTime = { $gte: now };
      } else {
        timeSlotQuery.startTime.$gte = timeSlotQuery.startTime.$gte
          ? new Date(Math.max(timeSlotQuery.startTime.$gte.getTime(), now.getTime()))
          : now;
      }
    }

    const slots = await TimeSlot.find(timeSlotQuery).sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      slots,
    });
  } catch (error) {
    console.error("Get room timeslots error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room timeslots",
      error: error.message,
    });
  }
};

exports.createTimeSlot = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { startTime, endTime, status = "available" } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "startTime and endTime are required",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "endTime must be greater than startTime",
      });
    }

    const operatingHoursError = validateSlotOperatingHours(start, end);
    if (operatingHoursError) {
      return res.status(400).json({
        success: false,
        message: operatingHoursError,
      });
    }

    const conflict = await TimeSlot.findOne({
      roomId,
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Conflicting time slot already exists",
      });
    }

    const slot = await TimeSlot.create({
      roomId,
      startTime: start,
      endTime: end,
      status,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await logRoomAudit(req, "TIMESLOT_CREATE", { roomId, slotId: slot._id });

    res.status(201).json({
      success: true,
      message: "Time slot created successfully",
      slot,
    });
  } catch (error) {
    console.error("Create timeslot error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating timeslot",
      error: error.message,
    });
  }
};

exports.updateTimeSlot = async (req, res) => {
  try {
    const { roomId, slotId } = req.params;
    const { startTime, endTime, status } = req.body;

    const slot = await TimeSlot.findOne({ _id: slotId, roomId });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    const nextStart = startTime ? new Date(startTime) : slot.startTime;
    const nextEnd = endTime ? new Date(endTime) : slot.endTime;

    if (nextEnd <= nextStart) {
      return res.status(400).json({
        success: false,
        message: "endTime must be greater than startTime",
      });
    }

    const operatingHoursError = validateSlotOperatingHours(nextStart, nextEnd);
    if (operatingHoursError) {
      return res.status(400).json({
        success: false,
        message: operatingHoursError,
      });
    }

    const conflict = await TimeSlot.findOne({
      _id: { $ne: slotId },
      roomId,
      $or: [{ startTime: { $lt: nextEnd }, endTime: { $gt: nextStart } }],
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Conflicting time slot already exists",
      });
    }

    slot.startTime = nextStart;
    slot.endTime = nextEnd;
    if (status) slot.status = status;
    slot.updatedBy = req.user._id;

    await slot.save();

    await logRoomAudit(req, "TIMESLOT_UPDATE", { roomId, slotId });

    res.status(200).json({
      success: true,
      message: "Time slot updated successfully",
      slot,
    });
  } catch (error) {
    console.error("Update timeslot error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating timeslot",
      error: error.message,
    });
  }
};

exports.deleteTimeSlot = async (req, res) => {
  try {
    const { roomId, slotId } = req.params;

    const slot = await TimeSlot.findOne({ _id: slotId, roomId });
    if (!slot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    if (slot.status === "booked") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a booked time slot",
      });
    }

    await TimeSlot.deleteOne({ _id: slotId, roomId });

    await logRoomAudit(req, "TIMESLOT_DELETE", { roomId, slotId });

    return res.status(200).json({
      success: true,
      message: "Time slot deleted successfully",
    });
  } catch (error) {
    console.error("Delete timeslot error:", error);
    return res.status(500).json({
      success: false,
      message: "Error deleting timeslot",
      error: error.message,
    });
  }
};

exports.getRoomUsageHistory = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 20, startDate, endDate } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const query = { roomId };
    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }

    const records = await RoomUsageHistory.find(query)
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await RoomUsageHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      pages: Math.ceil(total / limitNumber),
      page: pageNumber,
      records,
    });
  } catch (error) {
    console.error("Get room usage history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room usage history",
      error: error.message,
    });
  }
};

exports.getUsageHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, roomId, startDate, endDate } = req.query;
    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};
    if (roomId) query.roomId = roomId;
    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }

    const records = await RoomUsageHistory.find(query)
      .sort({ checkInTime: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await RoomUsageHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      pages: Math.ceil(total / limitNumber),
      page: pageNumber,
      records,
    });
  } catch (error) {
    console.error("Get usage history error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching usage history",
      error: error.message,
    });
  }
};
