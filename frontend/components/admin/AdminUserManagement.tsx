"use client";

import { useEffect, useState } from "react";
import { Users, Eye } from "lucide-react";
import { User } from "@/types/user";
import { userService } from "@/services/userService";

export default function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDepartment, setEditDepartment] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await userService.getUsers({
        search,
        status:
          status === "all"
            ? undefined
            : (status as "active" | "inactive" | "locked"),
        page: 1,
        limit: 100,
      });
      setUsers(result.data.filter((item) => item.role !== "admin"));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [status]);

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    await loadUsers();
  };

  const handleStatusChange = async (
    userId: string,
    nextStatus: "active" | "inactive" | "locked",
  ) => {
    try {
      await userService.updateUserStatus(userId, nextStatus);
      await loadUsers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update status");
    }
  };

  const openProfile = async (userId: string) => {
    try {
      const profile = await userService.getUserProfile(userId);
      setSelectedUser(profile);
      setEditName(profile.name || "");
      setEditPhone(profile.phone || "");
      setEditDepartment(profile.department || "");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to load profile");
    }
  };

  const saveProfile = async () => {
    if (!selectedUser) return;

    try {
      await userService.updateUserProfile(selectedUser.id, {
        name: editName,
        phone: editPhone,
        department: editDepartment,
      });
      await loadUsers();
      setSelectedUser(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Users size={30} className="text-blue-600" />
          User Management
        </h1>
        <p className="text-slate-600 mt-1">Manage users and status</p>
      </div>

      <form
        onSubmit={handleSearch}
        className="bg-white rounded-lg border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by name or email"
          className="px-3 py-2 border border-slate-300 rounded-lg"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="locked">Locked</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Violations</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={5}>
                  Loading users...
                </td>
              </tr>
            ) : (
              users.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={item.status || "active"}
                      onChange={(event) =>
                        handleStatusChange(
                          item.id,
                          event.target.value as
                            | "active"
                            | "inactive"
                            | "locked",
                        )
                      }
                      className="px-2 py-1 border border-slate-300 rounded"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="locked">Locked</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.violationCount || 0}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openProfile(item.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Edit Profile</h2>
            <input
              value={editName}
              onChange={(event) => setEditName(event.target.value)}
              placeholder="Full name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <input
              value={editPhone}
              onChange={(event) => setEditPhone(event.target.value)}
              placeholder="Phone"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <input
              value={editDepartment}
              onChange={(event) => setEditDepartment(event.target.value)}
              placeholder="Department"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
