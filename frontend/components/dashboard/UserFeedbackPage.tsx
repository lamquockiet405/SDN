"use client";

import { useState } from "react";
import { Star, Send, MessageSquare, Trash2 } from "lucide-react";

interface Feedback {
  id: string;
  roomId: string;
  roomName: string;
  bookingDate: string;
  rating: number;
  comment: string;
  submittedAt: string;
}

interface CompletedBooking {
  id: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export default function UserFeedbackPage() {
  const [activeTab, setActiveTab] = useState<"submit" | "history">("submit");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<string>("");

  const [feedbackList] = useState<Feedback[]>([
    {
      id: "f1",
      roomId: "room1",
      roomName: "Study Room A",
      bookingDate: "2025-03-01",
      rating: 5,
      comment:
        "Excellent room with great facilities. Quiet and comfortable environment.",
      submittedAt: "2025-03-02",
    },
    {
      id: "f2",
      roomId: "room2",
      roomName: "Lab Room B",
      bookingDate: "2025-02-28",
      rating: 4,
      comment: "Good equipment but a bit crowded during peak hours.",
      submittedAt: "2025-02-28",
    },
  ]);

  const [completedBookings] = useState<CompletedBooking[]>([
    {
      id: "b1",
      roomName: "Study Room A",
      date: "2025-03-10",
      startTime: "10:00",
      endTime: "12:00",
    },
    {
      id: "b2",
      roomName: "Lab Room B",
      date: "2025-03-08",
      startTime: "14:00",
      endTime: "16:00",
    },
    {
      id: "b3",
      roomName: "Meeting Room C",
      date: "2025-03-05",
      startTime: "09:00",
      endTime: "11:00",
    },
  ]);

  const handleSubmitFeedback = () => {
    console.log({
      bookingId: selectedBooking,
      rating,
      comment,
    });
    setRating(0);
    setComment("");
    setSelectedBooking("");
    // TODO: Submit feedback via API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Feedback</h1>
        <p className="text-slate-600 mt-2">
          Share your experience and help us improve
        </p>
      </div>

      {/* Tabs */}
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

      {/* Submit Feedback Tab */}
      {activeTab === "submit" && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Submit New Feedback
          </h2>

          <div className="max-w-2xl space-y-6">
            {/* Booking Selection */}
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
                {completedBookings.map((booking) => (
                  <option key={booking.id} value={booking.id}>
                    {booking.roomName} - {booking.date} ({booking.startTime} -
                    {booking.endTime})
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
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
              {rating > 0 && (
                <p className="mt-2 text-sm text-slate-600">
                  You rated this room{" "}
                  <span className="font-semibold text-primary">
                    {rating} out of 5
                  </span>
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your experience... (optional)"
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-vertical"
                rows={5}
              ></textarea>
              <p className="text-xs text-slate-600 mt-2">
                {comment.length}/500 characters
              </p>
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                What could we improve?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Cleanliness",
                  "Comfort",
                  "Equipment",
                  "Temperature",
                  "Noise Level",
                  "WiFi Speed",
                ].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-sm text-slate-700">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSubmitFeedback}
                disabled={!selectedBooking || rating === 0}
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

      {/* Feedback History Tab */}
      {activeTab === "history" && (
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
                You haven't submitted any feedback yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {feedback.roomName}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {feedback.bookingDate}
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
                      Submitted on {feedback.submittedAt}
                    </span>
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition text-red-600">
                      <Trash2 size={18} />
                    </button>
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
