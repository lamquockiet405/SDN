const mongoose = require("mongoose");
const { getBookingConnection } = require("../config/db");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "checked_in",
        "checked_out",
        "cancelled",
        "confirmed",
        "completed",
      ],
      default: "pending",
      index: true,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    specialRequests: String,
    participants: [
      {
        type: String,
      },
    ],
    groupBooking: {
      type: Boolean,
      default: false,
    },
    checkInTime: Date,
    checkOutTime: Date,
    extendedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    extendCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    evidenceStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      index: true,
    },
    notes: String,
  },
  { timestamps: true },
);

// Index for efficient searching
bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ roomId: 1 });
bookingSchema.index({ startTime: 1, endTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ userId: 1, status: 1, createdAt: -1 });
bookingSchema.index({ status: 1, startTime: 1 });

const bookingConnection = getBookingConnection();

module.exports =
  bookingConnection.models.Booking ||
  bookingConnection.model("Booking", bookingSchema);
