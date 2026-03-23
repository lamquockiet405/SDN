const mongoose = require("mongoose");
const { getUserConnection } = require("../config/db");

const violationSchema = new mongoose.Schema(
  {
    authUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "resolved"],
      default: "active",
      index: true,
    },
    violationType: {
      type: String,
      enum: ["manual", "no_show"],
      default: "manual",
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true },
);

violationSchema.index({ authUserId: 1, createdAt: -1 });
violationSchema.index({ violationType: 1, bookingId: 1 });

const userConnection = getUserConnection();

module.exports =
  userConnection.models.Violation ||
  userConnection.model("Violation", violationSchema);
