"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, LogIn, AlertCircle } from "lucide-react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  // Load and initialize Google Sign-In script
  useEffect(() => {
    const initGoogleSignIn = () => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google) {
          try {
            window.google.accounts.id.initialize({
              client_id:
                process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
                "797033632184-0c6rp5302uog5gb7gjue2j0a56ufnpq3.apps.googleusercontent.com",
              callback: handleGoogleLogin,
              auto_select: false,
            });

            // Render button in the google-button container
            window.google.accounts.id.renderButton(
              document.getElementById("google-button"),
              {
                type: "standard",
                theme: "outline",
                size: "large",
                width: "100%",
              },
            );
          } catch (err) {
            console.error("Google initialization error:", err);
          }
        }
      };

      document.head.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    };

    initGoogleSignIn();
  }, []);

  const handleGoogleLogin = async (response: any) => {
    clearError();

    try {
      if (!response.credential) {
        throw new Error("No credential received from Google");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: response.credential,
          }),
        },
      );

      const data = await res.json();
      console.log("Google login response:", data);

      if (!res.ok) {
        throw new Error(
          data.message || `Login failed with status ${res.status}`,
        );
      }

      if (data.success) {
        // Store tokens FIRST
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));

        console.log("Tokens stored, user role:", data.user?.role);

        // Wait a tiny bit to ensure localStorage is written
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect based on role
        if (data.user?.role === "admin") {
          window.location.href = "/dashboard/admin";
        } else if (data.user?.role === "staff") {
          window.location.href = "/dashboard/staff";
        } else {
          window.location.href = "/dashboard/user";
        }
      } else {
        throw new Error(
          data.message || "Google login failed - no success flag",
        );
      }
    } catch (err: any) {
      console.error("Google login error:", err);
      alert(
        `Login error: ${err.message || "An error occurred during Google login"}`,
      );
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
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
    clearError();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    try {
      await login(formData);

      // After successful login, the user will be in context
      // The redirect will happen based on stored user data
    } catch (err) {
      // Error is handled by context
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-card shadow-soft-lg p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-block w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-2xl mb-4">
              SH
            </div>
            <h1 className="text-3xl font-bold text-gray-900">StudyHub</h1>
            <p className="text-gray-600 text-sm mt-2">
              Book your study room in minutes
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="text-danger flex-shrink-0" size={20} />
              <div>
                <h3 className="font-semibold text-danger text-sm">Error</h3>
                <p className="text-danger text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2 border rounded-btn focus:outline-none focus:ring-2 focus:ring-primary transition ${
                    localErrors.email
                      ? "border-danger focus:ring-danger"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {localErrors.email && (
                <p className="text-danger text-sm mt-1">{localErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3 text-gray-400"
                  size={20}
                />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2 border rounded-btn focus:outline-none focus:ring-2 focus:ring-primary transition ${
                    localErrors.password
                      ? "border-danger focus:ring-danger"
                      : "border-gray-300"
                  }`}
                />
              </div>
              {localErrors.password && (
                <p className="text-danger text-sm mt-1">
                  {localErrors.password}
                </p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-blue-600 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-300 text-white font-semibold py-2 rounded-btn transition-colors flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 bg-gray-200 h-px"></div>
            <span className="px-3 text-sm text-gray-500">or</span>
            <div className="flex-1 bg-gray-200 h-px"></div>
          </div>

          {/* Google Sign-In Button (rendered by Google) */}
          <div id="google-button" className="flex justify-center mb-4"></div>

          {/* Register Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:text-blue-600 font-semibold"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          By logging in, you agree to our{" "}
          <Link href="#" className="text-white hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="text-white hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
