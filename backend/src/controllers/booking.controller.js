const Booking = require("../models/Booking");
const Room = require("../models/Room");

// @route   POST /api/bookings
// @desc    Create a new booking
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const { roomId, startTime, endTime, specialRequests, participants } =
      req.body;

    // Validation
    if (!roomId || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: "End time must be after start time",
      });
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Check for conflicting bookings
    const conflict = await Booking.findOne({
      roomId,
      status: { $in: ["pending", "confirmed"] },
      $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "Room is not available for the selected time slot",
      });
    }

    // Calculate total price
    const hours = (end - start) / (1000 * 60 * 60);
    const totalPrice = hours * room.pricePerHour;

    const booking = await Booking.create({
      userId: req.user._id,
      roomId,
      startTime: start,
      endTime: end,
      totalPrice,
      specialRequests,
      participants: participants || [],
    });

    // Populate room details
    await booking.populate("roomId");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating booking",
      error: error.message,
    });
  }
};

// @route   GET /api/bookings
// @desc    Get user's bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let query = { userId: req.user._id };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("roomId")
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
      bookings,
    });
  } catch (error) {
    console.error("Get user bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching bookings",
      error: error.message,
    });
  }
};

// @route   GET /api/bookings/:id
// @desc    Get booking by ID
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("roomId")
      .populate("userId", "name email");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    if (
      booking.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Get booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching booking",
      error: error.message,
    });
  }
};

// @route   PUT /api/bookings/:id
// @desc    Update booking
// @access  Private
exports.updateBooking = async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    const {
      startTime,
      endTime,
      specialRequests,
      participants,
      status,
      paymentStatus,
    } = req.body;

    // Only allow status/paymentStatus updates for staff/admin
    if (
      (status || paymentStatus) &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update booking status",
      });
    }

    if (startTime || endTime) {
      const start = new Date(startTime || booking.startTime);
      const end = new Date(endTime || booking.endTime);

      if (end <= start) {
        return res.status(400).json({
          success: false,
          message: "End time must be after start time",
        });
      }

      // Check for conflicting bookings
      const conflict = await Booking.findOne({
        roomId: booking.roomId,
        _id: { $ne: booking._id },
        status: { $in: ["pending", "confirmed"] },
        $or: [{ startTime: { $lt: end }, endTime: { $gt: start } }],
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: "Room is not available for the selected time slot",
        });
      }

      booking.startTime = start;
      booking.endTime = end;

      // Recalculate price
      const room = await Room.findById(booking.roomId);
      const hours = (end - start) / (1000 * 60 * 60);
      booking.totalPrice = hours * room.pricePerHour;
    }

    if (specialRequests !== undefined)
      booking.specialRequests = specialRequests;
    if (participants) booking.participants = participants;
    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();
    await booking.populate("roomId");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Update booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating booking",
      error: error.message,
    });
  }
};

// @route   DELETE /api/bookings/:id
// @desc    Cancel booking
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check authorization
    if (
      booking.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin" &&
      req.user.role !== "staff"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this booking",
      });
    }

    // Can't cancel already completed or cancelled bookings
    if (booking.status === "completed" || booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a ${booking.status} booking`,
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel booking error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling booking",
      error: error.message,
    });
  }
};

// @route   GET /api/bookings/room/:roomId
// @desc    Get bookings for a specific room (Admin/Staff)
// @access  Private
exports.getRoomBookings = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { roomId: req.params.roomId };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate)
        query.startTime.$lte = new Date(
          new Date(endDate).getTime() + 24 * 60 * 60 * 1000,
        );
    }

    const bookings = await Booking.find(query)
      .populate("userId", "name email")
      .sort({ startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / limit),
      page: parseInt(page),
      bookings,
    });
  } catch (error) {
    console.error("Get room bookings error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching room bookings",
      error: error.message,
    });
  }
};
