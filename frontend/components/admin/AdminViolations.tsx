"use client";

import { useState } from "react";
import { AlertTriangle, AlertCircle, Eye } from "lucide-react";

interface Violation {
  id: string;
  user: string;
  violationCount: number;
  lastViolation: string;
  reason: string;
  severity: "low" | "medium" | "high";
  status: "active" | "resolved";
}

export default function AdminViolations() {
  const [violations, setViolations] = useState<Violation[]>([
    {
      id: "1",
      user: "John Doe",
      violationCount: 1,
      lastViolation: "2025-03-15",
      reason: "Left room without proper checkout",
      severity: "low",
      status: "resolved",
    },
    {
      id: "2",
      user: "Jane Smith",
      violationCount: 2,
      lastViolation: "2025-03-14",
      reason: "Exceeded booking time limit",
      severity: "medium",
      status: "active",
    },
    {
      id: "3",
      user: "Mike Johnson",
      violationCount: 3,
      lastViolation: "2025-03-15",
      reason: "Damaged room equipment",
      severity: "high",
      status: "active",
    },
    {
      id: "4",
      user: "Sarah Williams",
      violationCount: 1,
      lastViolation: "2025-03-10",
      reason: "Noise complaint",
      severity: "low",
      status: "resolved",
    },
  ]);

  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  const handleWarnUser = (id: string) => {
    alert(`Warning sent to user`);
  };

  const handleSuspendUser = (id: string) => {
    setViolations(
      violations.map((v) => (v.id === id ? { ...v, status: "active" } : v)),
    );
  };

  const severityColors = {
    low: "bg-blue-100 text-blue-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={32} className="text-red-600" />
          Violations
        </h1>
        <p className="text-slate-600 mt-1">
          Monitor and manage user violations
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-semibold mb-1">
            Active Violations
          </p>
          <p className="text-2xl font-bold text-red-900">
            {violations.filter((v) => v.status === "active").length}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600 font-semibold mb-1">Resolved</p>
          <p className="text-2xl font-bold text-green-900">
            {violations.filter((v) => v.status === "resolved").length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600 font-semibold mb-1">
            High Severity
          </p>
          <p className="text-2xl font-bold text-orange-900">
            {violations.filter((v) => v.severity === "high").length}
          </p>
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Violation Count
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Last Violation
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {violations.map((violation) => (
                <tr key={violation.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {violation.user}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-slate-200 text-slate-700">
                      {violation.violationCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {violation.lastViolation}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        severityColors[violation.severity]
                      }`}
                    >
                      {violation.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        violation.status === "active"
                          ? "bg-red-100 text-red-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {violation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedViolation(violation);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleWarnUser(violation.id)}
                        className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition"
                      >
                        Warn
                      </button>
                      <button
                        onClick={() => handleSuspendUser(violation.id)}
                        className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        Suspend
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {violations.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <AlertTriangle size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No violations recorded</p>
        </div>
      )}

      {/* Violation Details Modal */}
      {showModal && selectedViolation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <AlertCircle size={24} className="text-red-600" />
                Violation Details
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">User</p>
                <p className="font-semibold text-slate-900">
                  {selectedViolation.user}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Violation Count</p>
                  <p className="font-semibold text-slate-900">
                    {selectedViolation.violationCount}
                  </p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Last Violation</p>
                  <p className="font-semibold text-slate-900">
                    {selectedViolation.lastViolation}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Reason</p>
                <p className="font-semibold text-slate-900">
                  {selectedViolation.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Severity</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      severityColors[selectedViolation.severity]
                    }`}
                  >
                    {selectedViolation.severity}
                  </span>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      selectedViolation.status === "active"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedViolation.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleWarnUser(selectedViolation.id);
                  setShowModal(false);
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
              >
                Warn User
              </button>
              <button
                onClick={() => {
                  handleSuspendUser(selectedViolation.id);
                  setShowModal(false);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Suspend User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
