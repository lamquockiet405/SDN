"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError(
        "Invalid or missing reset token. Please request a new password reset.",
      );
    }
  }, [token]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.newPassword) {
      errors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (localErrors[name]) {
      setLocalErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    if (!token) {
      setError("Invalid reset token. Please request a new password reset.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setFormData({ newPassword: "", confirmPassword: "" });
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-card shadow-soft-lg p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="inline-block w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Password Reset Successful!
              </h1>
            </div>

            {/* Success Message */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>
            </div>

            {/* Login Button */}
            <Link href="/login">
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-button transition duration-200 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-card shadow-soft-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl mb-4">
              SH
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Reset Your Password
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              Enter your new password below to regain access to your account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* New Password Input */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  className={`w-full bg-gray-50 border rounded-button pl-12 pr-12 py-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                    localErrors.newPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-primary"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {localErrors.newPassword && (
                <p className="text-red-600 text-xs mt-1">
                  {localErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-800 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  className={`w-full bg-gray-50 border rounded-button pl-12 pr-12 py-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                    localErrors.confirmPassword
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-primary"
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {localErrors.confirmPassword && (
                <p className="text-red-600 text-xs mt-1">
                  {localErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-900 text-xs font-medium mb-2">
                Password requirements:
              </p>
              <ul className="space-y-1 text-blue-800 text-xs">
                <li className="flex gap-2">
                  <span>✓</span>
                  <span>At least 6 characters long</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className={`w-full py-3 rounded-button font-semibold transition duration-200 flex items-center justify-center gap-2 ${
                loading || !token
                  ? "bg-gray-300 cursor-not-allowed text-gray-600"
                  : "bg-primary hover:bg-primary/90 text-white"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Resetting...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-600 text-xs font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Back to Login */}
          <Link href="/login">
            <button className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-3 rounded-button transition duration-200 flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
