const mongoose = require("mongoose");
const { getBookingConnection } = require("../config/db");

const bookingEvidenceSchema = new mongoose.Schema(
  {
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "document"],
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: Date,
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

bookingEvidenceSchema.index({ status: 1, createdAt: -1 });

const bookingConnection = getBookingConnection();

module.exports =
  bookingConnection.models.BookingEvidence ||
  bookingConnection.model("BookingEvidence", bookingEvidenceSchema);
