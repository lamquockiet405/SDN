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

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     tags: [Audit]
 *     summary: Get all audit logs
 *     responses:
 *       200: { description: Audit log list }
 *
 * /api/audit-logs/search:
 *   get:
 *     tags: [Audit]
 *     summary: Search audit logs
 *     responses:
 *       200: { description: Search results }
 *
 * /api/audit-logs/{id}:
 *   get:
 *     tags: [Audit]
 *     summary: Get audit log by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Audit log details }
 *   delete:
 *     tags: [Audit]
 *     summary: Delete audit log by id (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Audit log deleted }
 */

// All audit logs routes require authentication and admin/staff role
router.get("/", protect, adminOrStaff, getAllAuditLogs);
router.get("/search", protect, adminOrStaff, searchAuditLogs);
router.get("/:id", protect, adminOrStaff, getAuditLogById);
router.delete("/:id", protect, adminOnly, deleteAuditLog);

module.exports = router;
