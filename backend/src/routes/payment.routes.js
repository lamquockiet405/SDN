const express = require("express");
const { body, query } = require("express-validator");
const {
  createDirectPayment,
  getPaymentHistory,
} = require("../controllers/payment.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorize } = require("../middleware/role.middleware");
const { validateRequest } = require("../middleware/validate.middleware");

const router = express.Router();

router.post(
  "/pay",
  protect,
  authorize("user"),
  [
    body("bookingId").isMongoId().withMessage("bookingId is required"),
    body("amount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("amount must be greater than 0"),
  ],
  validateRequest,
  createDirectPayment,
);

router.get(
  "/history",
  protect,
  authorize("user"),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["pending", "success", "failed", "cancelled"])
      .withMessage("invalid status filter"),
  ],
  validateRequest,
  getPaymentHistory,
);

module.exports = router;
