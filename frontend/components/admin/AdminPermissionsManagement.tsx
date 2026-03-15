"use client";

import { useState } from "react";
import { Lock, Edit2, Save, X } from "lucide-react";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export default function AdminPermissionsManagement() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "1",
      name: "Admin",
      permissions: [
        "p1",
        "p2",
        "p3",
        "p4",
        "p5",
        "p6",
        "p7",
        "p8",
        "p9",
        "p10",
      ],
    },
    {
      id: "2",
      name: "Staff",
      permissions: ["p2", "p3", "p4", "p5", "p6"],
    },
    {
      id: "3",
      name: "User",
      permissions: ["p2", "p4"],
    },
  ]);

  const permissions: Permission[] = [
    {
      id: "p1",
      name: "Manage Rooms",
      description: "Create, edit, delete rooms",
    },
    {
      id: "p2",
      name: "View Bookings",
      description: "View all booking information",
    },
    {
      id: "p3",
      name: "Approve Bookings",
      description: "Approve or reject pending bookings",
    },
    { id: "p4", name: "Create Bookings", description: "Create new bookings" },
    {
      id: "p5",
      name: "Manage Users",
      description: "Manage user accounts and permissions",
    },
    {
      id: "p6",
      name: "Manage Staff",
      description: "Manage staff accounts",
    },
    {
      id: "p7",
      name: "View Audit Logs",
      description: "Access system audit logs",
    },
    {
      id: "p8",
      name: "Manage Evidence",
      description: "Review and approve usage evidence",
    },
    {
      id: "p9",
      name: "Manage Ratings",
      description: "Manage user feedback and ratings",
    },
    {
      id: "p10",
      name: "System Settings",
      description: "Modify system-wide settings",
    },
  ];

  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [editedPermissions, setEditedPermissions] = useState<string[]>([]);

  const handleEditRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role) {
      setEditingRole(roleId);
      setEditedPermissions([...role.permissions]);
    }
  };

  const handlePermissionToggle = (permId: string) => {
    if (editedPermissions.includes(permId)) {
      setEditedPermissions(editedPermissions.filter((p) => p !== permId));
    } else {
      setEditedPermissions([...editedPermissions, permId]);
    }
  };

  const handleSavePermissions = () => {
    setRoles(
      roles.map((r) =>
        r.id === editingRole ? { ...r, permissions: editedPermissions } : r,
      ),
    );
    setEditingRole(null);
    setEditedPermissions([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Lock size={32} className="text-indigo-600" />
          Permissions Management
        </h1>
        <p className="text-slate-600 mt-1">
          Manage role-based permissions and access control
        </p>
      </div>

      {/* Roles */}
      <div className="space-y-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">{role.name}</h2>
              {editingRole === role.id ? (
                <div className="flex gap-2">
                  <button
                    onClick={handleSavePermissions}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    <Save size={18} />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingRole(null);
                      setEditedPermissions([]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditRole(role.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  <Edit2 size={18} />
                  Edit
                </button>
              )}
            </div>

            {/* Permissions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {permissions.map((perm) => {
                const isGranted =
                  editingRole === role.id
                    ? editedPermissions.includes(perm.id)
                    : role.permissions.includes(perm.id);

                return (
                  <div
                    key={perm.id}
                    className={`p-4 rounded-lg border-2 transition cursor-pointer ${
                      isGranted
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}
                    onClick={() => {
                      if (editingRole === role.id) {
                        handlePermissionToggle(perm.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded border-2 mt-1 flex items-center justify-center ${
                          isGranted
                            ? "bg-green-500 border-green-500"
                            : "border-slate-300"
                        }`}
                      >
                        {isGranted && (
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {perm.name}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">
                          {perm.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
