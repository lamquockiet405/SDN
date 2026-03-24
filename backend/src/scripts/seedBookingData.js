require("dotenv").config();
const { connectDB } = require("../config/db");
const Booking = require("../models/Booking");
const BookingEvidence = require("../models/BookingEvidence");
const BookingStatusHistory = require("../models/BookingStatusHistory");
const Room = require("../models/Room");
const User = require("../models/User");

const seedBookingData = async () => {
  try {
    await connectDB();

    const [student, staff, admin] = await Promise.all([
      User.findOne({ role: "user" }),
      User.findOne({ role: "staff" }),
      User.findOne({ role: "admin" }),
    ]);

    if (!student || !staff || !admin) {
      throw new Error(
        "Required users not found. Please ensure at least one user, staff, and admin account exist.",
      );
    }

    const rooms = await Room.find().limit(3);
    if (rooms.length < 2) {
      throw new Error(
        "At least 2 rooms are required in RoomDB before seeding bookings.",
      );
    }

    await Promise.all([
      BookingEvidence.deleteMany({}),
      BookingStatusHistory.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const inTwoHours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const inThreeHours = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayPlus2 = new Date(yesterday.getTime() + 2 * 60 * 60 * 1000);

    const [roomA, roomB] = rooms;

    const bookings = await Booking.insertMany([
      {
        userId: student._id,
        roomId: roomA._id,
        startTime: inOneHour,
        endTime: inTwoHours,
        status: "pending",
        totalPrice: roomA.pricePerHour,
        participants: [],
        groupBooking: false,
      },
      {
        userId: student._id,
        roomId: roomB._id,
        startTime: inTwoHours,
        endTime: inThreeHours,
        status: "approved",
        totalPrice: roomB.pricePerHour,
        participants: ["Student B", "Student C"],
        groupBooking: true,
        approvedBy: staff._id,
      },
      {
        userId: student._id,
        roomId: roomA._id,
        startTime: yesterday,
        endTime: yesterdayPlus2,
        status: "checked_out",
        totalPrice: roomA.pricePerHour * 2,
        checkInTime: new Date(yesterday.getTime() + 5 * 60 * 1000),
        checkOutTime: yesterdayPlus2,
        evidenceStatus: "pending",
      },
      {
        userId: student._id,
        roomId: roomB._id,
        startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        status: "cancelled",
        totalPrice: roomB.pricePerHour * 2,
        cancelledBy: admin._id,
        cancellationReason: "Policy violation",
      },
    ]);

    const [pendingBooking, approvedGroupBooking, checkedOutBooking] = bookings;

    await BookingStatusHistory.insertMany([
      {
        bookingId: pendingBooking._id,
        fromStatus: null,
        toStatus: "pending",
        action: "BOOKING_CREATE",
        actorId: student._id,
      },
      {
        bookingId: approvedGroupBooking._id,
        fromStatus: null,
        toStatus: "pending",
        action: "GROUP_BOOKING_CREATE",
        actorId: student._id,
      },
      {
        bookingId: approvedGroupBooking._id,
        fromStatus: "pending",
        toStatus: "approved",
        action: "BOOKING_APPROVE",
        actorId: staff._id,
      },
      {
        bookingId: checkedOutBooking._id,
        fromStatus: null,
        toStatus: "pending",
        action: "BOOKING_CREATE",
        actorId: student._id,
      },
      {
        bookingId: checkedOutBooking._id,
        fromStatus: "pending",
        toStatus: "approved",
        action: "BOOKING_APPROVE",
        actorId: staff._id,
      },
      {
        bookingId: checkedOutBooking._id,
        fromStatus: "approved",
        toStatus: "checked_in",
        action: "BOOKING_CHECK_IN",
        actorId: student._id,
      },
      {
        bookingId: checkedOutBooking._id,
        fromStatus: "checked_in",
        toStatus: "checked_out",
        action: "BOOKING_CHECK_OUT",
        actorId: student._id,
      },
    ]);

    await BookingEvidence.insertMany([
      {
        bookingId: checkedOutBooking._id,
        uploadedBy: student._id,
        url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800",
        type: "image",
        size: 180000,
        status: "pending",
      },
      {
        bookingId: checkedOutBooking._id,
        uploadedBy: student._id,
        url: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800",
        type: "image",
        size: 200000,
        status: "approved",
        reviewedBy: staff._id,
        reviewedAt: new Date(),
        reviewNote: "Evidence is valid",
      },
    ]);

    console.log("Seeded BookingDB data successfully");
    process.exit(0);
  } catch (error) {
    console.error("Booking seed error:", error.message);
    process.exit(1);
  }
};

seedBookingData();
