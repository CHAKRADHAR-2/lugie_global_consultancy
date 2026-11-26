"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Spinner } from "@/components/ui/spinner";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";

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
    <div className="flex w-full items-center justify-center bg-[hsl(210,20%,98%)]">
      <FadeIn className="w-full max-w-md">
        <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <Link href="/" className="mb-5 inline-flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-[hsl(222,47%,11%)]">
                LUGIE
              </span>
              <motion.span
                className="inline-block h-2 w-2 rounded-full bg-[hsl(166,72%,40%)]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </Link>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Set New Password</h1>
            <p className="mt-2 text-sm text-[hsl(220,13%,46%)]">
              Please enter your new password below.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                <h4 className="text-sm font-semibold text-emerald-900">Password Updated!</h4>
                <p className="mt-1 text-xs text-emerald-700">
                  Your password has been reset successfully. You can now sign in with your new credentials.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[hsl(166,72%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(166,72%,40%)] focus:ring-offset-2"
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[hsl(222,47%,11%)]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white py-2.5 pl-3.5 pr-10 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[hsl(220,13%,46%)] transition hover:text-[hsl(222,47%,11%)] focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[hsl(222,47%,11%)]">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[hsl(166,72%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(166,72%,40%)] focus:ring-offset-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Updating Password..." : "Update Password"}
              </button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[hsl(220,13%,46%)] transition hover:text-[hsl(222,47%,11%)]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </FadeIn>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
