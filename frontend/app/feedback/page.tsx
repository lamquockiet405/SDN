"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { MessageSquare, Star, User, Calendar, Search } from "lucide-react";
import { useState } from "react";

interface Feedback {
  id: string;
  user: string;
  room: string;
  rating: number;
  comment: string;
  date: string;
}

export default function FeedbackPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([
    {
      id: "1",
      user: "John Doe",
      room: "Meeting Room A",
      rating: 5,
      comment: "Excellent room and great service!",
      date: "2024-03-20",
    },
    {
      id: "2",
      user: "Jane Smith",
      room: "Study Room B",
      rating: 4,
      comment: "Good space but could use better lighting",
      date: "2024-03-19",
    },
    {
      id: "3",
      user: "Mike Johnson",
      room: "Lab Room C",
      rating: 5,
      comment: "Perfect for our research needs!",
      date: "2024-03-18",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredFeedback = feedbackList.filter(
    (f) =>
      f.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.room.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const averageRating =
    feedbackList.length > 0
      ? (
          feedbackList.reduce((sum, f) => sum + f.rating, 0) /
          feedbackList.length
        ).toFixed(1)
      : 0;

  return (
    <DashboardLayout title="Feedback">
      <div className="space-y-6">
        {/* Summary Cards */}
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
              {feedbackList.length}
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
              {feedbackList.filter((f) => f.rating === 5).length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-card shadow-soft-md p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {filteredFeedback.map((feedback) => (
            <div
              key={feedback.id}
              className="bg-white rounded-card shadow-soft-md p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">{feedback.user}</p>
                  <p className="text-sm text-gray-500">{feedback.room}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < feedback.rating
                          ? "text-warning fill-current"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-700 mb-3">{feedback.comment}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar size={12} />
                {feedback.date}
              </p>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFeedback.length === 0 && (
          <div className="text-center py-12 bg-white rounded-card">
            <MessageSquare size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-gray-900 font-semibold mb-1">
              No feedback found
            </h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
