"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft, Mail } from "lucide-react";

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
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)]">Welcome Back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Lugie account
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email);
                  setForgotSent(false);
                  setShowForgotModal(true);
                }}
                className="text-xs font-medium text-[hsl(174,85%,32%)] hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 pl-3 pr-10 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none"
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
            className="w-full rounded-md bg-[hsl(215,50%,12%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[hsl(215,50%,18%)] disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-[hsl(174,85%,32%)] hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">Reset Password</h3>
                <p className="text-xs text-gray-500">
                  Enter your email address to receive password reset instructions.
                </p>
              </div>
            </div>

            {forgotSent ? (
              <div className="space-y-4 py-2">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-emerald-900 text-sm">Reset Link Sent</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    If an account is associated with <strong>{forgotEmail}</strong>, a secure password reset link has been dispatched via email. Please check your inbox (and spam folder).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="w-full rounded-md bg-[hsl(215,50%,12%)] py-2 text-sm font-semibold text-white hover:bg-[hsl(215,50%,18%)]"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="rounded-md bg-[hsl(174,85%,32%)] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[hsl(174,85%,28%)] disabled:opacity-50 inline-flex items-center gap-2"
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
