"use client";

import { useState } from "react";
import { Trash2, Eye, EyeOff, Star } from "lucide-react";

interface Rating {
  id: string;
  user: string;
  room: string;
  rating: number;
  comment: string;
  date: string;
  commentHidden: boolean;
}

export default function StaffRatingManagement() {
  const [ratings, setRatings] = useState<Rating[]>([
    {
      id: "r1",
      user: "John Doe",
      room: "Study Room A",
      rating: 5,
      comment:
        "Excellent study environment, very quiet and comfortable. Great amenities!",
      date: "2025-03-15 14:20",
      commentHidden: false,
    },
    {
      id: "r2",
      user: "Jane Smith",
      room: "Lab Room B",
      rating: 4,
      comment: "Good room, but AC could be better during summer.",
      date: "2025-03-14 11:45",
      commentHidden: false,
    },
    {
      id: "r3",
      user: "Mike Johnson",
      room: "Meeting Room C",
      rating: 3,
      comment: "Decent but needs better lighting and more comfortable chairs.",
      date: "2025-03-13 16:30",
      commentHidden: false,
    },
    {
      id: "r4",
      user: "Sarah Williams",
      room: "Study Room A",
      rating: 5,
      comment: "Perfect for group projects! Very satisfied with the setup.",
      date: "2025-03-12 13:15",
      commentHidden: false,
    },
  ]);

  const [filterRoom, setFilterRoom] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [showModal, setShowModal] = useState(false);

  const rooms = Array.from(new Set(ratings.map((r) => r.room)));

  const toggleCommentVisibility = (id: string) => {
    setRatings(
      ratings.map((r) =>
        r.id === id ? { ...r, commentHidden: !r.commentHidden } : r,
      ),
    );
  };

  const deleteRating = (id: string) => {
    setRatings(ratings.filter((r) => r.id !== id));
  };

  const filteredRatings = ratings.filter((r) => {
    const roomMatch = filterRoom === "all" || r.room === filterRoom;
    const ratingMatch =
      filterRating === "all" || parseInt(filterRating) === r.rating;
    return roomMatch && ratingMatch;
  });

  const averageRating =
    ratings.length > 0
      ? (
          ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        ).toFixed(1)
      : 0;

  const ratingDistribution = {
    5: ratings.filter((r) => r.rating === 5).length,
    4: ratings.filter((r) => r.rating === 4).length,
    3: ratings.filter((r) => r.rating === 3).length,
    2: ratings.filter((r) => r.rating === 2).length,
    1: ratings.filter((r) => r.rating === 1).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rating Management</h1>
        <p className="text-slate-600 mt-1">
          Monitor and manage user ratings and feedback
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Ratings */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-semibold mb-1">
            Total Ratings
          </p>
          <p className="text-3xl font-bold text-blue-900">{ratings.length}</p>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600 font-semibold mb-1">
            Average Rating
          </p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-yellow-900">
              {averageRating}
            </p>
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>

        {/* 5 Stars */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-semibold mb-1">5 Stars</p>
          <p className="text-3xl font-bold text-green-900">
            {ratingDistribution[5]}
          </p>
        </div>

        {/* 3-4 Stars */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600 font-semibold mb-1">
            3-4 Stars
          </p>
          <p className="text-3xl font-bold text-orange-900">
            {ratingDistribution[4] + ratingDistribution[3]}
          </p>
        </div>

        {/* Below 3 Stars */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600 font-semibold mb-1">
            Below 3 Stars
          </p>
          <p className="text-3xl font-bold text-red-900">
            {ratingDistribution[1] + ratingDistribution[2]}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter by Room
          </label>
          <select
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
          >
            <option value="all">All Rooms</option>
            {rooms.map((room) => (
              <option key={room} value={room}>
                {room}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter by Rating
          </label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* Ratings Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Comment
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredRatings.map((rating) => (
                <tr
                  key={rating.id}
                  className="hover:bg-slate-50 transition cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {rating.user}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {rating.room}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < rating.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-slate-300"
                          }
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                    {rating.commentHidden ? (
                      <span className="text-slate-400 italic">
                        Comment hidden
                      </span>
                    ) : (
                      <span className="truncate">{rating.comment}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {rating.date}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRating(rating);
                          setShowModal(true);
                        }}
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="View full comment"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => toggleCommentVisibility(rating.id)}
                        className={`p-2 rounded-lg transition ${
                          rating.commentHidden
                            ? "text-red-600 hover:bg-red-50"
                            : "text-yellow-600 hover:bg-yellow-50"
                        }`}
                        title={
                          rating.commentHidden ? "Show comment" : "Hide comment"
                        }
                      >
                        {rating.commentHidden ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteRating(rating.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete rating"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRatings.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Star size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">
            No ratings match the selected filters
          </p>
        </div>
      )}

      {/* Comment Modal */}
      {showModal && selectedRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                Rating Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">User</p>
                  <p className="font-semibold text-slate-900">
                    {selectedRating.user}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Room</p>
                  <p className="font-semibold text-slate-900">
                    {selectedRating.room}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Rating</p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < selectedRating.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">Comment</p>
                <p className="text-slate-900">{selectedRating.comment}</p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Date Submitted</p>
                <p className="font-semibold text-slate-900">
                  {selectedRating.date}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  toggleCommentVisibility(selectedRating.id);
                  setShowModal(false);
                }}
                className={`flex-1 px-4 py-2 rounded-lg transition font-medium ${
                  selectedRating.commentHidden
                    ? "bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                    : "bg-yellow-600 text-white hover:bg-yellow-700 flex items-center justify-center gap-2"
                }`}
              >
                {selectedRating.commentHidden ? (
                  <>
                    <Eye size={18} />
                    Show Comment
                  </>
                ) : (
                  <>
                    <EyeOff size={18} />
                    Hide Comment
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  deleteRating(selectedRating.id);
                  setShowModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
