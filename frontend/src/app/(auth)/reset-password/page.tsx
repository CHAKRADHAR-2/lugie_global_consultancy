"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Button, buttonVariants } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback";
import { GrowingHorizonLoader } from "@/components/ui/loading-concepts";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const inputClasses =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/65 transition-colors focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2]";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const prefersReduced = useReducedMotion();
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
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Invalid or expired reset token. Please request a new one.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
      <FadeIn className="w-full max-w-md">
        <div className="beyond-card p-7 sm:p-9">
          <div className="mb-6 text-center">
            <Link href="/" className="mb-5 inline-flex items-baseline gap-1.5">
              <span className="font-editorial text-2xl tracking-tight text-[#394B49]">
                LUGIE
              </span>
              <motion.span
                className="inline-block h-2 w-2 rounded-full bg-[#D9A879]"
                animate={prefersReduced ? undefined : { scale: [1, 1.25, 1] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden="true"
              />
            </Link>
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258]">
              <Lock className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="font-editorial text-3xl text-[#394B49]">Set New Password</h1>
            <p className="mt-2 text-sm text-[#546866]">
              Please enter your new password below.
            </p>
          </div>

          {error && (
            <FeedbackBanner
              tone="error"
              title="Reset unsuccessful"
              message={error}
              className="mb-5"
            />
          )}

          {success ? (
            <div className="space-y-4">
              <FeedbackBanner
                tone="success"
                title="Password Updated!"
                message="Your password has been reset successfully. You can now sign in with your new credentials."
              />
              <Link
                href="/login"
                className={buttonVariants({ variant: "primary", size: "lg", className: "w-full" })}
              >
                Sign In Now
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-xs font-semibold text-[#394B49]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`${inputClasses} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#546866] transition hover:text-[#394B49] cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="mb-1.5 block text-xs font-semibold text-[#394B49]">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className={inputClasses}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                loadingText="Updating Password..."
                className="w-full"
              >
                Update Password
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#546866] transition hover:text-[#394B49]"
                >
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Return to Login</span>
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
          <GrowingHorizonLoader label="Preparing password reset…" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
