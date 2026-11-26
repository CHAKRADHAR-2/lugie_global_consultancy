"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Spinner } from "@/components/ui/spinner";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    } catch (err: any) {
      // Even if error or user not found, show user-friendly message
      setForgotSent(true);
      toast.info("If an account exists with that email, a reset link has been dispatched.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center bg-[hsl(210,20%,98%)]">
      <FadeIn className="w-full max-w-md">
        <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <Link href="/" className="mb-4 inline-flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-[hsl(222,47%,11%)]">
                LUGIE
              </span>
              <motion.span
                className="inline-block h-2 w-2 rounded-full bg-[hsl(166,72%,40%)]"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </Link>
            <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Welcome Back</h1>
            <p className="mt-2 text-sm text-[hsl(220,13%,46%)]">
              Sign in to your Lugie account
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotSent(false);
                    setShowForgotModal(true);
                  }}
                  className="text-xs font-medium text-[hsl(166,72%,40%)] transition hover:text-[hsl(166,72%,50%)] hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white py-2.5 pl-3.5 pr-10 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[hsl(220,13%,46%)] transition hover:text-[hsl(222,47%,11%)] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[hsl(166,72%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(166,72%,40%)] focus:ring-offset-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[hsl(220,13%,46%)]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-[hsl(166,72%,40%)] transition hover:text-[hsl(166,72%,50%)] hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[hsl(222,47%,11%)]/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(222,47%,11%)]">Reset Password</h3>
                  <p className="text-xs text-[hsl(220,13%,46%)]">
                    Enter your email address to receive password reset instructions.
                  </p>
                </div>
              </div>

              {forgotSent ? (
                <div className="space-y-4 py-2">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                    <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                    <h4 className="text-sm font-semibold text-emerald-900">Reset Link Sent</h4>
                    <p className="mt-1 text-xs text-emerald-700">
                      If an account is associated with <strong>{forgotEmail}</strong>, a secure password reset link has been dispatched via email. Please check your inbox (and spam folder).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full rounded-lg bg-[hsl(166,72%,40%)] py-2.5 text-sm font-semibold text-white transition hover:bg-[hsl(166,72%,50%)]"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-[hsl(222,47%,11%)]">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-[hsl(220,13%,46%)]" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white py-2 pl-9 pr-3 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="rounded-lg border border-[hsl(220,13%,91%)] px-4 py-2 text-sm font-medium text-[hsl(222,47%,11%)] transition hover:bg-[hsl(210,20%,98%)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="inline-flex items-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[hsl(166,72%,50%)] disabled:opacity-50"
                    >
                      {forgotLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      {forgotLoading ? "Sending Link..." : "Send Reset Link"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </FadeIn>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
