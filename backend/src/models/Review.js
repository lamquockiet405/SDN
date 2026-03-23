const mongoose = require("mongoose");
const { getReviewConnection } = require("../config/db");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      index: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "hidden", "deleted", "flagged"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);

reviewSchema.index({ roomId: 1, createdAt: -1 });
reviewSchema.index({ isHidden: 1, isDeleted: 1, createdAt: -1 });

const reviewConnection = getReviewConnection();

module.exports =
  reviewConnection.models.Review ||
  reviewConnection.model("Review", reviewSchema);
