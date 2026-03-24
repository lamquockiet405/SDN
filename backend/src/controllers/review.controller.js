const Review = require("../models/Review");
const ReviewModerationLog = require("../models/ReviewModerationLog");
const AuditLog = require("../models/AuditLog");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const User = require("../models/User");
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

const logAudit = async (req, action, metadata = {}) => {
  try {
    await AuditLog.create({
      userId: req.user._id,
      action,
      ipAddress: getIpAddress(req),
      userAgent: getUserAgent(req),
      status: "success",
      metadata,
    });
  } catch (error) {
    console.error("Review audit log error:", error.message);
  }
};

const normalizeReviewableStatus = (status) => {
  if (status === "confirmed") {
    return "approved";
  }

  if (status === "completed") {
    return "checked_out";
  }

  return status;
};

const mapSortField = (sortBy, sortOrder) => {
  const fieldMap = {
    createdAt: "createdAt",
    rating: "rating",
    updatedAt: "updatedAt",
  };

  const field = fieldMap[sortBy] || "createdAt";
  const order = sortOrder === "asc" ? 1 : -1;

  return { [field]: order };
};

exports.submitReview = async (req, res) => {
  try {
    const { roomId, bookingId, rating, comment } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return buildErrorResponse(res, 404, "Room not found");
    }

    if (bookingId) {
      const booking = await Booking.findById(bookingId);
      if (!booking) {
        return buildErrorResponse(res, 404, "Booking not found");
      }

      if (booking.userId.toString() !== req.user._id.toString()) {
        return buildErrorResponse(
          res,
          403,
          "You can only review your own booking",
        );
      }

      if (booking.roomId.toString() !== roomId) {
        return buildErrorResponse(
          res,
          400,
          "Booking does not belong to selected room",
        );
      }

      const normalizedStatus = normalizeReviewableStatus(booking.status);
      if (["cancelled", "rejected"].includes(normalizedStatus)) {
        return buildErrorResponse(
          res,
          400,
          "You cannot submit feedback for cancelled or rejected bookings",
        );
      }

      if (booking.paymentStatus !== "completed") {
        return buildErrorResponse(
          res,
          400,
          "You can only submit feedback for paid bookings",
        );
      }

      const duplicateReview = await Review.findOne({
        bookingId,
        userId: req.user._id,
        isDeleted: false,
      });

      if (duplicateReview) {
        return buildErrorResponse(
          res,
          409,
          "Feedback for this booking already exists",
        );
      }
    }

    const review = await Review.create({
      userId: req.user._id,
      roomId,
      bookingId: bookingId || null,
      rating,
      comment: comment.trim(),
      isHidden: false,
      isDeleted: false,
      status: "active",
    });

    await logAudit(req, "REVIEW_SUBMIT", {
      reviewId: review._id,
      roomId,
      bookingId,
      rating,
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error submitting review",
      error.message,
    );
  }
};

exports.getMyReviews = async (req, res) => {
  try {
    const { page, limit, skip } = toPagination(req.query);
    const query = { userId: req.user._id, isDeleted: false };

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "roomId", model: Room, select: "name location" });

    const total = await Review.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: reviews,
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
      "Error fetching my reviews",
      error.message,
    );
  }
};

exports.getPublicReviews = async (req, res) => {
  try {
    const { roomId } = req.query;
    const { page, limit, skip } = toPagination(req.query);

    const query = {
      isHidden: false,
      isDeleted: false,
      status: "active",
    };

    if (roomId) {
      query.roomId = roomId;
    }

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: "roomId", model: Room, select: "name location" })
      .populate({ path: "userId", model: User, select: "name" });

    const total = await Review.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: reviews,
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
      "Error fetching public reviews",
      error.message,
    );
  }
};

exports.getReviewManagement = async (req, res) => {
  try {
    const {
      roomId,
      userId,
      status,
      rating,
      isHidden,
      isDeleted,
      search,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const { page, limit, skip } = toPagination(req.query);
    const query = {};

    if (roomId) {
      query.roomId = roomId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (status) {
      query.status = status;
    }

    if (rating) {
      query.rating = Number(rating);
    }

    if (isHidden !== undefined) {
      query.isHidden = isHidden === "true";
    }

    if (isDeleted !== undefined) {
      query.isDeleted = isDeleted === "true";
    }

    if (search) {
      query.comment = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const sort = mapSortField(sortBy, sortOrder);

    const reviews = await Review.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate({ path: "roomId", model: Room, select: "name location" })
      .populate({ path: "userId", model: User, select: "name email" });

    const total = await Review.countDocuments(query);

    return res.status(200).json({
      success: true,
      data: reviews,
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
      "Error fetching review management list",
      error.message,
    );
  }
};

exports.toggleHideReview = async (req, res) => {
  try {
    const { hidden, note } = req.body;

    const review = await Review.findById(req.params.id);
    if (!review) {
      return buildErrorResponse(res, 404, "Review not found");
    }

    if (review.isDeleted) {
      return buildErrorResponse(
        res,
        400,
        "Cannot hide/unhide a deleted review",
      );
    }

    review.isHidden = hidden;
    review.status = hidden ? "hidden" : "active";
    await review.save();

    await ReviewModerationLog.create({
      reviewId: review._id,
      action: hidden ? "HIDE" : "UNHIDE",
      actorId: req.user._id,
      note: note || "",
    });

    await logAudit(req, "REVIEW_HIDE_TOGGLE", {
      reviewId: review._id,
      hidden,
      note,
    });

    return res.status(200).json({
      success: true,
      message: hidden ? "Review hidden" : "Review unhidden",
      data: review,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error updating review visibility",
      error.message,
    );
  }
};

exports.softDeleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return buildErrorResponse(res, 404, "Review not found");
    }

    if (review.isDeleted) {
      return buildErrorResponse(res, 400, "Review has already been deleted");
    }

    review.isDeleted = true;
    review.status = "deleted";
    await review.save();

    await ReviewModerationLog.create({
      reviewId: review._id,
      action: "DELETE",
      actorId: req.user._id,
      note: req.body.note || "",
    });

    await logAudit(req, "REVIEW_DELETE", {
      reviewId: review._id,
      note: req.body.note,
    });

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      data: review,
    });
  } catch (error) {
    return buildErrorResponse(res, 500, "Error deleting review", error.message);
  }
};

exports.getRatingSummary = async (req, res) => {
  try {
    const { roomId, startDate, endDate, groupBy = "room" } = req.query;

    const match = {
      isDeleted: false,
    };

    if (roomId) {
      match.roomId = roomId;
    }

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) {
        match.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        match.createdAt.$lte = new Date(endDate);
      }
    }

    const groupId =
      groupBy === "day"
        ? {
            day: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
              },
            },
          }
        : "$roomId";

    const summary = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: groupId,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          fiveStar: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
          fourStar: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
          threeStar: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
          twoStar: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
          oneStar: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
        },
      },
      { $sort: { averageRating: -1 } },
    ]);

    const overall = await Review.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      overall: overall[0] || { totalReviews: 0, averageRating: 0 },
      data: summary,
    });
  } catch (error) {
    return buildErrorResponse(
      res,
      500,
      "Error fetching rating summary",
      error.message,
    );
  }
};
