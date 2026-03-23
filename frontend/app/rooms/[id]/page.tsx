"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Users, Clock, Check, Star } from "lucide-react";
import { roomService } from "@/services/roomService";
import { bookingService } from "@/services/bookingService";
import { reviewService } from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";
import { Room } from "@/types/room";
import { Review } from "@/types/review";

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
    specialRequests: "",
    participants: "",
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [activePanel, setActivePanel] = useState<"booking" | "reviews">(
    "booking",
  );
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchRoomReviews = useCallback(async () => {
    try {
      setReviewsLoading(true);
      const response = await reviewService.getPublicReviews({
        roomId,
        page: 1,
        limit: 20,
      });
      setReviews(response.data || []);
    } catch (error) {
      console.error("Failed to fetch room reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  }, [roomId]);

  const fetchRoomDetail = useCallback(async () => {
    try {
      const currentRoom = await roomService.getRoomById(roomId);
      setRoom(currentRoom);
    } catch (error) {
      console.error("Failed to fetch room:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  useEffect(() => {
    fetchRoomReviews();
  }, [fetchRoomReviews]);

  useEffect(() => {
    if (activePanel === "reviews") {
      fetchRoomReviews();
    }
  }, [activePanel, fetchRoomReviews]);

  useEffect(() => {
    const startTime = searchParams.get("startTime") || "";
    const endTime = searchParams.get("endTime") || "";
    const tab = searchParams.get("tab");

    if (tab === "reviews") {
      setActivePanel("reviews");
    }

    if (tab === "booking") {
      setActivePanel("booking");
    }

    if (!startTime && !endTime) {
      return;
    }

    setBookingData((prev) => ({
      ...prev,
      startTime,
      endTime,
    }));
  }, [searchParams]);

  const handleBookingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }

    try {
      setBookingLoading(true);
      await bookingService.createBooking({
        roomId,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        specialRequests: bookingData.specialRequests,
        participants: bookingData.participants.split(",").map((p) => p.trim()),
      });

      setBookingSuccess(true);
      setBookingData({
        startTime: "",
        endTime: "",
        specialRequests: "",
        participants: "",
      });

      setTimeout(() => {
        router.push("/bookings");
      }, 2000);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: unknown }).response === "object" &&
        (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (error as { response: { data: { message: string } } }).response.data
              .message
          : "Booking failed";

      alert(message);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-gray-600 text-lg mb-4">Room not found</p>
        <Link href="/" className="text-primary hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, item) => total + item.rating, 0) / reviews.length
      : 0;

  const getReviewerName = (review: Review) => {
    if (typeof review.userId === "object") {
      return review.userId.name || "Anonymous";
    }

    return "Anonymous";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-primary hover:text-primary/80 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{room.name}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2">
            {room.image && (
              <Image
                src={room.image}
                alt={room.name}
                width={1200}
                height={500}
                unoptimized
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
            )}

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <p className="text-gray-700 text-lg mb-4">{room.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Users className="text-primary mr-3" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Capacity</p>
                    <p className="text-lg font-bold">{room.capacity} People</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="text-primary mr-3" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-lg font-bold">{room.location}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="text-primary mr-3" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="text-lg font-bold">
                      ${room.pricePerHour}/hour
                    </p>
                  </div>
                </div>
              </div>

              {room.amenities && room.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, idx) => (
                      <div
                        key={idx}
                        className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center"
                      >
                        <Check size={16} className="mr-2" />
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {room.rules && room.rules.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    Rules
                  </h3>
                  <ul className="space-y-2">
                    {room.rules.map((rule, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setActivePanel("booking")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    activePanel === "booking"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Đặt phòng
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel("reviews")}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    activePanel === "reviews"
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Xem đánh giá
                </button>
              </div>

              {activePanel === "booking" ? (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Book This Room
                  </h3>

                  {bookingSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                      ✓ Booking created successfully! Redirecting...
                    </div>
                  )}

                  <form onSubmit={handleBooking} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        name="startTime"
                        value={bookingData.startTime}
                        onChange={handleBookingChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        name="endTime"
                        value={bookingData.endTime}
                        onChange={handleBookingChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Participants (comma-separated emails)
                      </label>
                      <input
                        type="text"
                        name="participants"
                        placeholder="john@example.com, jane@example.com"
                        value={bookingData.participants}
                        onChange={handleBookingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Special Requests
                      </label>
                      <textarea
                        name="specialRequests"
                        placeholder="Any special requirements..."
                        value={bookingData.specialRequests}
                        onChange={handleBookingChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      ></textarea>
                    </div>

                    {!user ? (
                      <Link
                        href="/login"
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition text-center block"
                      >
                        Login to Book
                      </Link>
                    ) : (
                      <button
                        type="submit"
                        disabled={bookingLoading}
                        className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                      >
                        {bookingLoading ? "Booking..." : "Book Now"}
                      </button>
                    )}
                  </form>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Đánh giá phòng
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    {reviews.length} đánh giá • {averageRating.toFixed(1)}/5
                  </p>

                  {reviewsLoading ? (
                    <div className="text-sm text-slate-500 py-2">
                      Đang tải đánh giá...
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-sm text-slate-500 py-2">
                      Chưa có đánh giá nào hiển thị.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                      {reviews.map((review) => (
                        <div
                          key={review._id}
                          className="border border-slate-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-semibold text-slate-900">
                              {getReviewerName(review)}
                            </p>
                            <div className="flex items-center gap-1 text-amber-500">
                              {[1, 2, 3, 4, 5].map((item) => (
                                <Star
                                  key={item}
                                  size={14}
                                  className={
                                    item <= review.rating
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-slate-300"
                                  }
                                />
                              ))}
                              <span className="ml-1 text-xs font-semibold text-slate-700">
                                {review.rating}/5
                              </span>
                            </div>
                          </div>

                          <p className="text-xs font-semibold text-slate-500 mb-1">
                            Bình luận
                          </p>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {review.comment}
                          </p>

                          <p className="text-xs text-slate-500 mt-2">
                            {new Date(review.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
