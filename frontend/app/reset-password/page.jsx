"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  KeyRound,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Clock,
  RefreshCw,
} from "lucide-react";
import { authAPI } from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";

  const [formData, setFormData] = useState({
    email: initialEmail,
    otp: "",
    token: tokenParam,
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");

  // OTP Validity: 30 minutes (1800 seconds)
  const [timeLeft, setTimeLeft] = useState(1800);
  // Resend Cooldown: 60 seconds
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (initialEmail) {
      setFormData((prev) => ({ ...prev, email: initialEmail }));
    }
    if (tokenParam) {
      setFormData((prev) => ({ ...prev, token: tokenParam }));
    }
  }, [initialEmail, tokenParam]);

  // Handle countdown for 30-minute validity
  useEffect(() => {
    const storageKey = formData.email ? `otp_expiry_${formData.email.trim().toLowerCase()}` : "otp_expiry_default";
    let expiry = sessionStorage.getItem(storageKey);
    if (!expiry) {
      expiry = (Date.now() + 30 * 60 * 1000).toString();
      sessionStorage.setItem(storageKey, expiry);
    }

    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((parseInt(expiry, 10) - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [formData.email]);

  // Handle resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0 || resending) return;
    if (!formData.email) {
      setError("Please enter your account email first to receive a new OTP code.");
      return;
    }

    setResending(true);
    setError("");
    setResendSuccess("");

    try {
      const res = await authAPI.forgotPassword(formData.email.trim());
      // Reset 30-minute timer
      const newExpiry = (Date.now() + 30 * 60 * 1000).toString();
      const storageKey = `otp_expiry_${formData.email.trim().toLowerCase()}`;
      sessionStorage.setItem(storageKey, newExpiry);
      setTimeLeft(1800);
      setResendCooldown(60); // 60s cooldown
      setResendSuccess(res.message || "Fresh 6-digit OTP code sent! Please check your inbox / spam.");
      setTimeout(() => setResendSuccess(""), 8000);
    } catch (err) {
      setError(err.message || "Could not resend OTP. Please try again shortly.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (timeLeft <= 0) {
      setError("This OTP has expired. Please click 'Resend OTP' to get a fresh code.");
      return;
    }

    if (!formData.email || (!formData.otp && !formData.token) || !formData.newPassword) {
      setError("Please enter your email, verification OTP, and new password.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword({
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        token: formData.token.trim(),
        newPassword: formData.newPassword,
      });
      // Clear session expiry on success
      if (formData.email) {
        sessionStorage.removeItem(`otp_expiry_${formData.email.trim().toLowerCase()}`);
      }
      setSuccess(res.message || "Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1800);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please verify the OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-8 sm:py-16 px-3.5 sm:px-6">
      <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-8 space-y-5 sm:space-y-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        <div className="text-center space-y-2">
          <span className="inline-block px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-amber-50 text-amber-800 rounded-full">
            Security Verification
          </span>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Reset Your Password</h1>
          <p className="text-xs text-stone-600">
            Enter the 6-digit OTP code sent to your email and choose a new password.
          </p>
        </div>

        {/* Live OTP Validity Countdown Banner */}
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
            timeLeft === 0
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : timeLeft < 300
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50/80 border-emerald-200 text-emerald-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock
              className={`w-4 h-4 shrink-0 ${
                timeLeft === 0
                  ? "text-rose-600"
                  : timeLeft < 300
                  ? "text-amber-600 animate-pulse"
                  : "text-emerald-600"
              }`}
            />
            <span className="font-medium">
              {timeLeft === 0 ? "OTP Expired" : "OTP Code Valid For:"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-mono font-bold text-xs px-2.5 py-0.5 rounded-md ${
                timeLeft === 0
                  ? "bg-rose-100 text-rose-700"
                  : timeLeft < 300
                  ? "bg-amber-100 text-amber-800"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-sky-600" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Account Email</label>
            <div className="relative">
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-700">
                6-Digit Verification Code (OTP)
              </label>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={resending || resendCooldown > 0}
                className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 disabled:text-stone-400 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                {resending
                  ? "Resending..."
                  : resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                required
                maxLength={6}
                value={formData.otp}
                onChange={(e) =>
                  setFormData({ ...formData, otp: e.target.value.replace(/\D/g, "") })
                }
                placeholder="123456"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm font-mono tracking-widest text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-stone-700">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Re-enter new password"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:bg-white focus:outline-hidden focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 transition-all"
              />
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
