require("dotenv").config();
const { connectDB } = require("../config/db");
const Review = require("../models/Review");
const ReviewModerationLog = require("../models/ReviewModerationLog");
const User = require("../models/User");
const Room = require("../models/Room");
const Booking = require("../models/Booking");

const seedReviewData = async () => {
  try {
    await connectDB();

    const [student, staff, admin] = await Promise.all([
      User.findOne({ role: "user" }),
      User.findOne({ role: "staff" }),
      User.findOne({ role: "admin" }),
    ]);

    if (!student || !staff || !admin) {
      throw new Error(
        "Required users not found. Need at least one user, staff and admin account.",
      );
    }

    const rooms = await Room.find().limit(3);
    if (rooms.length < 2) {
      throw new Error(
        "Need at least 2 rooms in RoomDB before seeding reviews.",
      );
    }

    const booking = await Booking.findOne({ userId: student._id }).sort({
      createdAt: -1,
    });

    await Promise.all([
      ReviewModerationLog.deleteMany({}),
      Review.deleteMany({}),
    ]);

    const [roomA, roomB] = rooms;

    const reviews = await Review.insertMany([
      {
        userId: student._id,
        roomId: roomA._id,
        bookingId: booking ? booking._id : null,
        rating: 5,
        comment: "Excellent room, very quiet and clean.",
        isHidden: false,
        isDeleted: false,
        status: "active",
      },
      {
        userId: student._id,
        roomId: roomB._id,
        bookingId: booking ? booking._id : null,
        rating: 3,
        comment: "Room is okay but projector quality needs improvement.",
        isHidden: true,
        isDeleted: false,
        status: "hidden",
      },
      {
        userId: student._id,
        roomId: roomA._id,
        bookingId: booking ? booking._id : null,
        rating: 1,
        comment: "Air conditioning was not working.",
        isHidden: false,
        isDeleted: true,
        status: "deleted",
      },
      {
        userId: student._id,
        roomId: roomB._id,
        bookingId: booking ? booking._id : null,
        rating: 4,
        comment: "Good environment for group study.",
        isHidden: false,
        isDeleted: false,
        status: "active",
      },
    ]);

    await ReviewModerationLog.insertMany([
      {
        reviewId: reviews[1]._id,
        action: "HIDE",
        actorId: staff._id,
        note: "Temporarily hidden for moderation review",
      },
      {
        reviewId: reviews[2]._id,
        action: "DELETE",
        actorId: admin._id,
        note: "Soft deleted due to policy violation",
      },
    ]);

    console.log("Seeded ReviewDB data successfully");
    process.exit(0);
  } catch (error) {
    console.error("Review seed error:", error.message);
    process.exit(1);
  }
};

seedReviewData();
