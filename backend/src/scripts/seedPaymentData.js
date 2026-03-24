require("dotenv").config();
const { connectDB } = require("../config/db");
const PaymentTransaction = require("../models/PaymentTransaction");
const User = require("../models/User");
const Booking = require("../models/Booking");

const seedPaymentData = async () => {
  try {
    await connectDB();

    const student = await User.findOne({ role: "user" });
    if (!student) {
      throw new Error("No student user found. Please create one first.");
    }

    const bookings = await Booking.find({ userId: student._id }).limit(3);
    if (bookings.length < 3) {
      throw new Error("Need at least 3 bookings for payment seeding.");
    }

    await PaymentTransaction.deleteMany({});

    const [pendingBooking, successBooking, failedBooking] = bookings;

    const now = Date.now();

    await PaymentTransaction.insertMany([
      {
        userId: student._id,
        bookingId: pendingBooking._id,
        orderId: `ORD${now}01`,
        amount: Math.max(1, Math.round(pendingBooking.totalPrice || 100000)),
        currency: "VND",
        provider: "manual",
        status: "pending",
        txnRef: `PAY${now}01`,
      },
      {
        userId: student._id,
        bookingId: successBooking._id,
        orderId: `ORD${now}02`,
        amount: Math.max(1, Math.round(successBooking.totalPrice || 150000)),
        currency: "VND",
        provider: "manual",
        status: "success",
        txnRef: `PAY${now}02`,
        paidAt: new Date(),
        rawResponse: { source: "manual_seed" },
      },
      {
        userId: student._id,
        bookingId: failedBooking._id,
        orderId: `ORD${now}03`,
        amount: Math.max(1, Math.round(failedBooking.totalPrice || 90000)),
        currency: "VND",
        provider: "manual",
        status: "failed",
        txnRef: `PAY${now}03`,
        rawResponse: { source: "manual_seed", reason: "payment_failed" },
      },
    ]);

    await Promise.all([
      Booking.findByIdAndUpdate(successBooking._id, {
        paymentStatus: "completed",
      }),
      Booking.findByIdAndUpdate(failedBooking._id, { paymentStatus: "failed" }),
      Booking.findByIdAndUpdate(pendingBooking._id, {
        paymentStatus: "pending",
      }),
    ]);

    console.log("Seeded PaymentDB data successfully");
    process.exit(0);
  } catch (error) {
    console.error("Payment seed error:", error.message);
    process.exit(1);
  }
};

seedPaymentData();
