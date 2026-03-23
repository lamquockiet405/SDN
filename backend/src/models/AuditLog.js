const mongoose = require("mongoose");
const { getAuditConnection } = require("../config/db");

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
        "PASSWORD_RESET_OTP_SENT",
        "PASSWORD_RESET_SUCCESS",
        "PASSWORD_CHANGE",
        "DELETE_ACCOUNT",
        "2FA_ENABLE",
        "2FA_DISABLE",
        "GOOGLE_LOGIN",
        "REFRESH_TOKEN",
        "ROLE_CHANGE",
        "STATUS_CHANGE",
        "PROFILE_UPDATE",
        "PERMISSIONS_UPDATE",
        "VIOLATION_CREATE",
        "ROOM_CREATE",
        "ROOM_UPDATE",
        "ROOM_DELETE",
        "ROOM_STATUS_CHANGE",
        "TIMESLOT_CREATE",
        "TIMESLOT_UPDATE",
        "BOOKING_CREATE",
        "BOOKING_APPROVE",
        "BOOKING_REJECT",
        "BOOKING_CANCEL",
        "BOOKING_FORCE_CANCEL",
        "BOOKING_CHECK_IN",
        "BOOKING_CHECK_OUT",
        "BOOKING_EXTEND",
        "BOOKING_EVIDENCE_UPLOAD",
        "BOOKING_EVIDENCE_REVIEW",
        "REVIEW_SUBMIT",
        "REVIEW_HIDE_TOGGLE",
        "REVIEW_DELETE",
        "PAYMENT_CREATE",
        "PAYMENT_CALLBACK_SUCCESS",
        "PAYMENT_CALLBACK_FAILED",
        "PAYMENT_STATUS_UPDATE",
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

const auditConnection = getAuditConnection();

module.exports =
  auditConnection.models.AuditLog ||
  auditConnection.model("AuditLog", auditLogSchema);
