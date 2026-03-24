"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { bookingService } from "@/services/bookingService";
import { reviewService } from "@/services/reviewService";
import { Review } from "@/types/review";
import {
  Calendar,
  MessageSquare,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface BookingOption {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  time: string;
}

const normalizeBookingStatus = (status: string) => {
  if (status === "completed") {
    return "checked_out";
  }

  if (status === "confirmed") {
    return "approved";
  }

  return status;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object" &&
    (error as { response?: { data?: { message?: string } } }).response?.data
      ?.message
  ) {
    return (error as { response: { data: { message: string } } }).response.data
      .message;
  }

  return fallback;
};

const getRoomDisplay = (review: Review) => {
  if (typeof review.roomId === "object") {
    return review.roomId.name || review.roomId.location || review.roomId._id;
  }

  return review.roomId;
};

const getUserDisplay = (review: Review) => {
  if (typeof review.userId === "object") {
    return review.userId.name || review.userId.email || review.userId._id;
  }

  return review.userId;
};

export default function FeedbackPage() {
  const { user } = useAuth();
  const isStudent = user?.role === "user";
  const isModerator = user?.role === "staff" || user?.role === "admin";

  const [activeTab, setActiveTab] = useState<
    "submit" | "history" | "management"
  >("submit");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [managementReviews, setManagementReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudentData = useCallback(async () => {
    const [historyResponse, bookingsResponse] = await Promise.all([
      reviewService.getMyReviews(1, 100),
      bookingService.getUserBookings(1, 100),
    ]);

    const myReviewList = historyResponse.data || [];
    setMyReviews(myReviewList);

    const reviewedBookingIds = new Set(
      myReviewList
        .map((review) =>
          typeof review.bookingId === "string" ? review.bookingId : "",
        )
        .filter(Boolean),
    );

    const eligibleBookings = (bookingsResponse.bookings || []).filter(
      (item) => {
        const bookingId = item._id || item.id || "";
        const status = normalizeBookingStatus(item.status);
        const isBlocked = ["cancelled", "rejected"].includes(status);
        const isPaid = item.paymentStatus === "completed";

        return (
          bookingId &&
          !reviewedBookingIds.has(bookingId) &&
          isPaid &&
          !isBlocked
        );
      },
    );

    const mapped = eligibleBookings.map((booking) => {
      const roomName =
        typeof booking.roomId === "object"
          ? booking.roomId.name || booking.roomId.location || booking.roomId._id
          : booking.roomId;

      const roomId =
        typeof booking.roomId === "object"
          ? booking.roomId._id
          : booking.roomId;
      const bookingId = booking._id || booking.id || "";

      return {
        id: bookingId,
        roomId,
        roomName,
        date: new Date(booking.startTime).toLocaleDateString(),
        time: `${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(
          booking.endTime,
        ).toLocaleTimeString()}`,
      };
    });

    setBookingOptions(mapped);
  }, []);

  const loadManagementData = useCallback(async () => {
    const response = await reviewService.getReviewManagement({
      page: 1,
      limit: 100,
      search: searchTerm || undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    setManagementReviews(response.data || []);
  }, [searchTerm]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);

      if (isStudent) {
        await loadStudentData();
      }

      if (isModerator) {
        await loadManagementData();
      }
    } catch (error) {
      console.error("Failed to load feedback page", error);
    } finally {
      setIsLoading(false);
    }
  }, [isModerator, isStudent, loadManagementData, loadStudentData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!isModerator) {
      return;
    }

    const timer = setTimeout(() => {
      loadManagementData().catch((error) => {
        console.error("Failed to refresh management reviews", error);
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [isModerator, loadManagementData]);

  const selectedBookingData = useMemo(
    () => bookingOptions.find((item) => item.id === selectedBooking),
    [bookingOptions, selectedBooking],
  );

  const submitBlockedReason = useMemo(() => {
    if (!selectedBooking) {
      return "Vui lòng chọn booking để đánh giá.";
    }

    if (rating === 0) {
      return "Vui lòng chọn số sao đánh giá.";
    }

    if (comment.trim().length < 3) {
      return "Bình luận phải có ít nhất 3 ký tự.";
    }

    return "";
  }, [selectedBooking, rating, comment]);

  const handleSubmitFeedback = async () => {
    if (!selectedBookingData) {
      return;
    }

    try {
      await reviewService.submitReview({
        roomId: selectedBookingData.roomId,
        bookingId: selectedBookingData.id,
        rating,
        comment,
      });

      setRating(0);
      setComment("");
      setSelectedBooking("");
      await loadStudentData();
      setActiveTab("history");
    } catch (error) {
      alert(getErrorMessage(error, "Submit feedback failed"));
    }
  };

  const handleDelete = async (review: Review) => {
    try {
      await reviewService.deleteReview(
        review._id,
        "Deleted by moderator from feedback page",
      );
      await loadManagementData();
    } catch (error) {
      alert(getErrorMessage(error, "Delete review failed"));
    }
  };

  const averageRating =
    myReviews.length > 0
      ? (
          myReviews.reduce((sum, item) => sum + item.rating, 0) /
          myReviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <DashboardLayout title="Feedback">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Total Reviews
              </h3>
              <div className="p-3 bg-blue-50 rounded-lg text-primary">
                <MessageSquare size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {isModerator ? managementReviews.length : myReviews.length}
            </p>
          </div>

          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Average Rating
              </h3>
              <div className="p-3 bg-yellow-50 rounded-lg text-warning">
                <Star size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{averageRating}</p>
          </div>

          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                5-Star Reviews
              </h3>
              <div className="p-3 bg-green-50 rounded-lg text-success">
                <Star size={24} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {
                (isModerator ? managementReviews : myReviews).filter(
                  (item) => item.rating === 5,
                ).length
              }
            </p>
          </div>
        </div>

        {isModerator && (
          <div className="bg-white rounded-card shadow-soft-md p-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search comments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {isStudent && (
          <div className="flex gap-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("submit")}
              className={`py-3 font-medium transition flex items-center gap-2 ${
                activeTab === "submit"
                  ? "text-primary border-b-2 border-primary -mb-[2px]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Send size={18} />
              Submit Feedback
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 font-medium transition flex items-center gap-2 ${
                activeTab === "history"
                  ? "text-primary border-b-2 border-primary -mb-[2px]"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageSquare size={18} />
              My Feedback
            </button>
          </div>
        )}

        {isLoading && <div className="text-slate-500">Loading...</div>}

        {!isLoading && isStudent && activeTab === "submit" && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">
              Submit New Feedback
            </h2>

            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Which booking would you like to review? *
                </label>
                <select
                  value={selectedBooking}
                  onChange={(e) => setSelectedBooking(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a paid booking...</option>
                  {bookingOptions.map((booking) => (
                    <option key={booking.id} value={booking.id}>
                      {booking.roomName} - {booking.date} ({booking.time})
                    </option>
                  ))}
                </select>
                {bookingOptions.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    No eligible bookings to review yet.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  How would you rate this room? *
                </label>
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition transform hover:scale-125"
                    >
                      <Star
                        size={32}
                        className={
                          star <= rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-slate-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Comment *
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your experience..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
                  rows={5}
                ></textarea>
                <p className="text-xs text-slate-600 mt-2">
                  {comment.length}/500 characters
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmitFeedback}
                  disabled={Boolean(submitBlockedReason)}
                  className="flex-1 py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Submit Feedback
                </button>
                <button
                  onClick={() => {
                    setRating(0);
                    setComment("");
                    setSelectedBooking("");
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Clear
                </button>
              </div>

              {submitBlockedReason && (
                <p className="text-xs text-red-600">{submitBlockedReason}</p>
              )}
            </div>
          </div>
        )}

        {!isLoading && isStudent && activeTab === "history" && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Your Feedback History
            </h2>
            {myReviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <MessageSquare
                  size={48}
                  className="mx-auto text-slate-400 mb-4"
                />
                <p className="text-slate-600">
                  You have not submitted any feedback yet
                </p>
              </div>
            ) : (
              myReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {getRoomDisplay(review)}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 mb-3">{review.comment}</p>

                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(review.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {!isLoading && isModerator && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Rating Management
            </h2>
            {managementReviews.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg">
                <MessageSquare
                  size={48}
                  className="mx-auto text-slate-400 mb-4"
                />
                <p className="text-slate-600">No reviews found</p>
              </div>
            ) : (
              managementReviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {getUserDisplay(review)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {getRoomDisplay(review)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((item) => (
                        <Star
                          key={item}
                          size={16}
                          className={
                            item <= review.rating
                              ? "text-warning fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">
                    {review.isHidden ? (
                      <span className="italic text-slate-400">
                        Comment hidden
                      </span>
                    ) : (
                      review.comment
                    )}
                  </p>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(review.createdAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          await reviewService.toggleHideReview(
                            review._id,
                            !review.isHidden,
                          );
                          await loadManagementData();
                        }}
                        className="px-3 py-1 rounded-btn text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      >
                        {review.isHidden ? "Unhide" : "Hide"}
                      </button>
                      <button
                        onClick={() => handleDelete(review)}
                        className="px-3 py-1 rounded-btn text-xs bg-red-100 text-red-700 hover:bg-red-200 flex items-center gap-1"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
