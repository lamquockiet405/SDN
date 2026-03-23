const mongoose = require("mongoose");
const { getUserConnection } = require("../config/db");

const userProfileSchema = new mongoose.Schema(
  {
    authUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user",
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "locked"],
      default: "active",
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    department: {
      type: String,
      trim: true,
      default: "",
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true },
);

userProfileSchema.index({ role: 1, status: 1, createdAt: -1 });

const userConnection = getUserConnection();

module.exports =
  userConnection.models.UserProfile ||
  userConnection.model("UserProfile", userProfileSchema);
