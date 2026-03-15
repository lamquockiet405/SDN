const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const {
  generateTokens,
  generateAccessToken,
} = require("../utils/generateToken");
const {
  getIpAddress,
  getUserAgent,
  generateRandomToken,
  hashToken,
} = require("../utils/helpers");
const {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendOTPEmail,
} = require("../utils/email");
const { generateOTPSecret, verifyOTP } = require("../utils/otp");
const { OAuth2Client } = require("google-auth-library");
const crypto = require("crypto");

const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper function to log audit
const logAudit = async (
  userId,
  action,
  ipAddress,
  userAgent,
  status = "success",
  metadata = {},
) => {
  try {
    await AuditLog.create({
      userId,
      action,
      ipAddress,
      userAgent,
      status,
      metadata,
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      role: "user",
    });

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    // Log registration
    await logAudit(user._id, "REGISTER", ipAddress, userAgent);

    // Send welcome email
    await sendWelcomeEmail(email, name);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const ipAddress = getIpAddress(req);
      const userAgent = getUserAgent(req);
      await logAudit(user._id, "LOGIN", ipAddress, userAgent, "failed");

      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    // If 2FA is enabled, send OTP
    if (user.isTwoFactorEnabled) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      user.otpSecret = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Send OTP email
      await sendOTPEmail(email, otp);

      return res.status(200).json({
        success: true,
        message: "OTP sent to email. Please verify to login.",
        requiresOTP: true,
        email: email,
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to user
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Log successful login
    await logAudit(user._id, "LOGIN", ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/google-login
// @desc    Login with Google OAuth
// @access  Public
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token is required",
      });
    }

    // Verify Google token
    const ticket = await oauthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        role: "user",
      });
    } else if (!user.googleId) {
      // Link Google account
      user.googleId = googleId;
      await user.save();
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token and update last login
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    // Log Google login
    await logAudit(user._id, "GOOGLE_LOGIN", ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: "Google login successful",
      accessToken,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Error with Google login",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.refreshToken = null;
      await user.save();
    }

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    // Log logout
    await logAudit(req.user._id, "LOGOUT", ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging out",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Find user with this refresh token
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);

    // Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // Log token refresh
    await logAudit(user._id, "REFRESH_TOKEN", ipAddress, userAgent);

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      message: "Error refreshing token",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.status(200).json({
        success: true,
        message:
          "If an account with this email exists, a password reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = generateRandomToken();
    user.passwordResetToken = hashToken(resetToken);
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    await sendPasswordResetEmail(email, resetUrl);

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);
    await logAudit(user._id, "PASSWORD_RESET", ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending password reset email",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    // Hash the token to match stored hash
    const hashedToken = hashToken(token);

    // Find user with valid reset token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    // Update password
    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/2fa/enable
// @desc    Enable two-factor authentication
// @access  Private
exports.enable2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Generate OTP secret and QR code
    const { secret, qrCode } = await generateOTPSecret(user.email);

    user.twoFactorSecret = secret;
    await user.save();

    res.status(200).json({
      success: true,
      message: "2FA setup initiated",
      qrCode: qrCode,
      secret: secret,
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Error enabling 2FA",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/2fa/verify
// @desc    Verify two-factor authentication code
// @access  Public/Private
exports.verify2FA = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    // If verifying login OTP
    if (email) {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      // Check if OTP is valid and not expired
      if (
        user.otpSecret !== otp ||
        !user.otpExpires ||
        user.otpExpires < new Date()
      ) {
        return res.status(401).json({
          success: false,
          message: "Invalid or expired OTP",
        });
      }

      // Clear OTP
      user.otpSecret = null;
      user.otpExpires = null;

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens(user._id);
      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      const ipAddress = getIpAddress(req);
      const userAgent = getUserAgent(req);
      await logAudit(user._id, "LOGIN", ipAddress, userAgent);

      return res.status(200).json({
        success: true,
        message: "2FA verified successfully",
        accessToken,
        refreshToken,
        user: user.toJSON(),
      });
    }

    // If verifying 2FA setup
    const user = await User.findById(req.user._id);

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        success: false,
        message: "2FA setup not initiated",
      });
    }

    // Verify OTP
    const isValid = verifyOTP(user.twoFactorSecret, otp);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP code",
      });
    }

    // Enable 2FA
    user.isTwoFactorEnabled = true;
    user.twoFactorSecret = user.twoFactorSecret; // Keep the secret
    await user.save();

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);
    await logAudit(user._id, "2FA_ENABLE", ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: "2FA enabled successfully",
    });
  } catch (error) {
    console.error("Verify 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying 2FA",
      error: error.message,
    });
  }
};

// @route   POST /api/auth/2fa/disable
// @desc    Disable two-factor authentication
// @access  Private
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    user.isTwoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    const ipAddress = getIpAddress(req);
    const userAgent = getUserAgent(req);
    await logAudit(user._id, "2FA_DISABLE", ipAddress, userAgent);

    res.status(200).json({
      success: true,
      message: "2FA disabled successfully",
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    res.status(500).json({
      success: false,
      message: "Error disabling 2FA",
      error: error.message,
    });
  }
};
