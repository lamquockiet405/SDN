"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Star, Trash2 } from "lucide-react";
import { reviewService } from "@/services/reviewService";
import { Review } from "@/types/review";

const getRoomName = (review: Review) =>
  typeof review.roomId === "object"
    ? review.roomId.name || review.roomId.location || review.roomId._id
    : review.roomId;

const getUserName = (review: Review) =>
  typeof review.userId === "object"
    ? review.userId.name || review.userId.email || review.userId._id
    : review.userId;

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

export default function StaffRatingManagement() {
  const [ratings, setRatings] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomFilter, setRoomFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [summary, setSummary] = useState({ totalReviews: 0, averageRating: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, summaryRes] = await Promise.all([
        reviewService.getReviewManagement({
          page: 1,
          limit: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
        reviewService.getRatingSummary({ groupBy: "room" }),
      ]);

      setRatings(listRes.data || []);
      setSummary(summaryRes.overall || { totalReviews: 0, averageRating: 0 });
    } catch (error) {
      console.error("Failed to fetch ratings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const rooms = useMemo(
    () => Array.from(new Set(ratings.map((item) => getRoomName(item)))),
    [ratings],
  );

  const filtered = ratings.filter((item) => {
    const roomMatch = roomFilter === "all" || getRoomName(item) === roomFilter;
    const ratingMatch =
      ratingFilter === "all" || item.rating === Number(ratingFilter);
    return roomMatch && ratingMatch;
  });

  const distribution = {
    five: ratings.filter((item) => item.rating === 5).length,
    mid: ratings.filter((item) => item.rating === 3 || item.rating === 4)
      .length,
    low: ratings.filter((item) => item.rating <= 2).length,
  };

  const handleToggleHide = async (review: Review) => {
    try {
      await reviewService.toggleHideReview(
        review._id,
        !review.isHidden,
        review.isHidden ? "Unhide comment" : "Hide comment",
      );
      await fetchData();
    } catch (error) {
      alert(getErrorMessage(error, "Update hide status failed"));
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewService.deleteReview(reviewId, "Delete comment by staff");
      await fetchData();
    } catch (error) {
      alert(getErrorMessage(error, "Delete comment failed"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Rating Management</h1>
        <p className="text-slate-600 mt-1">
          Monitor and moderate user ratings and feedback
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <p className="text-sm text-blue-600 font-semibold mb-1">
            Total Ratings
          </p>
          <p className="text-3xl font-bold text-blue-900">
            {summary.totalReviews}
          </p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200">
          <p className="text-sm text-yellow-600 font-semibold mb-1">
            Average Rating
          </p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-yellow-900">
              {Number(summary.averageRating || 0).toFixed(1)}
            </p>
            <Star size={20} className="text-yellow-500 fill-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-600 font-semibold mb-1">5 Stars</p>
          <p className="text-3xl font-bold text-green-900">
            {distribution.five}
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
          <p className="text-sm text-orange-600 font-semibold mb-1">
            3-4 Stars
          </p>
          <p className="text-3xl font-bold text-orange-900">
            {distribution.mid}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-600 font-semibold mb-1">
            Below 3 Stars
          </p>
          <p className="text-3xl font-bold text-red-900">{distribution.low}</p>
        </div>
      </div>

      <div className="flex gap-4 flex-wrap bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter by Room
          </label>
          <select
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white"
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
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white"
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

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading...</div>
        ) : (
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
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {getUserName(item)}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {getRoomName(item)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            className={
                              star <= item.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs">
                      {item.isHidden ? (
                        <span className="text-slate-400 italic">
                          Comment hidden
                        </span>
                      ) : (
                        item.comment
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleHide(item)}
                          className={`p-2 rounded-lg transition ${
                            item.isHidden
                              ? "text-green-600 hover:bg-green-50"
                              : "text-yellow-600 hover:bg-yellow-50"
                          }`}
                        >
                          {item.isHidden ? (
                            <Eye size={18} />
                          ) : (
                            <EyeOff size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        )}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Star size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">
            No ratings match the selected filters
          </p>
        </div>
      )}
    </div>
  );
}
