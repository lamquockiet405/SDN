"use client";

import { useState } from "react";
import { Users, Plus, Edit2, Trash2, Lock, Unlock, Eye } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "staff" | "admin";
  status: "active" | "suspended" | "banned";
  createdDate: string;
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@student.com",
      role: "user",
      status: "active",
      createdDate: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@student.com",
      role: "user",
      status: "active",
      createdDate: "2024-02-20",
    },
    {
      id: "3",
      name: "Mike Johnson",
      email: "mike@student.com",
      role: "user",
      status: "suspended",
      createdDate: "2024-03-10",
    },
    {
      id: "4",
      name: "Sarah Williams",
      email: "sarah@student.com",
      role: "user",
      status: "banned",
      createdDate: "2023-12-05",
    },
    {
      id: "5",
      name: "Tom Brown",
      email: "tom@student.com",
      role: "user",
      status: "active",
      createdDate: "2024-01-25",
    },
  ]);

  const [filterStatus, setFilterStatus] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState<User["status"]>("active");
  const [newRole, setNewRole] = useState<User["role"]>("user");

  const filteredUsers = users.filter((u) => {
    const statusMatch = filterStatus === "all" || u.status === filterStatus;
    const roleMatch = filterRole === "all" || u.role === filterRole;
    const searchMatch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && roleMatch && searchMatch;
  });

  const handleChangeStatus = (userId: string, status: User["status"]) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status } : u)));
  };

  const handleChangeRole = (userId: string, role: User["role"]) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, role } : u)));
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  const statusColors = {
    active: "bg-green-100 text-green-700",
    suspended: "bg-yellow-100 text-yellow-700",
    banned: "bg-red-100 text-red-700",
  };

  const roleColors = {
    user: "bg-blue-100 text-blue-700",
    staff: "bg-purple-100 text-purple-700",
    admin: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Users size={32} className="text-blue-600" />
            User Management
          </h1>
          <p className="text-slate-600 mt-1">Total users: {users.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-wrap gap-4">
        <div className="flex-1 min-w-64">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
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
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Role
          </label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Created Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleChangeRole(
                          user.id,
                          e.target.value as User["role"],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                        roleColors[user.role]
                      } cursor-pointer`}
                    >
                      <option value="user">User</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) =>
                        handleChangeStatus(
                          user.id,
                          e.target.value as User["status"],
                        )
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${
                        statusColors[user.status]
                      } cursor-pointer`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {user.createdDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        <Eye size={18} />
                      </button>
                      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <Users size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No users found</p>
        </div>
      )}

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">User Profile</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Name</p>
                <p className="font-semibold text-slate-900">
                  {selectedUser.name}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Email</p>
                <p className="font-semibold text-slate-900">
                  {selectedUser.email}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Role</p>
                  <p
                    className={`font-semibold px-2 py-1 rounded inline-block text-xs ${
                      roleColors[selectedUser.role]
                    }`}
                  >
                    {selectedUser.role}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm text-slate-600 mb-1">Status</p>
                  <p
                    className={`font-semibold px-2 py-1 rounded inline-block text-xs ${
                      statusColors[selectedUser.status]
                    }`}
                  >
                    {selectedUser.status}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">Created Date</p>
                <p className="font-semibold text-slate-900">
                  {selectedUser.createdDate}
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium">
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
