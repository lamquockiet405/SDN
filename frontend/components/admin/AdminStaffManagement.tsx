"use client";

import { useState } from "react";
import { UserCheck, Plus, Edit2, Trash2 } from "lucide-react";

interface Staff {
  id: string;
  name: string;
  email: string;
  role: "staff" | "manager";
  status: "active" | "inactive";
}

export default function AdminStaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([
    {
      id: "1",
      name: "Jane Smith",
      email: "jane@staff.com",
      role: "staff",
      status: "active",
    },
    {
      id: "2",
      name: "Robert Chen",
      email: "robert@staff.com",
      role: "manager",
      status: "active",
    },
    {
      id: "3",
      name: "Emily Davis",
      email: "emily@staff.com",
      role: "staff",
      status: "inactive",
    },
    {
      id: "4",
      name: "David Wilson",
      email: "david@staff.com",
      role: "staff",
      status: "active",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff" as Staff["role"],
  });

  const handleAddStaff = () => {
    if (formData.name && formData.email) {
      setStaffList([
        ...staffList,
        {
          id: Date.now().toString(),
          ...formData,
          status: "active",
        },
      ]);
      setFormData({ name: "", email: "", role: "staff" });
      setShowForm(false);
    }
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList(staffList.filter((s) => s.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setStaffList(
      staffList.map((s) =>
        s.id === id
          ? {
              ...s,
              status: s.status === "active" ? "inactive" : "active",
            }
          : s,
      ),
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck size={32} className="text-green-600" />
            Staff Management
          </h1>
          <p className="text-slate-600 mt-1">Total staff: {staffList.length}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Staff
        </button>
      </div>

      {/* Add Staff Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Add New Staff
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter staff name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Enter email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as Staff["role"],
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-700 bg-white hover:border-slate-400 transition"
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddStaff}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
              >
                Add Staff
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ name: "", email: "", role: "staff" });
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Table */}
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {staff.name}
                  </td>
                  <td className="px-6 py-4 text-slate-700">{staff.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      {staff.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        staff.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(staff.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        {staff.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(staff.id)}
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

      {staffList.length === 0 && (
        <div className="text-center py-12 bg-slate-50 rounded-lg">
          <UserCheck size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600">No staff members yet</p>
        </div>
      )}
    </div>
  );
}
