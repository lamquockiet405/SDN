const express = require("express");
const { query } = require("express-validator");
const {
  createBooking,
  createGroupBooking,
  getUserBookings,
  getStudentBookingHistory,
  getManagementBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
  forceCancelBooking,
  checkInBooking,
  checkOutBooking,
  extendBookingTime,
  uploadUsageEvidence,
  getPendingBookingsForReview,
  approveBooking,
  rejectBooking,
  getPendingEvidence,
  reviewEvidence,
  getRoomBookings,
} = require("../controllers/booking.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOrStaff, adminOnly } = require("../middleware/role.middleware");
const { validateRequest } = require("../middleware/validate.middleware");

const router = express.Router();

// Protected routes
router.post("/", protect, createBooking);
router.post("/group", protect, createGroupBooking);
router.get("/", protect, getUserBookings);
router.get("/my-bookings", protect, getUserBookings);
router.get("/history", protect, getStudentBookingHistory);
router.get("/management", protect, adminOrStaff, getManagementBookings);

router.get(
  "/review/pending",
  protect,
  adminOrStaff,
  getPendingBookingsForReview,
);
router.patch("/:id/approve", protect, adminOrStaff, approveBooking);
router.patch("/:id/reject", protect, adminOrStaff, rejectBooking);

router.get(
  "/evidence/pending",
  protect,
  adminOrStaff,
  [query("status").optional().isIn(["pending", "approved", "rejected", "all"])],
  validateRequest,
  getPendingEvidence,
);
router.patch(
  "/evidence/:evidenceId/review",
  protect,
  adminOrStaff,
  reviewEvidence,
);

router.patch("/:id/check-in", protect, checkInBooking);
router.patch("/:id/check-out", protect, checkOutBooking);
router.patch("/:id/extend", protect, extendBookingTime);
router.post("/:id/evidence", protect, uploadUsageEvidence);
router.patch("/:id/cancel", protect, cancelBooking);
router.get("/:id", protect, getBookingById);
router.put("/:id", protect, updateBooking);
router.delete("/:id", protect, cancelBooking);

// Admin/Staff routes
router.get("/room/:roomId", protect, adminOrStaff, getRoomBookings);
router.patch("/:id/force-cancel", protect, adminOnly, forceCancelBooking);

module.exports = router;
