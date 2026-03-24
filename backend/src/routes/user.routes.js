const express = require("express");
const { body, param, query } = require("express-validator");
const {
  getDashboardStats,
  listUsers,
  listStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getViolatedUsers,
  createViolation,
  getPermissions,
  updateRolePermissions,
  assignRole,
  changeUserStatus,
  getProfile,
  getMyProfile,
  updateProfile,
  updateMyProfile,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const {
  authorize,
  adminOrStaff,
  adminOnly,
} = require("../middleware/role.middleware");
const { validateRequest } = require("../middleware/validate.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/users/dashboard/stats:
 *   get:
 *     tags: [Users]
 *     summary: Get dashboard stats (admin/staff)
 *     responses:
 *       200: { description: Dashboard statistics }
 *
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users with filters and pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [user, staff, admin] }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, locked] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200: { description: User list }
 *
 * /api/users/staff:
 *   get:
 *     tags: [Users]
 *     summary: List staff users
 *     responses:
 *       200: { description: Staff list }
 *   post:
 *     tags: [Users]
 *     summary: Create a staff account (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 6 }
 *               confirmPassword: { type: string, minLength: 6 }
 *               phone: { type: string }
 *               department: { type: string }
 *               status: { type: string, enum: [active, inactive, locked] }
 *     responses:
 *       201: { description: Staff account created }
 *
 * /api/users/staff/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Get staff by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Staff details }
 *   put:
 *     tags: [Users]
 *     summary: Update staff by id (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Staff updated }
 *   delete:
 *     tags: [Users]
 *     summary: Delete staff by id (admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Staff deleted }
 *
 * /api/users/violations:
 *   get:
 *     tags: [Users]
 *     summary: List user violations
 *     responses:
 *       200: { description: Violation list }
 *   post:
 *     tags: [Users]
 *     summary: Create violation record (admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, reason]
 *             properties:
 *               userId: { type: string }
 *               reason: { type: string }
 *               severity: { type: string, enum: [low, medium, high] }
 *     responses:
 *       201: { description: Violation created }
 *
 * /api/users/permissions:
 *   get:
 *     tags: [Users]
 *     summary: Get role permissions
 *     responses:
 *       200: { description: Permission list }
 *
 * /api/users/permissions/{role}:
 *   put:
 *     tags: [Users]
 *     summary: Update role permissions (admin)
 *     parameters:
 *       - in: path
 *         name: role
 *         required: true
 *         schema: { type: string, enum: [user, staff, admin] }
 *     responses:
 *       200: { description: Permissions updated }
 *
 * /api/users/{id}/role:
 *   patch:
 *     tags: [Users]
 *     summary: Assign user role (limited route)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Role updated }
 *
 * /api/users/{id}/status:
 *   patch:
 *     tags: [Users]
 *     summary: Change user status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Status updated }
 *
 * /api/users/me/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get my profile
 *     responses:
 *       200: { description: My profile }
 *   put:
 *     tags: [Users]
 *     summary: Update my profile
 *     responses:
 *       200: { description: My profile updated }
 *
 * /api/users/{id}/profile:
 *   get:
 *     tags: [Users]
 *     summary: Get profile by user id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User profile }
 *   put:
 *     tags: [Users]
 *     summary: Update profile by user id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: User profile updated }
 */

const paginationValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];

router.use(protect);

router.get("/dashboard/stats", adminOrStaff, getDashboardStats);

router.get(
  "/",
  adminOrStaff,
  [
    ...paginationValidators,
    query("role").optional().isIn(["user", "staff", "admin"]),
    query("status").optional().isIn(["active", "inactive", "locked"]),
    query("search").optional().isString().trim(),
  ],
  validateRequest,
  listUsers,
);

router.get(
  "/staff",
  adminOrStaff,
  paginationValidators,
  validateRequest,
  listStaff,
);

router.get(
  "/staff/:id",
  adminOrStaff,
  [param("id").isMongoId().withMessage("Valid staff id is required")],
  validateRequest,
  getStaffById,
);

