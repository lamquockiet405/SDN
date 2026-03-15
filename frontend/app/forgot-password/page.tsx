"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">(
    "email",
  );
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const [otpTimer, setOtpTimer] = useState(0);

  // Step 1: Email Validation and OTP Request
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/forgot-password-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setStep("otp");
        setOtpTimer(300); // 5 minutes
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Timer for OTP expiry
  useEffect(() => {
    if (otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Step 2: OTP Verification
  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const errors: Record<string, string> = {};

    if (!formData.otp) {
      errors.otp = "OTP is required";
    } else if (formData.otp.length !== 6) {
      errors.otp = "OTP must be 6 digits";
    }

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    // Verify OTP format (just check length, actual verification happens at step 3)
    setStep("password");
  };

  // Step 3: Password Reset
  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
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

    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/verify-password-reset-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: formData.otp,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setStep("success");
        setFormData({
          email: "",
          otp: "",
          newPassword: "",
          confirmPassword: "",
        });
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

  // Success Screen
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-card shadow-soft-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-block w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Password Reset Successful!
              </h1>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                Your password has been successfully reset. You can now log in
                with your new password.
              </p>
            </div>

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
              {step === "email" && "Reset Password"}
              {step === "otp" && "Verify OTP"}
              {step === "password" && "Create New Password"}
            </h1>
            <p className="text-gray-600 text-sm mt-2">
              {step === "email" && "Enter your email to receive an OTP code"}
              {step === "otp" && "Enter the 6-digit code we sent to your email"}
              {step === "password" && "Enter your new password"}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-2 mb-8">
            <div
              className={`h-2 flex-1 rounded-full transition ${step === "email" || step === "otp" || step === "password" ? "bg-primary" : "bg-gray-300"}`}
            ></div>
            <div
              className={`h-2 flex-1 rounded-full transition ${step === "otp" || step === "password" ? "bg-primary" : "bg-gray-300"}`}
            ></div>
            <div
              className={`h-2 flex-1 rounded-full transition ${step === "password" ? "bg-primary" : "bg-gray-300"}`}
            ></div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className={`w-full bg-gray-50 border rounded-button pl-12 pr-4 py-3 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                      localErrors.email
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-300 focus:border-primary"
                    }`}
                    disabled={loading}
                  />
                </div>
                {localErrors.email && (
                  <p className="text-red-600 text-xs mt-1">
                    {localErrors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-button font-semibold transition duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send OTP
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <form onSubmit={handleOTPSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    handleChange({ ...e, target: { ...e.target, value } });
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className={`w-full bg-gray-50 border rounded-button px-4 py-3 text-center text-2xl letter-spacing-wide placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition font-mono ${
                    localErrors.otp
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 focus:border-primary"
                  }`}
                  disabled={loading}
                />
                {localErrors.otp && (
                  <p className="text-red-600 text-xs mt-1">{localErrors.otp}</p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-xs">
                  {otpTimer > 0 ? (
                    <>
                      OTP expires in{" "}
                      <span className="font-bold">
                        {Math.floor(otpTimer / 60)}:
                        {(otpTimer % 60).toString().padStart(2, "0")}
                      </span>
                    </>
                  ) : (
                    <>
                      OTP has expired.{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setStep("email");
                          setFormData({ ...formData, otp: "" });
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700"
                      >
                        Request new
                      </button>
                    </>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || formData.otp.length !== 6}
                className={`w-full py-3 rounded-button font-semibold transition duration-200 flex items-center justify-center gap-2 ${
                  loading || formData.otp.length !== 6
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                Verify OTP
              </button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-2 rounded-button transition"
              >
                Change Email
              </button>
            </form>
          )}

          {/* Step 3: Password Reset */}
          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Enter new password"
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-800 mb-2"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
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

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 rounded-button font-semibold transition duration-200 flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-primary hover:bg-primary/90 text-white"
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Reset Password
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep("otp")}
                className="w-full border-2 border-primary text-primary hover:bg-primary/5 font-semibold py-2 rounded-button transition"
              >
                Back
              </button>
            </form>
          )}

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
