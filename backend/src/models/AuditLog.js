const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "LOGIN",
        "LOGOUT",
        "REGISTER",
        "PASSWORD_RESET",
        "DELETE_ACCOUNT",
        "2FA_ENABLE",
        "2FA_DISABLE",
        "GOOGLE_LOGIN",
        "REFRESH_TOKEN",
      ],
      required: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    metadata: {
      type: Object,
    },
  },
  { timestamps: true },
);

// Index for efficient searching
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
