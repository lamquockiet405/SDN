const express = require("express");
const {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
} = require("../controllers/room.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOrStaff, adminOnly } = require("../middleware/role.middleware");

const router = express.Router();

// Public routes
router.get("/", getAllRooms);
router.get("/:id", getRoomById);

// Protected routes (Admin/Staff only)
router.post("/", protect, adminOrStaff, createRoom);
router.put("/:id", protect, adminOrStaff, updateRoom);
router.delete("/:id", protect, adminOnly, deleteRoom);

module.exports = router;
