"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { ViolatedUser, userService } from "@/services/userService";

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

export default function AdminViolations() {
  const [items, setItems] = useState<ViolatedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userService.getViolatedUsers({
        status: "active",
        page: 1,
        limit: 100,
      });
      setItems(response.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load violations"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleWarn = async (entry: ViolatedUser) => {
    try {
      await userService.createViolation({
        userId: entry.id,
        reason: `Warning follow-up for previous violation: ${entry.latestReason}`,
        severity: "low",
      });
      await load();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to warn user"));
    }
  };

  const handleLock = async (entry: ViolatedUser) => {
    try {
      await userService.updateUserStatus(entry.id, "locked");
      await load();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to lock user"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle size={30} className="text-red-600" />
          Violations
        </h1>
        <p className="text-slate-600 mt-1">
          Auto-detect no-show users (over start time without check-in) and view
          all active violations
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3">User</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Violations</th>
              <th className="text-left px-4 py-3">Severity</th>
              <th className="text-left px-4 py-3">Latest Reason</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={6}>
                  Loading violations...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={6}>
                  No active violations.
                </td>
              </tr>
            ) : (
              items.map((entry) => (
                <tr key={entry.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {entry.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{entry.email}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {entry.violationCount}
                  </td>
                  <td className="px-4 py-3 text-slate-700 capitalize">
                    {entry.severity}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {entry.latestReason}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    <button
                      onClick={() => handleWarn(entry)}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      Warn
                    </button>
                    <button
                      onClick={() => handleLock(entry)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Lock
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
