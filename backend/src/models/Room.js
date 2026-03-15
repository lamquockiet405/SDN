const mongoose = require("mongoose");

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
    rules: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Room", roomSchema);
