"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { User } from "@/types/user";
import { userService } from "@/services/userService";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers({
        search,
        page: 1,
        limit: 100,
      });
      setUsers(response.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <DashboardLayout title="Users Management">
      <div className="space-y-6">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            loadUsers();
          }}
          className="bg-white rounded-card shadow-soft-md p-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search users by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn"
            />
          </div>
        </form>

        <div className="bg-white rounded-card shadow-soft-md overflow-hidden">
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
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="py-4 px-6 text-gray-600" colSpan={4}>
                    Loading users...
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {user.name}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{user.email}</td>
                    <td className="py-4 px-6 text-gray-600">{user.role}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {user.status || "active"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
