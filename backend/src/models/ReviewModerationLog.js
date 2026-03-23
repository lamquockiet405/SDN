const mongoose = require("mongoose");
const { getReviewConnection } = require("../config/db");

const reviewModerationLogSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: ["HIDE", "UNHIDE", "DELETE"],
      required: true,
      index: true,
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
      maxlength: 300,
    },
  },
  { timestamps: true },
);

reviewModerationLogSchema.index({ reviewId: 1, createdAt: -1 });

const reviewConnection = getReviewConnection();

module.exports =
  reviewConnection.models.ReviewModerationLog ||
  reviewConnection.model("ReviewModerationLog", reviewModerationLogSchema);
