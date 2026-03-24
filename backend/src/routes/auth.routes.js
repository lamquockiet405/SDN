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
  changePassword,
  enable2FA,
  verify2FA,
  disable2FA,
  getCurrentUser,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, confirmPassword]
 *             properties:
 *               name: { type: string, example: Nguyen Van A }
 *               email: { type: string, format: email, example: user@example.com }
 *               password: { type: string, minLength: 6, example: secret123 }
 *               confirmPassword: { type: string, minLength: 6, example: secret123 }
 *     responses:
 *       201: { description: Registered successfully }
 *       400: { description: Validation error }
 *
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: user@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200: { description: Login success }
 *       401: { description: Invalid credentials }
 *
 * /api/auth/google-login:
 *   post:
 *     tags: [Auth]
 *     summary: Login or register via Google ID token
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [idToken]
 *             properties:
 *               idToken: { type: string }
 *     responses:
 *       200: { description: Login success }
 *
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Send password reset email
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200: { description: Reset instructions sent }
 *
 * /api/auth/reset-password:
 *   post:
 *     tags: [Auth]
 *     summary: Reset password using token and new password
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password, confirmPassword]
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *               confirmPassword: { type: string }
 *     responses:
 *       200: { description: Password reset success }
 *
 * /api/auth/forgot-password-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Send OTP for password reset
 *     security: []
 *     responses:
 *       200: { description: OTP sent }
 *
 * /api/auth/verify-password-reset-otp:
 *   post:
 *     tags: [Auth]
 *     summary: Verify password reset OTP
 *     security: []
 *     responses:
 *       200: { description: OTP verified }
 *
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     security: []
 *     responses:
 *       200: { description: Token refreshed }
 *
 * /api/auth/2fa/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verify 2FA code during login
 *     security: []
 *     responses:
 *       200: { description: 2FA verified }
 *
 * /api/auth/2fa/verify-setup:
 *   post:
 *     tags: [Auth]
 *     summary: Verify and activate 2FA setup for authenticated user
 *     responses:
 *       200: { description: 2FA setup verified }
 *
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout current user
 *     responses:
 *       200: { description: Logged out }
 *
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current authenticated user
 *     responses:
 *       200: { description: Current user profile }
 *
 * /api/auth/change-password:
 *   post:
 *     tags: [Auth]
 *     summary: Change password for current user
 *     responses:
 *       200: { description: Password changed }
 *
 * /api/auth/2fa/enable:
 *   post:
 *     tags: [Auth]
 *     summary: Start 2FA enrollment
 *     responses:
 *       200: { description: 2FA setup started }
 *
 * /api/auth/2fa/disable:
 *   post:
 *     tags: [Auth]
 *     summary: Disable 2FA for current user
 *     responses:
 *       200: { description: 2FA disabled }
 */

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
router.post("/2fa/verify-setup", protect, verify2FA);

// Protected routes
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);
router.post("/change-password", protect, changePassword);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);

module.exports = router;
