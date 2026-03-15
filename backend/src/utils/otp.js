const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

// Generate OTP Secret and QR Code
exports.generateOTPSecret = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `Study Room Booking (${email})`,
    issuer: "Study Room Booking System",
    length: 32,
  });

  // Generate QR Code Data URL
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCode,
  };
};

// Verify OTP
exports.verifyOTP = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: "base32",
    token: token,
    window: 2, // Allow codes from 1 step before or after
  });
};

// Generate random 6-digit OTP
exports.generateRandomOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
