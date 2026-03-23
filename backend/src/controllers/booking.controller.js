const Booking = require("../models/Booking");
const BookingEvidence = require("../models/BookingEvidence");
const BookingStatusHistory = require("../models/BookingStatusHistory");
const Room = require("../models/Room");
const TimeSlot = require("../models/TimeSlot");
const RoomUsageHistory = require("../models/RoomUsageHistory");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { getIpAddress, getUserAgent } = require("../utils/helpers");

const BOOKING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  CANCELLED: "cancelled",
  CONFIRMED_LEGACY: "confirmed",
  COMPLETED_LEGACY: "completed",
};

const MAX_EXTEND_MINUTES = 120;
const MAX_EXTEND_COUNT = 2;
const MAX_EVIDENCE_SIZE = 10 * 1024 * 1024;

const normalizeBookingStatus = (status) => {
  if (status === BOOKING_STATUS.CONFIRMED_LEGACY) {
    return BOOKING_STATUS.APPROVED;
  }

  if (status === BOOKING_STATUS.COMPLETED_LEGACY) {
    return BOOKING_STATUS.CHECKED_OUT;
  }

  return status;
};

const toPagination = (query) => {
  const page = Math.max(parseInt(query.page || 1, 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || 10, 10), 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const buildErrorResponse = (res, status, message, error) =>
  res.status(status).json({
    success: false,
    message,
    ...(error ? { error } : {}),
  });

const logAudit = async (req, action, metadata = {}) => {
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
    console.error("Booking audit log error:", error.message);
  }
};

const addStatusHistory = async (
  bookingId,
  fromStatus,
  toStatus,
  actorId,
  action,
  note,
) => {
  await BookingStatusHistory.create({
    bookingId,
    fromStatus,
    toStatus,
    actorId,
    action,
    note,
  });
};

const normalizeObjectId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const isOwner = (booking, user) =>
  normalizeObjectId(booking.userId) ===
  normalizeObjectId(user?._id || user?.id);

const assertCanTransition = (currentStatus, nextStatus) => {
  const current = normalizeBookingStatus(currentStatus);

  const transitions = {
    [BOOKING_STATUS.PENDING]: [
      BOOKING_STATUS.APPROVED,
      BOOKING_STATUS.REJECTED,
      BOOKING_STATUS.CANCELLED,
    ],
    [BOOKING_STATUS.APPROVED]: [
      BOOKING_STATUS.CHECKED_IN,
      BOOKING_STATUS.CANCELLED,
    ],
    [BOOKING_STATUS.CHECKED_IN]: [
      BOOKING_STATUS.CHECKED_OUT,
      BOOKING_STATUS.CANCELLED,
    ],
  };

  return (transitions[current] || []).includes(nextStatus);
};

const checkBookingTimeConflict = async ({
  roomId,
  startTime,
  endTime,
  excludeBookingId,
}) => {
  const query = {
    roomId,
    $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    status: {
      $in: [
        BOOKING_STATUS.PENDING,
        BOOKING_STATUS.APPROVED,
        BOOKING_STATUS.CHECKED_IN,
        BOOKING_STATUS.CONFIRMED_LEGACY,
      ],
    },
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  return Booking.findOne(query);
};

const syncTimeSlotStatusForBooking = async ({ booking, status, actorId }) => {
  const slot = await TimeSlot.findOne({
    roomId: booking.roomId,
    startTime: new Date(booking.startTime),
    endTime: new Date(booking.endTime),
  });

  if (!slot) {
    return;
  }

  slot.status = status;
  if (actorId) {
    slot.updatedBy = actorId;
  }

  await slot.save();
};

const createOrUpdateUsageHistory = async (booking) => {
  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const durationMinutes = Math.max(
    0,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60)),
  );

  const normalizedStatus = normalizeBookingStatus(booking.status);

  await RoomUsageHistory.findOneAndUpdate(
    { bookingId: booking._id },
    {
      $set: {
        roomId: booking.roomId,
        bookingId: booking._id,
        userId: booking.userId,
        checkInTime: booking.checkInTime || start,
        checkOutTime:
          booking.checkOutTime ||
          (normalizedStatus === BOOKING_STATUS.CHECKED_OUT ? end : undefined),
        durationMinutes,
        status:
          normalizedStatus === BOOKING_STATUS.CANCELLED
            ? "cancelled"
            : normalizedStatus === BOOKING_STATUS.CHECKED_IN
              ? "active"
              : "completed",
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
};

const toBookingResponse = async (bookingDoc) => {
  const booking = await Booking.findById(bookingDoc._id)
    .populate({ path: "roomId", model: Room })
    .populate({ path: "userId", model: User, select: "name email role" });

  return booking;
};

const createBookingCore = async ({ req, isGroupBooking }) => {
  const {
    roomId,
    startTime,
    endTime,
    specialRequests,
    participants = [],
  } = req.body;

  if (!roomId || !startTime || !endTime) {
    return {
      error: {
        status: 400,
        message: "roomId, startTime and endTime are required",
      },
    };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  const now = new Date();

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return { error: { status: 400, message: "Invalid booking time range" } };
  }

  if (start < now) {
    return {
      error: {
        status: 400,
        message: "Cannot create booking for past time slots",
      },
    };
  }

  const room = await Room.findById(roomId);
  if (!room) {
    return { error: { status: 404, message: "Room not found" } };
  }

  const matchingSlot = await TimeSlot.findOne({
    roomId,
    startTime: start,
    endTime: end,
  });

  if (!matchingSlot) {
    return {
      error: {
        status: 400,
        message: "Selected time slot is not configured by admin",
      },
    };
  }

  if (matchingSlot.status !== "available") {
    return {
      error: {
        status: 400,
        message: "Selected time slot is not available",
      },
    };
  }

  const conflict = await checkBookingTimeConflict({
    roomId,
    startTime: start,
    endTime: end,
  });
  if (conflict) {
    return {
      error: {
        status: 400,
        message: "Room is not available for selected time",
      },
    };
  }

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const totalPrice = Math.max(0, durationHours * room.pricePerHour);

  const booking = await Booking.create({
    userId: req.user._id,
    roomId,
    startTime: start,
    endTime: end,
    status: BOOKING_STATUS.PENDING,
    totalPrice,
    specialRequests,
    participants,
    groupBooking: isGroupBooking,
  });

  matchingSlot.status = "booked";
  matchingSlot.updatedBy = req.user._id;
  await matchingSlot.save();

  await addStatusHistory(
    booking._id,
    null,
    BOOKING_STATUS.PENDING,
    req.user._id,
    isGroupBooking ? "GROUP_BOOKING_CREATE" : "BOOKING_CREATE",
  );

  await logAudit(req, "BOOKING_CREATE", {
    bookingId: booking._id,
    roomId,
    groupBooking: isGroupBooking,
    participantsCount: participants.length,
  });

  return { booking: await toBookingResponse(booking) };
};

exports.createBooking = async (req, res) => {
  try {
    const result = await createBookingCore({ req, isGroupBooking: false });
    if (result.error) {
      return buildErrorResponse(res, result.error.status, result.error.message);
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: result.booking,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error creating booking",
      error.message,
    );
  }
};

exports.createGroupBooking = async (req, res) => {
  try {
    const participants = req.body.participants || [];

    if (!Array.isArray(participants) || participants.length < 2) {
      return buildErrorResponse(
        res,
        400,
        "Group booking requires at least 2 participants",
      );
    }

    const result = await createBookingCore({ req, isGroupBooking: true });
    if (result.error) {
      return buildErrorResponse(res, result.error.status, result.error.message);
    }

    return res.status(201).json({
      success: true,
      message: "Group booking created successfully",
      booking: result.booking,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error creating group booking",
      error.message,
    );
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = toPagination(req.query);

    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate({ path: "roomId", model: Room })
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      page,
      bookings,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching bookings",
      error.message,
    );
  }
};

exports.getStudentBookingHistory = async (req, res) =>
  exports.getUserBookings(req, res);

exports.getManagementBookings = async (req, res) => {
  try {
    const { status, roomId, userId } = req.query;
    const { page, limit, skip } = toPagination(req.query);

    const query = {};
    if (status) {
      query.status = status;
    }

    if (roomId) {
      query.roomId = roomId;
    }

    if (userId) {
      query.userId = userId;
    }

    const bookings = await Booking.find(query)
      .populate({ path: "roomId", model: Room })
      .populate({ path: "userId", model: User, select: "name email role" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      page,
      bookings,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching booking management data",
      error.message,
    );
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate({ path: "roomId", model: Room })
      .populate({ path: "userId", model: User, select: "name email role" });

    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (
      !isOwner(booking, req.user) &&
      !["admin", "staff"].includes(req.user.role)
    ) {
      return buildErrorResponse(
        res,
        403,
        "Not authorized to view this booking",
      );
    }

    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching booking",
      error.message,
    );
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (
      !isOwner(booking, req.user) &&
      !["admin", "staff"].includes(req.user.role)
    ) {
      return buildErrorResponse(
        res,
        403,
        "Not authorized to update this booking",
      );
    }

    const currentStatus = normalizeBookingStatus(booking.status);
    if (
      [
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.REJECTED,
        BOOKING_STATUS.CHECKED_OUT,
      ].includes(currentStatus)
    ) {
      return buildErrorResponse(res, 400, "Booking can no longer be updated");
    }

    const { startTime, endTime, specialRequests, participants } = req.body;

    if (startTime || endTime) {
      const start = new Date(startTime || booking.startTime);
      const end = new Date(endTime || booking.endTime);

      if (
        Number.isNaN(start.getTime()) ||
        Number.isNaN(end.getTime()) ||
        end <= start
      ) {
        return buildErrorResponse(res, 400, "Invalid booking time range");
      }

      const conflict = await checkBookingTimeConflict({
        roomId: booking.roomId,
        startTime: start,
        endTime: end,
        excludeBookingId: booking._id,
      });

      if (conflict) {
        return buildErrorResponse(
          res,
          400,
          "Room is not available for selected time",
        );
      }

      booking.startTime = start;
      booking.endTime = end;

      const room = await Room.findById(booking.roomId);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      booking.totalPrice = Math.max(0, hours * room.pricePerHour);
    }

    if (specialRequests !== undefined) {
      booking.specialRequests = specialRequests;
    }

    if (participants && Array.isArray(participants)) {
      booking.participants = participants;
      booking.groupBooking = participants.length > 1;
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: await toBookingResponse(booking),
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error updating booking",
      error.message,
    );
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    const owner = isOwner(booking, req.user);
    const adminOverride = req.user.role === "admin";

    if (!owner && !adminOverride) {
      return buildErrorResponse(
        res,
        403,
        "Not authorized to cancel this booking",
      );
    }

    const currentStatus = normalizeBookingStatus(booking.status);
    if (
      [
        BOOKING_STATUS.REJECTED,
        BOOKING_STATUS.CANCELLED,
        BOOKING_STATUS.CHECKED_OUT,
      ].includes(currentStatus)
    ) {
      return buildErrorResponse(
        res,
        400,
        `Cannot cancel a ${currentStatus} booking`,
      );
    }

    if (
      !assertCanTransition(booking.status, BOOKING_STATUS.CANCELLED) &&
      currentStatus !== BOOKING_STATUS.PENDING
    ) {
      return buildErrorResponse(
        res,
        400,
        `Invalid status transition from ${currentStatus}`,
      );
    }

    const previousStatus = booking.status;
    booking.status = BOOKING_STATUS.CANCELLED;
    booking.cancelledBy = req.user._id;
    booking.cancellationReason =
      req.body.reason || (adminOverride ? "admin override" : "user cancel");
    await booking.save();
    await syncTimeSlotStatusForBooking({
      booking,
      status: "available",
      actorId: req.user._id,
    });

    await createOrUpdateUsageHistory(booking);
    await addStatusHistory(
      booking._id,
      previousStatus,
      BOOKING_STATUS.CANCELLED,
      req.user._id,
      adminOverride ? "BOOKING_FORCE_CANCEL" : "BOOKING_CANCEL",
      booking.cancellationReason,
    );

    await logAudit(
      req,
      adminOverride ? "BOOKING_FORCE_CANCEL" : "BOOKING_CANCEL",
      {
        bookingId: booking._id,
        previousStatus,
        reason: booking.cancellationReason,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking: await toBookingResponse(booking),
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error cancelling booking",
      error.message,
    );
  }
};

exports.forceCancelBooking = async (req, res) => {
  req.body.reason = req.body.reason || "admin force cancel";
  return exports.cancelBooking(req, res);
};

exports.checkInBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (!isOwner(booking, req.user)) {
      return buildErrorResponse(
        res,
        403,
        "You can only check-in your own booking",
      );
    }

    const currentStatus = normalizeBookingStatus(booking.status);
    if (![BOOKING_STATUS.APPROVED].includes(currentStatus)) {
      return buildErrorResponse(
        res,
        400,
        `Cannot check-in from status ${currentStatus}`,
      );
    }

    const now = new Date();
    const startWindow = new Date(
      new Date(booking.startTime).getTime() - 30 * 60 * 1000,
    );

    if (now < startWindow) {
      return buildErrorResponse(
        res,
        400,
        "Check-in is only allowed 30 minutes before start time or later",
      );
    }

    const previousStatus = booking.status;
    booking.status = BOOKING_STATUS.CHECKED_IN;
    booking.checkInTime = now;
    await booking.save();

    await createOrUpdateUsageHistory(booking);
    await addStatusHistory(
      booking._id,
      previousStatus,
      BOOKING_STATUS.CHECKED_IN,
      req.user._id,
      "BOOKING_CHECK_IN",
    );

    await logAudit(req, "BOOKING_CHECK_IN", {
      bookingId: booking._id,
      previousStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Check-in successful",
      booking: await toBookingResponse(booking),
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error checking in booking",
      error.message,
    );
  }
};

exports.checkOutBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (!isOwner(booking, req.user)) {
      return buildErrorResponse(
        res,
        403,
        "You can only check-out your own booking",
      );
    }

    const currentStatus = normalizeBookingStatus(booking.status);
    if (currentStatus !== BOOKING_STATUS.CHECKED_IN) {
      return buildErrorResponse(
        res,
        400,
        `Cannot check-out from status ${currentStatus}`,
      );
    }

    const userEvidence = await BookingEvidence.findOne({
      bookingId: booking._id,
      uploadedBy: req.user._id,
    });

    if (!userEvidence) {
      return buildErrorResponse(
        res,
        400,
        "Please upload usage evidence before check-out",
      );
    }

    const previousStatus = booking.status;
    booking.status = BOOKING_STATUS.CHECKED_OUT;
    booking.checkOutTime = new Date();
    await booking.save();

    await createOrUpdateUsageHistory(booking);
    await addStatusHistory(
      booking._id,
      previousStatus,
      BOOKING_STATUS.CHECKED_OUT,
      req.user._id,
      "BOOKING_CHECK_OUT",
    );

    await logAudit(req, "BOOKING_CHECK_OUT", {
      bookingId: booking._id,
      previousStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Check-out successful",
      booking: await toBookingResponse(booking),
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error checking out booking",
      error.message,
    );
  }
};

exports.extendBookingTime = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (!isOwner(booking, req.user)) {
      return buildErrorResponse(
        res,
        403,
        "You can only extend your own booking",
      );
    }

    const currentStatus = normalizeBookingStatus(booking.status);
    if (
      ![BOOKING_STATUS.APPROVED, BOOKING_STATUS.CHECKED_IN].includes(
        currentStatus,
      )
    ) {
      return buildErrorResponse(
        res,
        400,
        `Cannot extend booking in status ${currentStatus}`,
      );
    }

    const extendMinutes = parseInt(req.body.extendMinutes, 10);
    if (!Number.isInteger(extendMinutes) || extendMinutes <= 0) {
      return buildErrorResponse(
        res,
        400,
        "extendMinutes must be a positive integer",
      );
    }

    if (extendMinutes > MAX_EXTEND_MINUTES) {
      return buildErrorResponse(
        res,
        400,
        `Cannot extend more than ${MAX_EXTEND_MINUTES} minutes per request`,
      );
    }

    if (booking.extendCount >= MAX_EXTEND_COUNT) {
      return buildErrorResponse(
        res,
        400,
        `Maximum extend count reached (${MAX_EXTEND_COUNT})`,
      );
    }

    const newEndTime = new Date(
      new Date(booking.endTime).getTime() + extendMinutes * 60 * 1000,
    );

    const conflict = await checkBookingTimeConflict({
      roomId: booking.roomId,
      startTime: new Date(booking.endTime),
      endTime: newEndTime,
      excludeBookingId: booking._id,
    });

    if (conflict) {
      return buildErrorResponse(
        res,
        400,
        "Cannot extend due to booking conflict",
      );
    }

    const room = await Room.findById(booking.roomId);
    const previousStatus = booking.status;

    booking.endTime = newEndTime;
    booking.extendCount += 1;
    booking.extendedMinutes += extendMinutes;

    const hours =
      (newEndTime.getTime() - new Date(booking.startTime).getTime()) /
      (1000 * 60 * 60);
    booking.totalPrice = Math.max(0, hours * room.pricePerHour);

    await booking.save();

    await addStatusHistory(
      booking._id,
      previousStatus,
      booking.status,
      req.user._id,
      "BOOKING_EXTEND",
      `extended ${extendMinutes} minutes`,
    );

    await logAudit(req, "BOOKING_EXTEND", {
      bookingId: booking._id,
      extendMinutes,
      newEndTime,
      previousStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Booking extended successfully",
      booking: await toBookingResponse(booking),
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error extending booking",
      error.message,
    );
  }
};

exports.uploadUsageEvidence = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (!isOwner(booking, req.user)) {
      return buildErrorResponse(
        res,
        403,
        "You can only upload evidence for your booking",
      );
    }

    const currentStatus = normalizeBookingStatus(booking.status);
    if (
      ![BOOKING_STATUS.CHECKED_IN, BOOKING_STATUS.CHECKED_OUT].includes(
        currentStatus,
      )
    ) {
      return buildErrorResponse(
        res,
        400,
        `Evidence upload is not allowed in status ${currentStatus}`,
      );
    }

    const { url, type, size } = req.body;
    if (!url || !type || !size) {
      return buildErrorResponse(res, 400, "url, type and size are required");
    }

    if (!["image", "video", "document"].includes(type)) {
      return buildErrorResponse(res, 400, "Invalid evidence type");
    }

    const numericSize = Number(size);
    if (
      Number.isNaN(numericSize) ||
      numericSize <= 0 ||
      numericSize > MAX_EVIDENCE_SIZE
    ) {
      return buildErrorResponse(
        res,
        400,
        `Evidence size must be > 0 and <= ${MAX_EVIDENCE_SIZE}`,
      );
    }

    const evidence = await BookingEvidence.create({
      bookingId: booking._id,
      uploadedBy: req.user._id,
      url,
      type,
      size: numericSize,
      status: "pending",
    });

    booking.evidenceStatus = "pending";
    await booking.save();

    await logAudit(req, "BOOKING_EVIDENCE_UPLOAD", {
      bookingId: booking._id,
      evidenceId: evidence._id,
      type,
      size: numericSize,
    });

    return res.status(201).json({
      success: true,
      message: "Evidence uploaded successfully",
      data: evidence,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error uploading evidence",
      error.message,
    );
  }
};

