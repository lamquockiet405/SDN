const crypto = require("crypto");

// Get IP address from request
exports.getIpAddress = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "Unknown"
  );
};

// Get User Agent
exports.getUserAgent = (req) => {
  return req.headers["user-agent"] || "Unknown";
};

// Generate random token
exports.generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString("hex");
};

// Hash token
exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Generate 6-digit OTP
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
