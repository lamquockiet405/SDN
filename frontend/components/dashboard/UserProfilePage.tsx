"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { Upload, Mail, Phone, Lock } from "lucide-react";

export default function UserProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<
    { type: "success" | "error"; text: string } | undefined
  >(undefined);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + user?.name,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // TODO: Save profile changes via API
  };

  const handlePasswordInput = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePassword = async () => {
    setPasswordMessage(undefined);

    if (!passwordForm.currentPassword) {
      setPasswordMessage({
        type: "error",
        text: "Please enter your current password.",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 6 characters.",
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword,
      );
      setPasswordMessage({
        type: "success",
        text: "Password updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setPasswordMessage({
        type: "error",
        text: error?.response?.data?.message || "Failed to update password.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-600 mt-2">
          Manage your account information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="text-center space-y-4">
            {/* Avatar */}
            <div className="relative inline-block">
              <img
                src={formData.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-slate-200"
              />
              <button className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-blue-600 transition">
                <Upload size={18} />
              </button>
            </div>

            {/* Basic Info */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {formData.name}
              </h2>
              <p className="text-slate-600">{user?.role}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-slate-200">
              <div>
                <p className="text-2xl font-bold text-primary">12</p>
                <p className="text-xs text-slate-600">Bookings</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-xs text-slate-600">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">4.8</p>
                <p className="text-xs text-slate-600">Rating</p>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-blue-600 transition font-medium"
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Account Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Email cannot be changed. Contact support if needed.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-3 text-slate-400"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                >
                  Save Changes
                </button>
              )}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Security Settings
            </h3>

            <div className="space-y-3">
              <div className="border border-slate-200 rounded-lg">
                <button
                  onClick={() => setShowChangePassword((prev) => !prev)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 transition font-medium text-slate-900 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Lock size={18} />
                    Change Password
                  </span>
                  <span className="text-slate-400">→</span>
                </button>

                {showChangePassword && (
                  <div className="px-4 pb-4 space-y-3">
                    {passwordMessage && (
                      <div
                        className={`rounded-md px-3 py-2 text-sm border ${
                          passwordMessage.type === "success"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-700"
                        }`}
                      >
                        {passwordMessage.text}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          handlePasswordInput(
                            "currentPassword",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          handlePasswordInput("newPassword", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          handlePasswordInput(
                            "confirmPassword",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <button
                      onClick={handleChangePassword}
                      disabled={isChangingPassword}
                      className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 transition font-medium"
                    >
                      {isChangingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => router.push("/dashboard/user?tab=2fa")}
                className={`w-full text-left px-4 py-3 border rounded-lg transition font-medium flex items-center justify-between ${
                  user?.isTwoFactorEnabled
                    ? "border-green-200 bg-green-50 text-green-900 hover:bg-green-100"
                    : "border-slate-200 text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{user?.isTwoFactorEnabled ? "✓" : "○"}</span>
                  {user?.isTwoFactorEnabled
                    ? "Reset Two-Factor Authentication"
                    : "Setup Two-Factor Authentication"}
                </span>
                <span
                  className={
                    user?.isTwoFactorEnabled
                      ? "text-green-600"
                      : "text-slate-400"
                  }
                >
                  →
                </span>
              </button>

              <button className="w-full text-left px-4 py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition font-medium text-slate-900 flex items-center justify-between">
                <span>Linked Accounts</span>
                <span className="text-slate-400">→</span>
              </button>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Preferences
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Email Notifications</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700">SMS Reminders</span>
                <input type="checkbox" className="w-5 h-5 rounded" />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-700">Marketing Emails</span>
                <input type="checkbox" className="w-5 h-5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
