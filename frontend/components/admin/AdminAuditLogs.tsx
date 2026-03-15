"use client";

import { useState, useEffect } from "react";
import { FileText, Loader, AlertCircle, Search } from "lucide-react";
import { auditService, AuditLog } from "@/services/auditService";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter states
  const [filterAction, setFilterAction] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchUser, setSearchUser] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const ITEMS_PER_PAGE = 20;

  // Fetch logs when filters change
  useEffect(() => {
    fetchLogs();
  }, [currentPage, filterAction, filterStatus, searchUser, startDate, endDate]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      // Add filters if specified
      if (filterAction !== "all") {
        params.action = filterAction;
      }
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      if (startDate) {
        params.startDate = startDate;
      }
      if (endDate) {
        params.endDate = endDate;
      }

      const response = await auditService.searchAuditLogs(params);

      setLogs(response.logs);
      setTotalPages(response.pages);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || "Failed to fetch audit logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setFilterAction("all");
    setFilterStatus("all");
    setSearchUser("");
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
  };

  const actions = [
    "LOGIN",
    "LOGOUT",
    "REGISTER",
    "PASSWORD_RESET",
    "DELETE_ACCOUNT",
    "2FA_ENABLE",
    "2FA_DISABLE",
    "GOOGLE_LOGIN",
    "REFRESH_TOKEN",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <FileText size={32} className="text-slate-600" />
          Audit Logs
        </h1>
        <p className="text-slate-600 mt-1">System activity and user actions</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle
            className="text-red-600 mt-0.5 flex-shrink-0"
            size={20}
          />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Search size={18} />
            Search & Filter
          </h3>
          {(searchUser ||
            filterAction !== "all" ||
            filterStatus !== "all" ||
            startDate ||
            endDate) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Search User
            </label>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={searchUser}
              onChange={(e) => {
                setSearchUser(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Action
            </label>
            <select
              value={filterAction}
              onChange={(e) => {
                setFilterAction(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
            >
              <option value="all">All Actions</option>
              {actions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:bg-slate-400 transition font-medium"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {!loading && logs.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
          Showing {logs.length} of {total} logs (Page {currentPage} of{" "}
          {totalPages})
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-slate-600 mr-2" size={24} />
            <span className="text-slate-600">Loading audit logs...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">
                        {log.userId.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.userId.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm font-mono bg-slate-50">
                      {log.ipAddress}
                    </td>
                    <td className="px-6 py-4 text-slate-700 text-sm">
                      {new Date(log.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          log.status === "success"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {log.status === "success" ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {logs.length === 0 && !loading && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">
            {error ? "Failed to load logs" : "No audit logs found"}
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <div className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white transition"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:text-slate-400 disabled:hover:bg-white transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
