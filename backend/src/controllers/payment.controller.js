const PaymentTransaction = require("../models/PaymentTransaction");
const Booking = require("../models/Booking");
const AuditLog = require("../models/AuditLog");
const { getIpAddress, getUserAgent } = require("../utils/helpers");

const buildErrorResponse = (res, status, message, error) =>
  res.status(status).json({
    success: false,
    message,
    ...(error ? { error } : {}),
  });

const toPagination = (query) => {
  const page = Math.max(parseInt(query.page || 1, 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || 10, 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const logAudit = async (req, action, metadata = {}, userId = null) => {
  try {
    const actorId = userId || req?.user?._id;
    if (!actorId) {
      return;
    }

    await AuditLog.create({
      userId: actorId,
      action,
      ipAddress: req ? getIpAddress(req) : "system",
      userAgent: req ? getUserAgent(req) : "system",
      status: "success",
      metadata,
    });
  } catch (error) {
    console.error("Payment audit log error:", error.message);
  }
};

exports.createDirectPayment = async (req, res) => {
  try {
    const { bookingId, amount } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return buildErrorResponse(res, 404, "Booking not found");
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return buildErrorResponse(
        res,
        403,
        "You can only pay for your own booking",
      );
    }

    if (["cancelled", "rejected"].includes(booking.status)) {
      return buildErrorResponse(
        res,
        400,
        `Cannot create payment for booking in status ${booking.status}`,
      );
    }

    if (booking.paymentStatus === "completed") {
      return buildErrorResponse(res, 400, "Booking is already paid");
    }

    const paymentAmount = Number(amount || booking.totalPrice);
    if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
      return buildErrorResponse(res, 400, "amount must be greater than 0");
    }

    await PaymentTransaction.updateMany(
      {
        userId: req.user._id,
        bookingId,
        status: "pending",
      },
      {
        $set: {
          status: "failed",
          rawResponse: {
            reason: "replaced_by_direct_payment",
            replacedAt: new Date(),
          },
        },
      },
    );

    const orderId = `ORD${Date.now()}`;
    const txnRef = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const transaction = await PaymentTransaction.create({
      userId: req.user._id,
      bookingId,
      orderId,
      amount: paymentAmount,
      currency: process.env.PAYMENT_CURRENCY || "VND",
      provider: "manual",
      status: "success",
      txnRef,
      paidAt: new Date(),
      rawResponse: {
        source: "direct_payment",
      },
    });

    booking.paymentStatus = "completed";
    await booking.save();

    await logAudit(req, "PAYMENT_CREATE_DIRECT", {
      bookingId,
      paymentTransactionId: transaction._id,
      txnRef,
      amount: paymentAmount,
    });

    return res.status(201).json({
      success: true,
      message: "Payment completed successfully",
      data: {
        paymentId: transaction._id,
        bookingId,
        amount: paymentAmount,
        status: transaction.status,
        provider: transaction.provider,
      },
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error creating payment",
      error.message,
    );
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const { status } = req.query;
    const { page, limit, skip } = toPagination(req.query);

    const query = { userId: req.user._id };
    if (status) {
      query.status = status;
    }

    const payments = await PaymentTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "bookingId",
        model: Booking,
        select: "startTime endTime totalPrice status",
      });

    const total = await PaymentTransaction.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching payment history",
      error.message,
    );
  }
};
