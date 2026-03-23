"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Image as ImageIcon, CheckCircle, XCircle, Eye } from "lucide-react";
import { bookingService } from "@/services/bookingService";
import { Booking, BookingEvidence } from "@/types/booking";

type EvidenceWithDetails = BookingEvidence & {
  booking?: Booking;
  uploadedByUser?: {
    _id: string;
    name?: string;
    email?: string;
  };
};

const getRoomDisplay = (evidence: EvidenceWithDetails) => {
  if (typeof evidence.booking?.roomId === "object") {
    return (
      evidence.booking.roomId.name ||
      evidence.booking.roomId.location ||
      evidence.booking.roomId._id
    );
  }

  return evidence.booking?.roomId || "-";
};

const getUserDisplay = (evidence: EvidenceWithDetails) =>
  evidence.uploadedByUser?.name ||
  evidence.uploadedByUser?.email ||
  evidence.uploadedBy ||
  "-";

const getBookingDisplay = (evidence: EvidenceWithDetails) => {
  if (typeof evidence.bookingId === "string") {
    return evidence.bookingId;
  }

  return evidence.booking?._id || evidence.booking?.id || "-";
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

const statusColor = (status: "pending" | "approved" | "rejected") => {
  if (status === "approved") {
    return "bg-green-100 text-green-700";
  }

  if (status === "rejected") {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
};

export default function AdminEvidenceReview() {
  const [evidenceList, setEvidenceList] = useState<EvidenceWithDetails[]>([]);
  const [reviewedList, setReviewedList] = useState<EvidenceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");

  const [selectedEvidence, setSelectedEvidence] =
    useState<EvidenceWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);

  const loadEvidence = async () => {
    try {
      setIsLoading(true);
      const response = await bookingService.getPendingEvidence({
        page: 1,
        limit: 100,
        status: "all",
      });

      setEvidenceList((response.data || []) as EvidenceWithDetails[]);
    } catch (error) {
      console.error("Failed to load evidence", error);
      setEvidenceList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvidence();
  }, []);

  const handleReview = async (
    evidence: EvidenceWithDetails,
    status: "approved" | "rejected",
  ) => {
    try {
      setActionLoadingId(evidence._id);
      const note =
        status === "rejected" ? "Rejected by admin reviewer" : "Approved";

      const updatedEvidence = await bookingService.reviewEvidence(
        evidence._id,
        {
          status,
          note,
        },
      );

      setEvidenceList((prev) =>
        prev.filter((item) => item._id !== evidence._id),
      );

      setReviewedList((prev) => [
        {
          ...(evidence as EvidenceWithDetails),
          ...(updatedEvidence as EvidenceWithDetails),
          status,
        },
        ...prev,
      ]);

      if (selectedEvidence?._id === evidence._id) {
        setShowModal(false);
      }
    } catch (error) {
      alert(getErrorMessage(error, "Failed to review evidence"));
    } finally {
      setActionLoadingId("");
    }
  };

  const displayList = useMemo(
    () => [...evidenceList, ...reviewedList],
    [evidenceList, reviewedList],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ImageIcon size={32} className="text-cyan-600" />
          Evidence Review
        </h1>
        <p className="text-slate-600 mt-1">Review and approve usage evidence</p>
      </div>

      {/* Pending Alert */}
      {evidenceList.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>{evidenceList.length}</strong> evidence file(s) awaiting
            review
          </p>
        </div>
      )}

      {isLoading && (
        <div className="text-center py-12 bg-slate-50 rounded-lg text-slate-600">
          Loading evidence...
        </div>
      )}

      {/* Evidence Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayList.map((evidence) => (
            <div
              key={evidence._id}
              className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
            >
              {/* Image */}
              <div className="h-40 bg-slate-200 overflow-hidden relative">
                {evidence.type === "image" ? (
                  <Image
                    src={evidence.url}
                    alt="Evidence preview"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-sm px-4 text-center">
                    {evidence.type === "video"
                      ? "Video evidence"
                      : "Document evidence"}
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
                      evidence.status,
                    )}`}
                  >
                    {evidence.status.charAt(0).toUpperCase() +
                      evidence.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-slate-600 mb-1">Booking ID</p>
                  <p className="font-semibold text-slate-900">
                    {getBookingDisplay(evidence)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">User</p>
                    <p className="font-medium text-slate-900">
                      {getUserDisplay(evidence)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Room</p>
                    <p className="font-medium text-slate-900">
                      {getRoomDisplay(evidence)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-600 mb-1">Upload Time</p>
                  <p className="text-sm text-slate-700">
                    {new Date(evidence.createdAt || "").toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
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
                        onClick={() => handleReview(evidence, "approved")}
                        disabled={actionLoadingId === evidence._id}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium disabled:opacity-50"
                      >
                        <CheckCircle size={16} />
                      </button>
                      <button
                        onClick={() => handleReview(evidence, "rejected")}
                        disabled={actionLoadingId === evidence._id}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium disabled:opacity-50"
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

      {!isLoading && displayList.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <ImageIcon size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No evidence to review</p>
        </div>
      )}

      {/* Full View Modal */}
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
              {/* Full Image */}
              <div className="w-full h-96 bg-slate-200 rounded-lg overflow-hidden">
                {selectedEvidence.type === "image" ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedEvidence.url}
                      alt="Evidence detail"
                      fill
                      unoptimized
                      className="object-contain bg-slate-100"
                    />
                  </div>
                ) : selectedEvidence.type === "video" ? (
                  <video
                    src={selectedEvidence.url}
                    controls
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <a
                      href={selectedEvidence.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      Open document evidence
                    </a>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Booking ID</p>
                  <p className="font-semibold text-slate-900">
                    {getBookingDisplay(selectedEvidence)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">User</p>
                  <p className="font-semibold text-slate-900">
                    {getUserDisplay(selectedEvidence)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Room</p>
                  <p className="font-semibold text-slate-900">
                    {getRoomDisplay(selectedEvidence)}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Upload Time</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(
                      selectedEvidence.createdAt || "",
                    ).toLocaleString()}
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
                    onClick={() => {
                      handleReview(selectedEvidence, "approved");
                    }}
                    disabled={actionLoadingId === selectedEvidence._id}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReview(selectedEvidence, "rejected");
                    }}
                    disabled={actionLoadingId === selectedEvidence._id}
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
