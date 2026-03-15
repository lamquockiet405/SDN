const jwt = require("jsonwebtoken");

// Generate Access Token (15 minutes)
exports.generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

// Generate Refresh Token (7 days)
exports.generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "7d",
  });
};

// Verify Refresh Token
exports.verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
};

// Generate both tokens
exports.generateTokens = (userId) => {
  const accessToken = exports.generateAccessToken(userId);
  const refreshToken = exports.generateRefreshToken(userId);

  return { accessToken, refreshToken };
};