exports.getPendingBookingsForReview = async (req, res) => {
  try {
    const { page, limit, skip } = toPagination(req.query);

    const query = {
      status: { $in: [BOOKING_STATUS.PENDING] },
    };

    const bookings = await Booking.find(query)
      .populate({ path: "roomId", model: Room })
      .populate({ path: "userId", model: User, select: "name email" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching pending bookings",
      error.message,
    );
  }
};

exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (!assertCanTransition(booking.status, BOOKING_STATUS.APPROVED)) {
      return buildErrorResponse(
        res,
        400,
        `Cannot approve booking in status ${normalizeBookingStatus(booking.status)}`,
      );
    }

    const previousStatus = booking.status;
    booking.status = BOOKING_STATUS.APPROVED;
    booking.approvedBy = req.user._id;
    booking.rejectedBy = null;
    booking.rejectionReason = null;
    await booking.save();

    await addStatusHistory(
      booking._id,
      previousStatus,
      BOOKING_STATUS.APPROVED,
      req.user._id,
      "BOOKING_APPROVE",
    );

    await logAudit(req, "BOOKING_APPROVE", {
      bookingId: booking._id,
      previousStatus,
    });

    return res.status(200).json({
      success: true,
      message: "Booking approved",
      booking: await toBookingResponse(booking),
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error approving booking",
      error.message,
    );
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (!assertCanTransition(booking.status, BOOKING_STATUS.REJECTED)) {
      return buildErrorResponse(
        res,
        400,
        `Cannot reject booking in status ${normalizeBookingStatus(booking.status)}`,
      );
    }

    const reason = req.body.reason || "Rejected by reviewer";
    const previousStatus = booking.status;

    booking.status = BOOKING_STATUS.REJECTED;
    booking.rejectedBy = req.user._id;
    booking.rejectionReason = reason;
    await booking.save();
    await syncTimeSlotStatusForBooking({
      booking,
      status: "available",
      actorId: req.user._id,
    });

    await addStatusHistory(
      booking._id,
      previousStatus,
      BOOKING_STATUS.REJECTED,
      req.user._id,
      "BOOKING_REJECT",
      reason,
    );

    await logAudit(req, "BOOKING_REJECT", {
      bookingId: booking._id,
      previousStatus,
      reason,
    });

    return res.status(200).json({
      success: true,
      message: "Booking rejected",
      booking: await toBookingResponse(booking),
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error rejecting booking",
      error.message,
    );
  }
};

exports.getPendingEvidence = async (req, res) => {
  try {
    const { page, limit, skip } = toPagination(req.query);

    const { status = "pending" } = req.query;
    const query = {};

    if (status !== "all") {
      query.status = status;
    }

    const evidence = await BookingEvidence.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const bookingIds = evidence.map((item) => item.bookingId);
    const userIds = evidence.map((item) => item.uploadedBy);

    const [bookings, users] = await Promise.all([
      Booking.find({ _id: { $in: bookingIds } }).populate({
        path: "roomId",
        model: Room,
      }),
      User.find({ _id: { $in: userIds } }).select("name email"),
    ]);

    const bookingMap = new Map(
      bookings.map((item) => [item._id.toString(), item]),
    );
    const userMap = new Map(users.map((item) => [item._id.toString(), item]));

    const data = evidence.map((item) => ({
      ...item.toObject(),
      booking: bookingMap.get(item.bookingId.toString()) || null,
      uploadedByUser: userMap.get(item.uploadedBy.toString()) || null,
    }));

    const total = await BookingEvidence.countDocuments(query);

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching pending evidence",
      error.message,
    );
  }
};

