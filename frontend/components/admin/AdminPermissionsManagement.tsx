"use client";

import { useEffect, useState } from "react";
import { Lock, Save } from "lucide-react";
import { RolePermission, userService } from "@/services/userService";

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

export default function AdminPermissionsManagement() {
  const [roles, setRoles] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await userService.getPermissions();
      setRoles(data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load permissions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  const updatePermissionText = (role: string, value: string) => {
    setRoles((prev) =>
      prev.map((item) =>
        item.role === role
          ? {
              ...item,
              permissions: value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            }
          : item,
      ),
    );
  };

  const saveRole = async (item: RolePermission) => {
    try {
      setSavingRole(item.role);
      await userService.updatePermissions(item.role, item.permissions);
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update permissions"));
    } finally {
      setSavingRole(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Lock size={30} className="text-indigo-600" />
          Permissions Management
        </h1>
        <p className="text-slate-600 mt-1">
          Manage permission mappings by role
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-slate-600">Loading role permissions...</div>
      ) : (
        <div className="space-y-4">
          {roles.map((roleItem) => (
            <div
              key={roleItem.role}
              className="bg-white rounded-lg border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 uppercase">
                  {roleItem.role}
                </h2>
                <button
                  onClick={() => saveRole(roleItem)}
                  disabled={
                    savingRole === roleItem.role || roleItem.role === "admin"
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center gap-2"
                >
                  <Save size={16} />
                  {savingRole === roleItem.role ? "Saving..." : "Save"}
                </button>
              </div>

              <p className="text-sm text-slate-600">One permission per line</p>

              {roleItem.role === "admin" && (
                <p className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-3 py-2">
                  Admin permissions are fixed as full system access.
                </p>
              )}

              <textarea
                value={roleItem.permissions.join("\n")}
                onChange={(event) =>
                  updatePermissionText(roleItem.role, event.target.value)
                }
                disabled={roleItem.role === "admin"}
                className="w-full min-h-40 px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
