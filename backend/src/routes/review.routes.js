const express = require("express");
const { body, param, query } = require("express-validator");
const {
  submitReview,
  getMyReviews,
  getPublicReviews,
  getReviewManagement,
  toggleHideReview,
  softDeleteReview,
  getRatingSummary,
} = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");
const { adminOrStaff, authorize } = require("../middleware/role.middleware");
const { validateRequest } = require("../middleware/validate.middleware");

const router = express.Router();

const paginationValidators = [
  query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),
];

router.get(
  "/",
  [
    ...paginationValidators,
    query("roomId")
      .optional()
      .isMongoId()
      .withMessage("roomId must be a valid id"),
  ],
  validateRequest,
  getPublicReviews,
);

router.post(
  "/",
  protect,
  authorize("user"),
  [
    body("roomId").isMongoId().withMessage("roomId is required"),
    body("bookingId")
      .optional()
      .isMongoId()
      .withMessage("bookingId must be valid"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("rating must be between 1 and 5"),
    body("comment")
      .isString()
      .trim()
      .isLength({ min: 3, max: 500 })
      .withMessage("comment must be between 3 and 500 characters"),
  ],
  validateRequest,
  submitReview,
);

router.get(
  "/my",
  protect,
  authorize("user"),
  paginationValidators,
  validateRequest,
  getMyReviews,
);

router.get(
  "/management",
  protect,
  adminOrStaff,
  [
    ...paginationValidators,
    query("roomId").optional().isMongoId(),
    query("userId").optional().isMongoId(),
    query("status").optional().isIn(["active", "hidden", "deleted", "flagged"]),
    query("rating").optional().isInt({ min: 1, max: 5 }),
    query("isHidden").optional().isBoolean(),
    query("isDeleted").optional().isBoolean(),
    query("search").optional().isString().trim(),
    query("sortBy").optional().isIn(["createdAt", "rating", "updatedAt"]),
    query("sortOrder").optional().isIn(["asc", "desc"]),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
  validateRequest,
  getReviewManagement,
);

router.patch(
  "/:id/hide",
  protect,
  adminOrStaff,
  [
    param("id").isMongoId().withMessage("review id must be valid"),
    body("hidden").isBoolean().withMessage("hidden must be boolean"),
    body("note").optional().isString().trim().isLength({ max: 300 }),
  ],
  validateRequest,
  toggleHideReview,
);

router.delete(
  "/:id",
  protect,
  adminOrStaff,
  [
    param("id").isMongoId().withMessage("review id must be valid"),
    body("note").optional().isString().trim().isLength({ max: 300 }),
  ],
  validateRequest,
  softDeleteReview,
);

router.get(
  "/ratings/summary",
  protect,
  adminOrStaff,
  [
    query("roomId").optional().isMongoId(),
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
    query("groupBy").optional().isIn(["room", "day"]),
  ],
  validateRequest,
  getRatingSummary,
);

module.exports = router;
