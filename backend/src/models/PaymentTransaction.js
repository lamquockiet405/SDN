const mongoose = require("mongoose");
const { getPaymentConnection } = require("../config/db");

const paymentTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: "VND",
      trim: true,
    },
    provider: {
      type: String,
      enum: ["manual"],
      default: "manual",
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentUrl: {
      type: String,
      trim: true,
    },
    txnRef: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    bankCode: {
      type: String,
      trim: true,
    },
    transactionNo: {
      type: String,
      trim: true,
      index: true,
    },
    paidAt: Date,
    rawResponse: {
      type: Object,
      default: null,
    },
  },
  { timestamps: true },
);

paymentTransactionSchema.index({ userId: 1, createdAt: -1 });
paymentTransactionSchema.index({ bookingId: 1, createdAt: -1 });
paymentTransactionSchema.index({ status: 1, createdAt: -1 });

const paymentConnection = getPaymentConnection();

module.exports =
  paymentConnection.models.PaymentTransaction ||
  paymentConnection.model("PaymentTransaction", paymentTransactionSchema);
