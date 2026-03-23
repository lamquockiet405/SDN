const mongoose = require("mongoose");
const { getRoomConnection } = require("../config/db");

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: 1,
    },
    location: {
      type: String,
      required: true,
    },
    amenities: [
      {
        type: String,
      },
    ],
    image: String,
    pricePerHour: {
      type: Number,
      required: true,
      min: 0,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["available", "unavailable", "maintenance"],
      default: "available",
      index: true,
    },
    rules: [String],
  },
  { timestamps: true },
);

roomSchema.index({ name: 1 });
roomSchema.index({ location: 1 });
roomSchema.index({ capacity: 1 });
roomSchema.index({ pricePerHour: 1 });
roomSchema.index({ status: 1, availability: 1 });

const roomConnection = getRoomConnection();

module.exports =
  roomConnection.models.Room || roomConnection.model("Room", roomSchema);
