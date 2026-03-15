"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { User } from "@/types/user";
import { Search, Eye, Trash2, Shield } from "lucide-react";
import { useState } from "react";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<(User & { lastActive: string })[]>([
    {
      id: "1",
      email: "john@example.com",
      name: "John Doe",
      role: "user",
      createdAt: "2024-01-15",
      lastActive: "2024-03-20",
    },
    {
      id: "2",
      email: "jane@example.com",
      name: "Jane Smith",
      role: "admin",
      createdAt: "2024-01-10",
      lastActive: "2024-03-20",
    },
    {
      id: "3",
      email: "mike@example.com",
      name: "Mike Johnson",
      role: "user",
      createdAt: "2024-02-20",
      lastActive: "2024-03-19",
    },
    {
      id: "4",
      email: "sarah@example.com",
      name: "Sarah Williams",
      role: "user",
      createdAt: "2024-03-01",
      lastActive: "2024-03-18",
    },
  ]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteUser = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleToggleAdmin = (id: string) => {
    setUsers(
      users.map((u) =>
        u.id === id ? { ...u, role: u.role === "admin" ? "user" : "admin" } : u,
      ),
    );
  };

  return (
    <DashboardLayout title="Users Management">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-gray-900">{users.length}</p>
          </div>

          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <h3 className="text-gray-600 text-sm font-medium mb-2">Admins</h3>
            <p className="text-3xl font-bold text-gray-900">
              {users.filter((u) => u.role === "admin").length}
            </p>
          </div>

          <div className="bg-white rounded-card p-6 shadow-soft-md">
            <h3 className="text-gray-600 text-sm font-medium mb-2">
              Regular Users
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {users.filter((u) => u.role === "user").length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-card shadow-soft-md p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-card shadow-soft-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Joined
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Last Active
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {user.name}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {new Date(user.lastActive).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAdmin(user.id)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                          title="Toggle admin role"
                        >
                          <Shield size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-danger hover:bg-red-50 rounded-lg transition"
                          title="Delete user"
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

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-card">
            <Search size={48} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-gray-900 font-semibold mb-1">No users found</h3>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
