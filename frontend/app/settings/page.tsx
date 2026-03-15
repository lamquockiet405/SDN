"use client";

import { DashboardLayout } from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { useState } from "react";
import {
  User as UserIcon,
  Lock,
  Bell,
  Shield,
  Save,
  AlertCircle,
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+1 (555) 000-0000",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    bookingReminders: true,
    weeklyDigest: false,
    darkMode: false,
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleSecurityChange = (field: string, value: string) => {
    setSecurityData({ ...securityData, [field]: value });
  };

  const handlePreferencesChange = (field: string, value: boolean) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage("Profile updated successfully!");
    setIsSaving(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleChangePassword = async () => {
    setErrorMessage("");

    if (securityData.newPassword !== securityData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    if (securityData.newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters!");
      return;
    }

    setIsSaving(true);
    try {
      await authService.changePassword(
        securityData.currentPassword,
        securityData.newPassword,
        securityData.confirmPassword,
      );
      setSuccessMessage("Password changed successfully!");
      setSecurityData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      setErrorMessage(
        error?.response?.data?.message || "Failed to change password",
      );
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccessMessage(""), 3000);
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccessMessage("Preferences saved successfully!");
    setIsSaving(false);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <DashboardLayout title="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-card shadow-soft-md p-4 sticky top-24">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-btn text-left transition ${
                  activeTab === "profile"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <UserIcon size={20} />
                <span>Profile</span>
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-btn text-left transition ${
                  activeTab === "security"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Lock size={20} />
                <span>Security</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-btn text-left transition ${
                  activeTab === "notifications"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Bell size={20} />
                <span>Notifications</span>
              </button>
              <button
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-btn text-left transition ${
                  activeTab === "privacy"
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Shield size={20} />
                <span>Privacy</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <AlertCircle className="text-success flex-shrink-0" size={20} />
              <p className="text-success font-medium">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-600 font-medium">{errorMessage}</p>
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-white rounded-card shadow-soft-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Profile Settings
              </h2>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      handleProfileChange("name", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      handleProfileChange("email", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      handleProfileChange("phone", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-btn transition"
                >
                  <Save size={20} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="bg-white rounded-card shadow-soft-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Security Settings
              </h2>

              <div className="space-y-6">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) =>
                      handleSecurityChange("currentPassword", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      handleSecurityChange("newPassword", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      handleSecurityChange("confirmPassword", e.target.value)
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Change Password Button */}
                <button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-btn transition"
                >
                  <Lock size={20} />
                  {isSaving ? "Changing..." : "Change Password"}
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="bg-white rounded-card shadow-soft-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-btn">
                  <div>
                    <p className="font-medium text-gray-900">
                      Email Notifications
                    </p>
                    <p className="text-sm text-gray-500">
                      Receive email updates about your bookings
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) =>
                      handlePreferencesChange(
                        "emailNotifications",
                        e.target.checked,
                      )
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                {/* Booking Reminders */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-btn">
                  <div>
                    <p className="font-medium text-gray-900">
                      Booking Reminders
                    </p>
                    <p className="text-sm text-gray-500">
                      Get reminders before your bookings
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.bookingReminders}
                    onChange={(e) =>
                      handlePreferencesChange(
                        "bookingReminders",
                        e.target.checked,
                      )
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                {/* Weekly Digest */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-btn">
                  <div>
                    <p className="font-medium text-gray-900">Weekly Digest</p>
                    <p className="text-sm text-gray-500">
                      Receive a weekly summary of your activity
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.weeklyDigest}
                    onChange={(e) =>
                      handlePreferencesChange("weeklyDigest", e.target.checked)
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSavePreferences}
                  disabled={isSaving}
                  className="mt-6 flex items-center gap-2 px-6 py-2 bg-primary hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-btn transition"
                >
                  <Save size={20} />
                  {isSaving ? "Saving..." : "Save Preferences"}
                </button>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="bg-white rounded-card shadow-soft-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Privacy Settings
              </h2>

              <div className="space-y-6">
                <p className="text-gray-700">
                  Your data is protected according to our privacy policy. You
                  can manage how your information is used below.
                </p>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-btn">
                    <p className="font-medium text-gray-900 mb-2">
                      Profile Visibility
                    </p>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="private">Private</option>
                      <option value="booking-only">
                        Visible to booking partners only
                      </option>
                      <option value="public">Public</option>
                    </select>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-btn">
                    <p className="font-medium text-gray-900 mb-2">
                      Data Collection
                    </p>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-700">
                        Allow usage analytics to improve our service
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="text-danger hover:text-red-700 font-medium">
                    Delete Account & Data
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    This action is permanent and cannot be undone
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
