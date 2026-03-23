const mongoose = require("mongoose");
const { getBookingConnection } = require("../config/db");

const bookingStatusHistorySchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    fromStatus: {
      type: String,
      default: null,
    },
    toStatus: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

bookingStatusHistorySchema.index({ bookingId: 1, createdAt: -1 });

const bookingConnection = getBookingConnection();

module.exports =
  bookingConnection.models.BookingStatusHistory ||
  bookingConnection.model("BookingStatusHistory", bookingStatusHistorySchema);
