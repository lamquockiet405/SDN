require("dotenv").config();
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Room = require("../models/Room");
const TimeSlot = require("../models/TimeSlot");
const RoomUsageHistory = require("../models/RoomUsageHistory");
const User = require("../models/User");

const seed = async () => {
  try {
    await connectDB();

    const adminOrStaff = await User.findOne({
      role: { $in: ["admin", "staff"] },
    });
    if (!adminOrStaff) {
      throw new Error(
        "No admin/staff user found in AuthDB. Please create one before seeding rooms.",
      );
    }

    await Promise.all([
      Room.deleteMany({}),
      TimeSlot.deleteMany({}),
      RoomUsageHistory.deleteMany({}),
    ]);

    const rooms = await Room.insertMany([
      {
        name: "Study Room A",
        description: "Quiet room for individual study sessions",
        capacity: 6,
        location: "Building A - Floor 2",
        amenities: ["Projector", "Whiteboard", "WiFi"],
        pricePerHour: 20,
        rules: ["Keep silence", "No food"],
        status: "available",
        availability: true,
      },
      {
        name: "Meeting Room B",
        description: "Room for team discussions and workshops",
        capacity: 12,
        location: "Building B - Floor 1",
        amenities: ["TV Screen", "Conference Cam", "Air Conditioner"],
        pricePerHour: 35,
        rules: ["Book at least 1 hour", "Clean after use"],
        status: "maintenance",
        availability: false,
      },
      {
        name: "Lab Room C",
        description: "Hands-on lab and presentation room",
        capacity: 20,
        location: "Building C - Floor 3",
        amenities: ["Computers", "Lab Tools", "WiFi"],
        pricePerHour: 50,
        rules: ["Follow safety guidelines"],
        status: "available",
        availability: true,
      },
    ]);

    const [roomA, roomB, roomC] = rooms;

    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    await TimeSlot.insertMany([
      {
        roomId: roomA._id,
        startTime: now,
        endTime: nextHour,
        status: "available",
        createdBy: adminOrStaff._id,
        updatedBy: adminOrStaff._id,
      },
      {
        roomId: roomA._id,
        startTime: nextHour,
        endTime: twoHoursLater,
        status: "booked",
        createdBy: adminOrStaff._id,
        updatedBy: adminOrStaff._id,
      },
      {
        roomId: roomC._id,
        startTime: now,
        endTime: nextHour,
        status: "blocked",
        createdBy: adminOrStaff._id,
        updatedBy: adminOrStaff._id,
      },
    ]);

    await RoomUsageHistory.insertMany([
      {
        roomId: roomA._id,
        userId: adminOrStaff._id,
        checkInTime: new Date(now.getTime() - 4 * 60 * 60 * 1000),
        checkOutTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        durationMinutes: 120,
        status: "completed",
      },
      {
        roomId: roomB._id,
        userId: adminOrStaff._id,
        checkInTime: new Date(now.getTime() - 8 * 60 * 60 * 1000),
        checkOutTime: new Date(now.getTime() - 7 * 60 * 60 * 1000),
        durationMinutes: 60,
        status: "completed",
      },
      {
        roomId: roomC._id,
        userId: adminOrStaff._id,
        checkInTime: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        checkOutTime: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        durationMinutes: 120,
        status: "completed",
      },
    ]);

    console.log("Seeded RoomDB data successfully");
    process.exit(0);
  } catch (error) {
    console.error("Room seed error:", error.message);
    process.exit(1);
  }
};

seed();
