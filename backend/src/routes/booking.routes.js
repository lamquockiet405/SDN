const express = require("express");
const {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  getRoomBookings,
} = require("../controllers/booking.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOrStaff } = require("../middleware/role.middleware");

const router = express.Router();

// Protected routes
router.post("/", protect, createBooking);
router.get("/", protect, getUserBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, cancelBooking);

// Admin/Staff routes
router.get("/room/:roomId", protect, adminOrStaff, getRoomBookings);

module.exports = router;
