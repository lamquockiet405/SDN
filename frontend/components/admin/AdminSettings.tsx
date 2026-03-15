"use client";

import { useState } from "react";
import { Settings, Save, Mail, Bell, Shield, Database } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    // System Settings
    systemName: "Study Room Booking System",
    maxBookingDuration: "4",
    minBookingTime: "30",
    maintenanceMode: false,

    // Email Settings
    emailNotifications: true,
    emailFrom: "noreply@studyrooms.com",
    smtpServer: "smtp.gmail.com",
    smtpPort: "587",

    // Security Settings
    requireTwoFactor: false,
    sessionTimeout: "30",
    maxLoginAttempts: "5",

    // Notification Settings
    bookingReminders: true,
    violationAlerts: true,
    systemAlerts: true,
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setSettings((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveSettings = () => {
    setSuccessMessage("Settings saved successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Settings size={32} className="text-slate-600" />
          System Settings
        </h1>
        <p className="text-slate-600 mt-1">
          Configure system-wide settings and preferences
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-800 font-medium">{successMessage}</p>
        </div>
      )}

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Database size={24} className="text-blue-600" />
          System Configuration
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              System Name
            </label>
            <input
              type="text"
              name="systemName"
              value={settings.systemName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Max Booking Duration (hours)
              </label>
              <input
                type="number"
                name="maxBookingDuration"
                value={settings.maxBookingDuration}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Min Booking Time (minutes)
              </label>
              <input
                type="number"
                name="minBookingTime"
                value={settings.minBookingTime}
                onChange={handleChange}
                min="15"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                Enable Maintenance Mode
              </span>
            </label>
            <span className="text-xs text-slate-600">
              {settings.maintenanceMode ? "ON" : "OFF"}
            </span>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Mail size={24} className="text-green-600" />
          Email Configuration
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                Enable Email Notifications
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              From Email Address
            </label>
            <input
              type="email"
              name="emailFrom"
              value={settings.emailFrom}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                SMTP Server
              </label>
              <input
                type="text"
                name="smtpServer"
                value={settings.smtpServer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                SMTP Port
              </label>
              <input
                type="number"
                name="smtpPort"
                value={settings.smtpPort}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Shield size={24} className="text-red-600" />
          Security Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="requireTwoFactor"
                checked={settings.requireTwoFactor}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                Require Two-Factor Authentication
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Session Timeout (minutes)
              </label>
              <input
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                min="5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Max Login Attempts
              </label>
              <input
                type="number"
                name="maxLoginAttempts"
                value={settings.maxLoginAttempts}
                onChange={handleChange}
                min="3"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Bell size={24} className="text-yellow-600" />
          Notification Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="bookingReminders"
                checked={settings.bookingReminders}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                Booking Reminders
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="violationAlerts"
                checked={settings.violationAlerts}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                Violation Alerts
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer flex-1">
              <input
                type="checkbox"
                name="systemAlerts"
                checked={settings.systemAlerts}
                onChange={handleChange}
                className="w-5 h-5 rounded border-slate-300"
              />
              <span className="font-semibold text-slate-700">
                System Alerts
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSaveSettings}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Settings
        </button>
      </div>
    </div>
  );
}
