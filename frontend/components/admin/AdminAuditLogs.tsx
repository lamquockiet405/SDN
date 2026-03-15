"use client";

import { useState } from "react";
import { FileText, Filter } from "lucide-react";

interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  ipAddress: string;
  timestamp: string;
  status: "success" | "failure";
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      user: "John Doe",
      action: "CREATE",
      module: "Booking",
      ipAddress: "192.168.1.101",
      timestamp: "2025-03-15 16:30:21",
      status: "success",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "UPDATE",
      module: "Room",
      ipAddress: "192.168.1.105",
      timestamp: "2025-03-15 15:45:00",
      status: "success",
    },
    {
      id: "3",
      user: "Admin User",
      action: "DELETE",
      module: "User",
      ipAddress: "192.168.1.1",
      timestamp: "2025-03-15 14:20:15",
      status: "success",
    },
    {
      id: "4",
      user: "Mike Johnson",
      action: "LOGIN",
      module: "Authentication",
      ipAddress: "192.168.1.110",
      timestamp: "2025-03-15 13:00:00",
      status: "success",
    },
    {
      id: "5",
      user: "Unknown",
      action: "LOGIN",
      module: "Authentication",
      ipAddress: "203.0.113.45",
      timestamp: "2025-03-15 12:30:45",
      status: "failure",
    },
  ]);

  const [filterAction, setFilterAction] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchUser, setSearchUser] = useState("");

  const filteredLogs = logs.filter((log) => {
    const actionMatch = filterAction === "all" || log.action === filterAction;
    const statusMatch = filterStatus === "all" || log.status === filterStatus;
    const userMatch = log.user.toLowerCase().includes(searchUser.toLowerCase());
    return actionMatch && statusMatch && userMatch;
  });

  const actions = Array.from(new Set(logs.map((l) => l.action)));

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

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search User
          </label>
          <input
            type="text"
            placeholder="Search by username..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Action
          </label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
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
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
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
                  Module
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
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {log.user}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{log.action}</td>
                  <td className="px-6 py-4 text-slate-700">{log.module}</td>
                  <td className="px-6 py-4 text-slate-700 text-sm font-mono">
                    {log.ipAddress}
                  </td>
                  <td className="px-6 py-4 text-slate-700 text-sm">
                    {log.timestamp}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        log.status === "success"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <FileText size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No logs match the filters</p>
        </div>
      )}
    </div>
  );
}
