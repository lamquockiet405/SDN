"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle, Eye, Image as ImageIcon, XCircle } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { BookingEvidence } from "@/types/booking";

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

export default function StaffEvidenceReview() {
  const [evidenceList, setEvidenceList] = useState<BookingEvidence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEvidence, setSelectedEvidence] =
    useState<BookingEvidence | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchEvidence = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await bookingService.getPendingEvidence({
        page: 1,
        limit: 100,
        status: "all",
      });
      setEvidenceList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch pending evidence", error);
      setEvidenceList([]);
      setError(getErrorMessage(error, "Failed to load evidence data"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidence();
  }, []);

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    try {
      await bookingService.reviewEvidence(id, { status });
      await fetchEvidence();
      setShowModal(false);
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Review evidence failed"));
    }
  };

  const pendingEvidence = evidenceList.filter((e) => e.status === "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Evidence Review</h1>
        <p className="text-slate-600 mt-1">
          Review and approve usage evidence uploaded by users
        </p>
      </div>

      {pendingEvidence.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>{pendingEvidence.length}</strong> evidence file(s) awaiting
            review
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evidenceList.map((evidence) => (
            <div
              key={evidence._id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="h-40 bg-slate-200 overflow-hidden relative">
                <Image
                  src={evidence.url}
                  alt="Evidence"
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      evidence.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : evidence.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {evidence.status}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Booking ID</p>
                  <p className="font-semibold text-slate-900">
                    {evidence.bookingId}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">User</p>
                    <p className="font-medium text-slate-900">
                      {evidence.uploadedByUser?.name ||
                        evidence.uploadedByUser?.email ||
                        evidence.uploadedBy}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Room</p>
                    <p className="font-medium text-slate-900">
                      {evidence.booking &&
                      typeof evidence.booking.roomId === "object"
                        ? evidence.booking.roomId.name
                        : "-"}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-600 mb-1">Upload Time</p>
                  <p className="text-sm text-slate-700">
                    {evidence.createdAt
                      ? new Date(evidence.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div className="flex gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={() => {
                      setSelectedEvidence(evidence);
                      setShowModal(true);
                    }}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  {evidence.status === "pending" && (
                    <>
                      <button
                        onClick={() => handleReview(evidence._id, "approved")}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleReview(evidence._id, "rejected")}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium"
                      >
                        <XCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {evidenceList.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <ImageIcon size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No evidence files to review</p>
        </div>
      )}

      {showModal && selectedEvidence && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">
                Evidence Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="w-full h-96 bg-slate-200 rounded-lg overflow-hidden">
                <Image
                  src={selectedEvidence.url}
                  alt="Evidence"
                  width={1000}
                  height={700}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Booking ID</p>
                  <p className="font-semibold text-slate-900">
                    {selectedEvidence.bookingId}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">User</p>
                  <p className="font-semibold text-slate-900">
                    {selectedEvidence.uploadedByUser?.name ||
                      selectedEvidence.uploadedByUser?.email ||
                      selectedEvidence.uploadedBy}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Type</p>
                  <p className="font-semibold text-slate-900">
                    {selectedEvidence.type}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Upload Time</p>
                  <p className="font-semibold text-slate-900">
                    {selectedEvidence.createdAt
                      ? new Date(selectedEvidence.createdAt).toLocaleString()
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Close
              </button>
              {selectedEvidence.status === "pending" && (
                <>
                  <button
                    onClick={() =>
                      handleReview(selectedEvidence._id, "approved")
                    }
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() =>
                      handleReview(selectedEvidence._id, "rejected")
                    }
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