exports.reviewEvidence = async (req, res) => {
  try {
    const { status, note } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return buildErrorResponse(
        res,
        400,
        "status must be approved or rejected",
      );
    }

    const evidence = await BookingEvidence.findById(req.params.evidenceId);
    if (!evidence) {
      return buildErrorResponse(res, 404, "Evidence not found");
    }

    if (evidence.status !== "pending") {
      return buildErrorResponse(res, 400, "Evidence has already been reviewed");
    }

    evidence.status = status;
    evidence.reviewedBy = req.user._id;
    evidence.reviewedAt = new Date();
    evidence.reviewNote = note || "";
    await evidence.save();

    await Booking.findByIdAndUpdate(evidence.bookingId, {
      evidenceStatus: status,
    });

    await logAudit(req, "BOOKING_EVIDENCE_REVIEW", {
      evidenceId: evidence._id,
      bookingId: evidence.bookingId,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Evidence reviewed successfully",
      data: evidence,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error reviewing evidence",
      error.message,
    );
  }
};

exports.getRoomBookings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { page, limit, skip } = toPagination(req.query);

    const query = { roomId: req.params.roomId };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(
          new Date(endDate).getTime() + 24 * 60 * 60 * 1000,
        );
      }
    }

    const bookings = await Booking.find(query)
      .populate({ path: "userId", model: User, select: "name email" })
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      page,
      bookings,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching room bookings",
      error.message,
    );
  }
};
