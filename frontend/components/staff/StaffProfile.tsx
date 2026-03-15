"use client";

import { useState } from "react";
import {
  Mail,
  Lock,
  Phone,
  Building,
  Calendar,
  Shield,
  Save,
} from "lucide-react";

export default function StaffProfile() {
  const [profileData, setProfileData] = useState({
    name: "Admin Staff",
    email: "admin@studyrooms.com",
    phone: "+1 (555) 123-4567",
    department: "Management",
    joinDate: "2024-01-15",
    role: "Admin",
    status: "Active",
    password: "",
    confirmPassword: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setSuccessMessage("Profile updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    if (profileData.password !== profileData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setSuccessMessage("Password changed successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
    setShowPasswordForm(false);
    setProfileData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Staff Profile</h1>
        <p className="text-slate-600 mt-1">
          Manage your profile and account settings
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-700"></div>

        <div className="px-6 pb-6">
          <div className="flex justify-between items-start -mt-16 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white shadow-lg">
                AS
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {profileData.name}
                </h2>
                <p className="text-slate-600">{profileData.role}</p>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Information */}
          {!isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Mail size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Email</p>
                    <p className="text-slate-900">{profileData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Phone size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Phone</p>
                    <p className="text-slate-900">{profileData.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Building size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">
                      Department
                    </p>
                    <p className="text-slate-900">{profileData.department}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">
                      Join Date
                    </p>
                    <p className="text-slate-900">{profileData.joinDate}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <Shield size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Role</p>
                    <p className="text-slate-900">{profileData.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="w-5 h-5 rounded-full bg-green-500"></div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium">Status</p>
                    <p className="text-slate-900">{profileData.status}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Edit Form */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={profileData.department}
                    onChange={handleProfileChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSaveProfile}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Changes
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Lock size={24} className="text-red-600" />
              Security Settings
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Manage your password and account security
            </p>
          </div>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Change Password
          </button>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="password"
                value={profileData.password}
                onChange={handleProfileChange}
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={profileData.confirmPassword}
                onChange={handleProfileChange}
                placeholder="Confirm password"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Update Password
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setProfileData((prev) => ({
                    ...prev,
                    password: "",
                    confirmPassword: "",
                  }));
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">
          Account Information
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium">Account Type</span>
            <span className="text-slate-900 font-semibold">
              Staff/Administrator
            </span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium">Account Status</span>
            <span className="text-slate-900 font-semibold">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Active
            </span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium">Last Activity</span>
            <span className="text-slate-900 font-semibold">Today, 2:30 PM</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600 font-medium">Two-Factor Auth</span>
            <span className="text-yellow-600 font-semibold">Not Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}
