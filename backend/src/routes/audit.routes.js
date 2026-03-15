const express = require("express");
const {
  getAllAuditLogs,
  searchAuditLogs,
  getAuditLogById,
  deleteAuditLog,
} = require("../controllers/audit.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOrStaff, adminOnly } = require("../middleware/role.middleware");

const router = express.Router();

// All audit logs routes require authentication and admin/staff role
router.get("/", protect, adminOrStaff, getAllAuditLogs);
router.get("/search", protect, adminOrStaff, searchAuditLogs);
router.get("/:id", protect, adminOrStaff, getAuditLogById);
router.delete("/:id", protect, adminOnly, deleteAuditLog);

module.exports = router;
