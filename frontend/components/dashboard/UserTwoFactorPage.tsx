"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
import { tokenUtils } from "@/lib/token-utils";
import {
  Shield,
  KeyRound,
  QrCode,
  CheckCircle,
  AlertCircle,
  RefreshCcw,
} from "lucide-react";

export default function UserTwoFactorPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(!!user?.isTwoFactorEnabled);
  const [step, setStep] = useState<"verify" | "confirm">("verify");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const email = user?.email || "";

  const updateLocalUser = (enabled: boolean) => {
    const current = tokenUtils.getUser();
    if (!current) return;
    tokenUtils.setUser({ ...current, isTwoFactorEnabled: enabled });
  };

  const handleVerifyIdentity = async () => {
    if (!email || !password) {
      setError("Please enter your password to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authService.enable2FA(password);
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setStep("confirm");
      setSuccess("Identity verified. Scan the QR code to continue.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async () => {
    const normalizedOtp = otp.replace(/\s+/g, "");
    if (!normalizedOtp) {
      setError("Please enter the 6-digit code from your authenticator app.");
      return;
    }

    if (normalizedOtp.length !== 6) {
      setError("The code must be exactly 6 digits.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.verify2FASetup(normalizedOtp);
      setIsEnabled(true);
      updateLocalUser(true);
      setSuccess("Two-factor authentication enabled successfully.");
      router.push("/dashboard/user");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!password) {
      setError("Please enter your password to reset 2FA.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.disable2FA(password);
      setIsEnabled(false);
      setStep("verify");
      setQrCode(null);
      setSecret(null);
      setOtp("");
      updateLocalUser(false);
      setSuccess("2FA has been reset. You can set it up again.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to reset 2FA.");
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = useMemo(() => {
    if (isEnabled) {
      return (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
          <CheckCircle size={16} />
          2FA Enabled
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
        <Shield size={16} />
        2FA Not Enabled
      </span>
    );
  }, [isEnabled]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-card shadow-soft-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Two-Factor Authentication
            </h1>
            <p className="text-gray-600 mt-1">
              Secure your account with Google Authenticator or any TOTP app.
            </p>
          </div>
          {statusBadge}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="text-red-600 mt-0.5" size={20} />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="text-green-600 mt-0.5" size={20} />
          <div className="text-sm text-green-700">{success}</div>
        </div>
      )}

      {!isEnabled ? (
        <div className="bg-white rounded-card shadow-soft-md p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shield size={18} />
            Enable 2FA
          </h2>

          <div className="border border-gray-200 rounded-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                1
              </span>
              Verify your identity
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <KeyRound
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                />
              </div>
              <button
                onClick={handleVerifyIdentity}
                disabled={loading}
                className="w-full px-4 py-2 bg-primary text-white rounded-btn hover:bg-blue-600 disabled:bg-gray-300 transition font-medium"
              >
                {loading ? "Verifying..." : "Verify & Generate QR"}
              </button>
            </div>
          </div>

          {step === "confirm" && qrCode && (
            <div className="border border-gray-200 rounded-card p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs">
                  2
                </span>
                Scan QR & enter code
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-card p-4">
                  <QrCode size={20} className="text-gray-500 mb-2" />
                  <img src={qrCode} alt="2FA QR Code" className="w-44 h-44" />
                  {secret && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Manual code: <span className="font-mono">{secret}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">
                    6-digit Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="123456"
                    maxLength={6}
                  />
                  <button
                    onClick={handleConfirmOtp}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-success text-white rounded-btn hover:bg-green-600 disabled:bg-gray-300 transition font-medium"
                  >
                    {loading ? "Verifying..." : "Confirm & Enable 2FA"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-card shadow-soft-md p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <RefreshCcw size={18} />
            Reset 2FA
          </h2>
          <p className="text-sm text-gray-600">
            2FA is already enabled. For security, you can only reset it here.
            After resetting, you will need to set it up again.
          </p>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <KeyRound
                size={18}
                className="absolute left-3 top-3 text-gray-400"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleDisable2FA}
              disabled={loading}
              className="w-full px-4 py-2 bg-danger text-white rounded-btn hover:bg-red-600 disabled:bg-gray-300 transition font-medium"
            >
              {loading ? "Resetting..." : "Reset 2FA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
