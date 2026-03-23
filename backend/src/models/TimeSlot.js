const mongoose = require("mongoose");
const { getRoomConnection } = require("../config/db");

const timeSlotSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "Room",
    },
    startTime: {
      type: Date,
      required: true,
      index: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["available", "booked", "blocked"],
      default: "available",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

timeSlotSchema.index({ roomId: 1, startTime: 1, endTime: 1 }, { unique: true });

const roomConnection = getRoomConnection();

module.exports =
  roomConnection.models.TimeSlot ||
  roomConnection.model("TimeSlot", timeSlotSchema);
