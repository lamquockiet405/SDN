const mongoose = require("mongoose");

let auditConnection;
let userConnection;
let roomConnection;
let bookingConnection;
let reviewConnection;
let paymentConnection;

const getAuthDbUri = () => process.env.AUTH_DB_URI;
const getAuditDbUri = () => process.env.AUDIT_DB_URI;
const getUserDbUri = () => process.env.USER_DB_URI;
const getRoomDbUri = () => process.env.ROOM_DB_URI;
const getBookingDbUri = () => process.env.BOOKING_DB_URI;
const getReviewDbUri = () => process.env.REVIEW_DB_URI;
const getPaymentDbUri = () => process.env.PAYMENT_DB_URI;

const validateDbUris = () => {
  const authDbUri = getAuthDbUri();
  const auditDbUri = getAuditDbUri();
  const userDbUri = getUserDbUri();
  const roomDbUri = getRoomDbUri();
  const bookingDbUri = getBookingDbUri();
  const reviewDbUri = getReviewDbUri();
  const paymentDbUri = getPaymentDbUri();

  if (
    !authDbUri ||
    !auditDbUri ||
    !userDbUri ||
    !roomDbUri ||
    !bookingDbUri ||
    !reviewDbUri ||
    !paymentDbUri
  ) {
    throw new Error(
      "AUTH_DB_URI, AUDIT_DB_URI, USER_DB_URI, ROOM_DB_URI, BOOKING_DB_URI, REVIEW_DB_URI and PAYMENT_DB_URI are required",
    );
  }

  return {
    authDbUri,
    auditDbUri,
    userDbUri,
    roomDbUri,
    bookingDbUri,
    reviewDbUri,
    paymentDbUri,
  };
};

const getAuditConnection = () => {
  if (!auditConnection) {
    const { auditDbUri } = validateDbUris();
    auditConnection = mongoose.createConnection(auditDbUri);
  }

  return auditConnection;
};

const getUserConnection = () => {
  if (!userConnection) {
    const { userDbUri } = validateDbUris();
    userConnection = mongoose.createConnection(userDbUri);
  }

  return userConnection;
};

const getRoomConnection = () => {
  if (!roomConnection) {
    const { roomDbUri } = validateDbUris();
    roomConnection = mongoose.createConnection(roomDbUri);
  }

  return roomConnection;
};

const getBookingConnection = () => {
  if (!bookingConnection) {
    const { bookingDbUri } = validateDbUris();
    bookingConnection = mongoose.createConnection(bookingDbUri);
  }

  return bookingConnection;
};

const getReviewConnection = () => {
  if (!reviewConnection) {
    const { reviewDbUri } = validateDbUris();
    reviewConnection = mongoose.createConnection(reviewDbUri);
  }

  return reviewConnection;
};

const getPaymentConnection = () => {
  if (!paymentConnection) {
    const { paymentDbUri } = validateDbUris();
    paymentConnection = mongoose.createConnection(paymentDbUri);
  }

  return paymentConnection;
};

const connectDB = async () => {
  try {
    const { authDbUri } = validateDbUris();
    const authConn = await mongoose.connect(authDbUri);
    const auditConn = getAuditConnection();
    const userConn = getUserConnection();
    const roomConn = getRoomConnection();
    const bookingConn = getBookingConnection();
    const reviewConn = getReviewConnection();
    const paymentConn = getPaymentConnection();
    await auditConn.asPromise();
    await userConn.asPromise();
    await roomConn.asPromise();
    await bookingConn.asPromise();
    await reviewConn.asPromise();
    await paymentConn.asPromise();

    console.log(`AuthDB Connected: ${authConn.connection.host}`);
    console.log(`AuditDB Connected: ${auditConn.host}`);
    console.log(`UserDB Connected: ${userConn.host}`);
    console.log(`RoomDB Connected: ${roomConn.host}`);
    console.log(`BookingDB Connected: ${bookingConn.host}`);
    console.log(`ReviewDB Connected: ${reviewConn.host}`);
    console.log(`PaymentDB Connected: ${paymentConn.host}`);

    return {
      authConn,
      auditConn,
      userConn,
      roomConn,
      bookingConn,
      reviewConn,
      paymentConn,
    };
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  getAuditConnection,
  getUserConnection,
  getRoomConnection,
  getBookingConnection,
  getReviewConnection,
  getPaymentConnection,
};
