const express = require("express");
const {
  register,
  login,
  logout,
  googleLogin,
  refreshToken,
  forgotPassword,
  resetPassword,
  forgotPasswordOTP,
  verifyPasswordResetOTP,
  enable2FA,
  verify2FA,
  disable2FA,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/forgot-password-otp", forgotPasswordOTP);
router.post("/verify-password-reset-otp", verifyPasswordResetOTP);
router.post("/refresh", refreshToken);

// 2FA routes
router.post("/2fa/verify", verify2FA);

// Protected routes
router.post("/logout", protect, logout);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);

module.exports = router;
