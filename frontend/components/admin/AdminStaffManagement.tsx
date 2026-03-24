"use client";

import { useEffect, useState } from "react";
import { UserCheck } from "lucide-react";
import { User } from "@/types/user";
import { userService } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseData =
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: unknown }).response === "object"
      ? (
          error as {
            response?: {
              data?: { message?: string; errors?: { message?: string }[] };
            };
          }
        ).response?.data
      : undefined;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map((item) => item?.message)
      .filter(Boolean)
      .join("; ");
  }

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

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

type StaffStatus = "active" | "inactive" | "locked";

interface StaffFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  department: string;
  status: StaffStatus;
}

export default function AdminStaffManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [staffList, setStaffList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState("");
  const [editStatusLoadingId, setEditStatusLoadingId] = useState("");

  const [createForm, setCreateForm] = useState<StaffFormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    status: "active",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    status: "active" as StaffStatus,
  });

  const isCreateFormValid =
    createForm.name.trim().length >= 2 &&
    isValidEmail(createForm.email.trim()) &&
    createForm.password.length >= 6 &&
    createForm.confirmPassword.length >= 6 &&
    createForm.password === createForm.confirmPassword;

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userService.getStaff({ limit: 100, page: 1 });
      setStaffList(response.data);
    } catch (error: unknown) {
      setError(getErrorMessage(error, "Failed to load staff"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleStatus = async (userId: string, status: StaffStatus) => {
    try {
      setEditStatusLoadingId(userId);
      await userService.updateStaff(userId, { status });
      await loadStaff();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update status"));
    } finally {
      setEditStatusLoadingId("");
    }
  };

  const demoteToUser = async (userId: string) => {
    try {
      await userService.updateUserRole(userId, "user");
      await loadStaff();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update role"));
    }
  };

  const handleCreateStaff = async () => {
    if (createForm.name.trim().length < 2) {
      alert("Name must be at least 2 characters");
      return;
    }

    if (!isValidEmail(createForm.email.trim())) {
      alert("Please enter a valid email");
      return;
    }

    if (createForm.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);
      await userService.createStaff(createForm);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        department: "",
        status: "active",
      });
      await loadStaff();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to create staff"));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (staff: User) => {
    setEditingStaffId(staff.id);
    setEditForm({
      name: staff.name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      department: staff.department || "",
      status: staff.status || "active",
    });
  };

  const handleUpdateStaff = async () => {
    try {
      if (!editingStaffId) {
        return;
      }

      setSubmitting(true);
      await userService.updateStaff(editingStaffId, editForm);
      setEditingStaffId("");
      await loadStaff();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to update staff"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStaff = async (userId: string) => {
    try {
      const shouldDelete = window.confirm(
        "Delete this staff account permanently?",
      );

      if (!shouldDelete) {
        return;
      }

      await userService.deleteStaff(userId);
      await loadStaff();
    } catch (error: unknown) {
      alert(getErrorMessage(error, "Failed to delete staff"));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <UserCheck size={30} className="text-green-600" />
          Staff Management
        </h1>
        <p className="text-slate-600 mt-1">View and manage staff accounts</p>
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-4">
          Only admin can create, update, delete, or change staff decisions.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Create Staff</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            value={createForm.name}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Name"
            className="px-3 py-2 border border-slate-300 rounded"
          />
          <input
            value={createForm.email}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="Email"
            className="px-3 py-2 border border-slate-300 rounded"
          />
          <select
            value={createForm.status}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                status: event.target.value as StaffStatus,
              }))
            }
            className="px-3 py-2 border border-slate-300 rounded"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
          <input
            value={createForm.password}
            type="password"
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                password: event.target.value,
              }))
            }
            placeholder="Password"
            className="px-3 py-2 border border-slate-300 rounded"
          />
          <input
            value={createForm.confirmPassword}
            type="password"
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                confirmPassword: event.target.value,
              }))
            }
            placeholder="Confirm Password"
            className="px-3 py-2 border border-slate-300 rounded"
          />
          <input
            value={createForm.phone}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, phone: event.target.value }))
            }
            placeholder="Phone"
            className="px-3 py-2 border border-slate-300 rounded"
          />
          <input
            value={createForm.department}
            onChange={(event) =>
              setCreateForm((prev) => ({
                ...prev,
                department: event.target.value,
              }))
            }
            placeholder="Department"
            className="px-3 py-2 border border-slate-300 rounded md:col-span-2"
          />
          <button
            onClick={handleCreateStaff}
            disabled={!isAdmin || submitting || !isCreateFormValid}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Create
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={5}>
                  Loading staff...
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-slate-600" colSpan={5}>
                  No staff members found.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {editingStaffId === staff.id ? (
                      <input
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                          }))
                        }
                        className="px-2 py-1 border border-slate-300 rounded w-full"
                      />
                    ) : (
                      staff.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {editingStaffId === staff.id ? (
                      <input
                        value={editForm.email}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                          }))
                        }
                        className="px-2 py-1 border border-slate-300 rounded w-full"
                      />
                    ) : (
                      staff.email
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{staff.role}</td>
                  <td className="px-4 py-3">
                    {editingStaffId === staff.id ? (
                      <select
                        value={editForm.status}
                        onChange={(event) =>
                          setEditForm((prev) => ({
                            ...prev,
                            status: event.target.value as StaffStatus,
                          }))
                        }
                        className="px-2 py-1 border border-slate-300 rounded"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="locked">Locked</option>
                      </select>
                    ) : (
                      <select
                        value={staff.status || "active"}
                        disabled={!isAdmin || editStatusLoadingId === staff.id}
                        onChange={(event) =>
                          handleStatus(
                            staff.id,
                            event.target.value as StaffStatus,
                          )
                        }
                        className="px-2 py-1 border border-slate-300 rounded"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="locked">Locked</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 space-x-2 whitespace-nowrap">
                    {editingStaffId === staff.id ? (
                      <>
                        <button
                          onClick={handleUpdateStaff}
                          disabled={submitting}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingStaffId("")}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(staff)}
                          disabled={!isAdmin}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => demoteToUser(staff.id)}
                          disabled={!isAdmin}
                          className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                        >
                          Demote
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          disabled={!isAdmin}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </>
                    )}
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
