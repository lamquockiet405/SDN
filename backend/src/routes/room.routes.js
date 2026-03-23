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