router.post(
  "/staff",
  adminOnly,
  [
    body("name")
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("name must be between 2 and 100 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isString()
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters"),
    body("confirmPassword")
      .isString()
      .isLength({ min: 6 })
      .withMessage("confirmPassword must be at least 6 characters"),
    body("phone").optional().isString().trim().isLength({ max: 30 }),
    body("department").optional().isString().trim().isLength({ max: 100 }),
    body("status").optional().isIn(["active", "inactive", "locked"]),
  ],
  validateRequest,
  createStaff,
);

router.put(
  "/staff/:id",
  adminOnly,
  [
    param("id").isMongoId().withMessage("Valid staff id is required"),
    body("name").optional().isString().trim().isLength({ min: 2, max: 100 }),
    body("email").optional().isEmail(),
    body("phone").optional().isString().trim().isLength({ max: 30 }),
    body("department").optional().isString().trim().isLength({ max: 100 }),
    body("status").optional().isIn(["active", "inactive", "locked"]),
    body("password").optional().isString().isLength({ min: 6 }),
  ],
  validateRequest,
  updateStaff,
);

router.delete(
  "/staff/:id",
  adminOnly,
  [param("id").isMongoId().withMessage("Valid staff id is required")],
  validateRequest,
  deleteStaff,
);

router.get(
  "/violations",
  adminOrStaff,
  [
    ...paginationValidators,
    query("severity").optional().isIn(["low", "medium", "high"]),
    query("status").optional().isIn(["active", "resolved"]),
    query("search").optional().isString().trim(),
  ],
  validateRequest,
  getViolatedUsers,
);

router.post(
  "/violations",
  adminOnly,
  [
    body("userId").isMongoId().withMessage("Valid userId is required"),
    body("reason")
      .isString()
      .trim()
      .isLength({ min: 5, max: 500 })
      .withMessage("reason must be between 5 and 500 characters"),
    body("severity").optional().isIn(["low", "medium", "high"]),
  ],
  validateRequest,
  createViolation,
);

router.get("/permissions", adminOrStaff, getPermissions);

router.put(
  "/permissions/:role",
  adminOnly,
  [
    param("role").isIn(["user", "staff", "admin"]),
    body("permissions").isArray().withMessage("permissions must be an array"),
    body("permissions.*")
      .isString()
      .trim()
      .isLength({ min: 1 })
      .withMessage("each permission must be a non-empty string"),
  ],
  validateRequest,
  updateRolePermissions,
);

router.patch(
  "/:id/role",
  adminOnly,
  [
    param("id").isMongoId().withMessage("Valid user id is required"),
    body("role")
      .isIn(["user"])
      .withMessage("Only role 'user' can be assigned here"),
  ],
  validateRequest,
  assignRole,
);

router.patch(
  "/:id/status",
  adminOnly,
  [
    param("id").isMongoId().withMessage("Valid user id is required"),
    body("status").isIn(["active", "inactive", "locked"]),
  ],
  validateRequest,
  changeUserStatus,
);

router.get("/me/profile", authorize("admin", "staff", "user"), getMyProfile);

router.put(
  "/me/profile",
  authorize("admin", "staff", "user"),
  [
    body("name").optional().isString().trim().isLength({ min: 2, max: 100 }),
    body("phone").optional().isString().trim().isLength({ max: 30 }),
    body("department").optional().isString().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  updateMyProfile,
);

router.get(
  "/:id/profile",
  [param("id").isMongoId().withMessage("Valid user id is required")],
  validateRequest,
  getProfile,
);

router.put(
  "/:id/profile",
  [
    param("id").isMongoId().withMessage("Valid user id is required"),
    body("name").optional().isString().trim().isLength({ min: 2, max: 100 }),
    body("phone").optional().isString().trim().isLength({ max: 30 }),
    body("department").optional().isString().trim().isLength({ max: 100 }),
  ],
  validateRequest,
  updateProfile,
);

module.exports = router;
