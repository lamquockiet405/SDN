const mongoose = require("mongoose");
const { getRoomConnection } = require("../config/db");

const roomUsageHistorySchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      index: true,
    },
    checkOutTime: {
      type: Date,
    },
    durationMinutes: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "completed",
      index: true,
    },
  },
  { timestamps: true },
);

roomUsageHistorySchema.index({ roomId: 1, checkInTime: -1 });
roomUsageHistorySchema.index({ userId: 1, checkInTime: -1 });

const roomConnection = getRoomConnection();

module.exports =
  roomConnection.models.RoomUsageHistory ||
  roomConnection.model("RoomUsageHistory", roomUsageHistorySchema);
