"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the link. Please request a new reset email.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await api.post<{ message: string }>("auth/reset-password", {
        token,
        new_password: password,
      });
      setSuccess(true);
      toast.success("Password has been reset successfully!");
    } catch (err: any) {
      setError(err?.message || "Invalid or expired reset token. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] mb-3">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)]">Set New Password</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-semibold text-emerald-900 text-sm">Password Updated!</h4>
              <p className="text-xs text-emerald-700 mt-1">
                Your password has been reset successfully. You can now sign in with your new credentials.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full rounded-md bg-[hsl(215,50%,12%)] py-2.5 text-sm font-semibold text-white hover:bg-[hsl(215,50%,18%)] inline-flex items-center justify-center gap-2"
            >
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[hsl(215,50%,12%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[hsl(215,50%,18%)] disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Updating Password..." : "Update Password"}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
