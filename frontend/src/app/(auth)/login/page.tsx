"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { FeedbackBanner, ModalShell } from "@/components/ui/feedback";
import { GrowingHorizonLoader } from "@/components/ui/loading-concepts";
import { Eye, EyeOff, Mail, KeyRound } from "lucide-react";

const inputClasses =
  "block w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/65 transition-colors focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2]";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefersReduced = useReducedMotion();
  const { user, loading: authLoading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    const roles = user.roles || [];
    const fromParam = searchParams?.get("from");
    if (fromParam) {
      router.replace(fromParam);
    } else if (roles.includes("super_admin") || roles.includes("admin")) {
      router.replace("/admin/dashboard");
    } else if (roles.includes("counsellor")) {
      router.replace("/counsellor/dashboard");
    } else {
      router.replace("/student/dashboard");
    }
  }, [authLoading, user, searchParams, router]);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login({ email, password });
      const roles = user.roles || [];
      const fromParam = searchParams?.get("from");

      if (fromParam) {
        router.push(fromParam);
      } else if (roles.includes("super_admin") || roles.includes("admin")) {
        router.push("/admin/dashboard");
      } else if (roles.includes("counsellor")) {
        router.push("/counsellor/dashboard");
      } else {
        router.push("/student/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      toast.error("Please enter your registered email address.");
      return;
    }
    setForgotLoading(true);
    try {
      await api.post<{ message: string }>("auth/forgot-password", { email: forgotEmail.trim() });
      setForgotSent(true);
      toast.success("Password reset instructions dispatched!");
    } catch {
      // Even if error or user not found, show user-friendly message
      setForgotSent(true);
      toast.info("If an account exists with that email, a reset link has been dispatched.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center">
      <FadeIn className="w-full max-w-md">
        <div className="beyond-card p-7 sm:p-9">
          <div className="mb-8 text-center">
            <Link href="/" className="mb-4 inline-flex items-baseline gap-1.5">
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
            <h1 className="font-editorial text-3xl text-[#394B49]">Welcome Back</h1>
            <p className="mt-2 text-sm text-[#546866]">
              Sign in to your Lugie account
            </p>
          </div>

          {error && (
            <FeedbackBanner
              tone="error"
              title="Sign in unsuccessful"
              message={error}
              className="mb-5"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#394B49]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`mt-1.5 ${inputClasses}`}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold text-[#394B49]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSent(false);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-semibold text-[#8E572C] transition hover:text-[#394B49] hover:underline focus-visible:outline-2 focus-visible:outline-[#394B49] cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pr-10`}
                  placeholder="••••••••"
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

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              loadingText="Signing in..."
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#546866]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[#8E572C] transition hover:text-[#394B49] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Forgot Password Modal */}
        <ModalShell
          isOpen={showForgotModal}
          onClose={() => setShowForgotModal(false)}
          maxWidth="max-w-md"
        >
          <div className="mb-5 flex items-center gap-3 pr-8">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258]">
              <KeyRound className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-editorial text-xl text-[#394B49]">Reset Password</h2>
              <p className="text-xs text-[#546866]">
                Enter your email address to receive password reset instructions.
              </p>
            </div>
          </div>

          {forgotSent ? (
            <div className="space-y-4">
              <FeedbackBanner
                tone="success"
                title="Reset Link Sent"
                message={`If an account is associated with ${forgotEmail}, a secure password reset link has been dispatched via email. Please check your inbox (and spam folder).`}
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={() => setShowForgotModal(false)}
                className="w-full"
              >
                Return to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label
                  htmlFor="forgot-email"
                  className="mb-1.5 block text-xs font-semibold text-[#394B49]"
                >
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#546866]"
                    aria-hidden="true"
                  />
                  <input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputClasses} pl-10`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowForgotModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={forgotLoading}
                  loadingText="Sending Link..."
                >
                  Send Reset Link
                </Button>
              </div>
            </form>
          )}
        </ModalShell>
      </FadeIn>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <GrowingHorizonLoader label="Preparing sign in…" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
