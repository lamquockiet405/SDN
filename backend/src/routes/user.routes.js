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
