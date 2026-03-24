"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, Send, MessageSquare } from "lucide-react";
import { reviewService } from "@/services/reviewService";
import { bookingService } from "@/services/bookingService";
import { Review } from "@/types/review";

interface BookingOption {
  id: string;
  roomId: string;
  roomName: string;
  date: string;
  time: string;
}

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

export default function UserFeedbackPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [bookingOptions, setBookingOptions] = useState<BookingOption[]>([]);
  const [feedbackList, setFeedbackList] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [reviewsRes, bookingsRes] = await Promise.all([
        reviewService.getMyReviews(1, 100),
        bookingService.getBookingHistory(1, 100),
      ]);

      setFeedbackList(reviewsRes.data || []);

      const completedBookings = (bookingsRes.bookings || []).filter(
        (item) => item.status === "checked_out" || item.status === "completed",
      );

      const mapped = completedBookings.map((booking) => {
        const roomName =
          typeof booking.roomId === "object"
            ? booking.roomId.name ||
              booking.roomId.location ||
              booking.roomId._id
            : booking.roomId;

        const roomId =
          typeof booking.roomId === "object"
            ? booking.roomId._id
            : booking.roomId;

        return {
          id: booking._id || booking.id || "",
          roomId,
          roomName,
          date: new Date(booking.startTime).toLocaleDateString(),
          time: `${new Date(booking.startTime).toLocaleTimeString()} - ${new Date(
            booking.endTime,
          ).toLocaleTimeString()}`,
        };
      });

      setBookingOptions(mapped);
    } catch (error) {
      console.error("Failed to fetch user feedback data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedBookingData = useMemo(
    () => bookingOptions.find((item) => item.id === selectedBooking),
    [bookingOptions, selectedBooking],
  );

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
      await fetchData();
      setActiveTab("history");
    } catch (error) {
      alert(getErrorMessage(error, "Submit feedback failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Feedback</h1>
        <p className="text-slate-600 mt-2">
          Share your experience and help us improve
        </p>
      </div>

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
          Feedback History
        </button>
      </div>

      {isLoading && <div className="text-slate-500">Loading...</div>}

      {!isLoading && activeTab === "submit" && (
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
                <option value="">Select a completed booking...</option>
                {bookingOptions.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.roomName} - {booking.date} ({booking.time})
                  </option>
                ))}
              </select>
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
                disabled={
                  !selectedBooking || rating === 0 || comment.trim().length < 3
                }
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
          </div>
        </div>
      )}

      {!isLoading && activeTab === "history" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Your Feedback History
          </h2>

          {feedbackList.length === 0 ? (
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
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div
                  key={feedback._id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {getRoomDisplay(feedback)}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          className={
                            star <= feedback.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-700 mb-3">{feedback.comment}</p>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-200">
                    <span className="text-xs text-slate-600">
                      Submitted on{" "}
                      {new Date(feedback.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
