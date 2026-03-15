"use client";

import { useState } from "react";
import { Image, CheckCircle, XCircle, Eye } from "lucide-react";

interface Evidence {
  id: string;
  bookingId: string;
  user: string;
  room: string;
  image: string;
  uploadTime: string;
  status: "pending" | "approved" | "rejected";
}

export default function AdminEvidenceReview() {
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([
    {
      id: "e1",
      bookingId: "b1",
      user: "John Doe",
      room: "Study Room A",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
      uploadTime: "2025-03-15 16:30",
      status: "pending",
    },
    {
      id: "e2",
      bookingId: "b2",
      user: "Jane Smith",
      room: "Lab Room B",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      uploadTime: "2025-03-15 12:15",
      status: "approved",
    },
    {
      id: "e3",
      bookingId: "b3",
      user: "Mike Johnson",
      room: "Meeting Room C",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
      uploadTime: "2025-03-14 18:45",
      status: "pending",
    },
  ]);

  const [selectedEvidence, setSelectedEvidence] = useState<Evidence | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  const handleApprove = (id: string) => {
    setEvidenceList(
      evidenceList.map((e) => (e.id === id ? { ...e, status: "approved" } : e)),
    );
  };

  const handleReject = (id: string) => {
    setEvidenceList(
      evidenceList.map((e) => (e.id === id ? { ...e, status: "rejected" } : e)),
    );
  };

  const pendingEvidence = evidenceList.filter((e) => e.status === "pending");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Image size={32} className="text-cyan-600" />
          Evidence Review
        </h1>
        <p className="text-slate-600 mt-1">Review and approve usage evidence</p>
      </div>

      {/* Pending Alert */}
      {pendingEvidence.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>{pendingEvidence.length}</strong> evidence file(s) awaiting
            review
          </p>
        </div>
      )}

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evidenceList.map((evidence) => (
          <div
            key={evidence.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition"
          >
            {/* Image */}
            <div className="h-40 bg-slate-200 overflow-hidden relative">
              <img
                src={evidence.image}
                alt="Evidence"
                className="w-full h-full object-cover"
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
                  {evidence.bookingId}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-xs text-slate-600">User</p>
                  <p className="font-medium text-slate-900">{evidence.user}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Room</p>
                  <p className="font-medium text-slate-900">{evidence.room}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-600 mb-1">Upload Time</p>
                <p className="text-sm text-slate-700">{evidence.uploadTime}</p>
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
                      onClick={() => handleApprove(evidence.id)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium"
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleReject(evidence.id)}
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

      {evidenceList.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Image size={48} className="mx-auto text-slate-400 mb-4" />
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
                <img
                  src={selectedEvidence.image}
                  alt="Evidence"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
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
                    {selectedEvidence.user}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Room</p>
                  <p className="font-semibold text-slate-900">
                    {selectedEvidence.room}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Upload Time</p>
                  <p className="font-semibold text-slate-900">
                    {selectedEvidence.uploadTime}
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
                      handleApprove(selectedEvidence.id);
                      setShowModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedEvidence.id);
                      setShowModal(false);
                    }}
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
