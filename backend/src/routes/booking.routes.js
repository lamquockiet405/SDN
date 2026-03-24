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

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a booking
 *     responses:
 *       201: { description: Booking created }
 *   get:
 *     tags: [Bookings]
 *     summary: Get current user's bookings
 *     responses:
 *       200: { description: Booking list }
 *
 * /api/bookings/group:
 *   post:
 *     tags: [Bookings]
 *     summary: Create group booking
 *     responses:
 *       201: { description: Group booking created }
 *
 * /api/bookings/my-bookings:
 *   get:
 *     tags: [Bookings]
 *     summary: Alias endpoint for current user's bookings
 *     responses:
 *       200: { description: Booking list }
 *
 * /api/bookings/history:
 *   get:
 *     tags: [Bookings]
 *     summary: Get student booking history
 *     responses:
 *       200: { description: Booking history }
 *
 * /api/bookings/management:
 *   get:
 *     tags: [Bookings]
 *     summary: Get bookings for management (admin/staff)
 *     responses:
 *       200: { description: Management booking list }
 *
 * /api/bookings/review/pending:
 *   get:
 *     tags: [Bookings]
 *     summary: Get pending bookings for approval
 *     responses:
 *       200: { description: Pending bookings }
 *
 * /api/bookings/{id}/approve:
 *   patch:
 *     tags: [Bookings]
 *     summary: Approve a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking approved }
 *
 * /api/bookings/{id}/reject:
 *   patch:
 *     tags: [Bookings]
 *     summary: Reject a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking rejected }
 *
 * /api/bookings/evidence/pending:
 *   get:
 *     tags: [Bookings]
 *     summary: Get pending booking evidence
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected, all] }
 *     responses:
 *       200: { description: Evidence list }
 *
 * /api/bookings/evidence/{evidenceId}/review:
 *   patch:
 *     tags: [Bookings]
 *     summary: Review booking evidence
 *     parameters:
 *       - in: path
 *         name: evidenceId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Evidence reviewed }
 *
 * /api/bookings/{id}/check-in:
 *   patch:
 *     tags: [Bookings]
 *     summary: Check in booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Checked in }
 *
 * /api/bookings/{id}/check-out:
 *   patch:
 *     tags: [Bookings]
 *     summary: Check out booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Checked out }
 *
 * /api/bookings/{id}/extend:
 *   patch:
 *     tags: [Bookings]
 *     summary: Extend booking time
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking extended }
 *
 * /api/bookings/{id}/evidence:
 *   post:
 *     tags: [Bookings]
 *     summary: Upload booking usage evidence
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Evidence uploaded }
 *
 * /api/bookings/{id}/cancel:
 *   patch:
 *     tags: [Bookings]
 *     summary: Cancel booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking cancelled }
 *
 * /api/bookings/{id}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get booking by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking details }
 *   put:
 *     tags: [Bookings]
 *     summary: Update booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking updated }
 *   delete:
 *     tags: [Bookings]
 *     summary: Delete/cancel booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking deleted }
 *
 * /api/bookings/room/{roomId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get bookings by room (admin/staff)
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Room bookings }
 *
 * /api/bookings/{id}/force-cancel:
 *   patch:
 *     tags: [Bookings]
 *     summary: Force cancel booking (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Booking force cancelled }
 */

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
