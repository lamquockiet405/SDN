const express = require("express");
const {
  createRoom,
  getAllRooms,
  searchRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  changeRoomStatus,
  getRoomTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getRoomUsageHistory,
  getUsageHistory,
  getAvailableRoomsByTime,
} = require("../controllers/room.controller");
const { protect, optionalAuth } = require("../middleware/auth.middleware");
const { adminOrStaff, adminOnly } = require("../middleware/role.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     tags: [Rooms]
 *     summary: Get all rooms
 *     responses:
 *       200: { description: Room list }
 *   post:
 *     tags: [Rooms]
 *     summary: Create a new room (admin/staff)
 *     responses:
 *       201: { description: Room created }
 *
 * /api/rooms/search:
 *   get:
 *     tags: [Rooms]
 *     summary: Search rooms
 *     responses:
 *       200: { description: Search results }
 *
 * /api/rooms/available-by-time:
 *   get:
 *     tags: [Rooms]
 *     summary: Get available rooms by time range
 *     responses:
 *       200: { description: Available rooms }
 *
 * /api/rooms/management/usage-history:
 *   get:
 *     tags: [Rooms]
 *     summary: Get usage history for management
 *     responses:
 *       200: { description: Room usage history }
 *
 * /api/rooms/{id}:
 *   get:
 *     tags: [Rooms]
 *     summary: Get room by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Room details }
 *   put:
 *     tags: [Rooms]
 *     summary: Update room by id (admin/staff)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Room updated }
 *   delete:
 *     tags: [Rooms]
 *     summary: Delete room by id (admin only)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Room deleted }
 *
 * /api/rooms/{id}/status:
 *   patch:
 *     tags: [Rooms]
 *     summary: Change room status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Status updated }
 *
 * /api/rooms/{roomId}/time-slots:
 *   get:
 *     tags: [Rooms]
 *     summary: Get time slots of a room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Time slots }
 *   post:
 *     tags: [Rooms]
 *     summary: Create a time slot for room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       201: { description: Time slot created }
 *
 * /api/rooms/{roomId}/time-slots/{slotId}:
 *   put:
 *     tags: [Rooms]
 *     summary: Update room time slot
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Time slot updated }
 *   delete:
 *     tags: [Rooms]
 *     summary: Delete room time slot
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: slotId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Time slot deleted }
 *
 * /api/rooms/{roomId}/usage-history:
 *   get:
 *     tags: [Rooms]
 *     summary: Get usage history for one room
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Room usage history }
 */

// Public routes
router.get("/", optionalAuth, getAllRooms);
router.get("/search", optionalAuth, searchRooms);
router.get("/available-by-time", optionalAuth, getAvailableRoomsByTime);
router.get("/:roomId/time-slots", protect, getRoomTimeSlots);

// Protected routes (Admin/Staff only)
router.get("/management/usage-history", protect, adminOrStaff, getUsageHistory);
router.post("/", protect, adminOrStaff, createRoom);
router.put("/:id", protect, adminOrStaff, updateRoom);
router.patch("/:id/status", protect, adminOrStaff, changeRoomStatus);
router.delete("/:id", protect, adminOnly, deleteRoom);
router.post("/:roomId/time-slots", protect, adminOrStaff, createTimeSlot);
router.put(
  "/:roomId/time-slots/:slotId",
  protect,
  adminOrStaff,
  updateTimeSlot,
);
router.delete(
  "/:roomId/time-slots/:slotId",
  protect,
  adminOrStaff,
  deleteTimeSlot,
);
router.get(
  "/:roomId/usage-history",
  protect,
  adminOrStaff,
  getRoomUsageHistory,
);
router.get("/:id", optionalAuth, getRoomById);

module.exports = router;
