"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { KeyRound, Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await api.post<{ message: string }>("auth/forgot-password", {
        email: email.trim(),
      });
      setSubmitted(true);
      toast.success("Password reset instructions sent!");
    } catch (err: any) {
      setSubmitted(true);
      toast.info("If an account exists with that email, a reset link has been dispatched.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] mb-3">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)]">Forgot Password?</h1>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your registered email address and we will dispatch a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-semibold text-emerald-900 text-sm">Reset Link Sent</h4>
              <p className="text-xs text-emerald-700 mt-1">
                If an account exists with <strong>{email}</strong>, a secure password reset link has been sent. Please check your inbox and spam folder.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full rounded-md bg-[hsl(215,50%,12%)] py-2.5 text-sm font-semibold text-white hover:bg-[hsl(215,50%,18%)] inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-[hsl(215,50%,12%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[hsl(215,50%,18%)] disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Sending Link..." : "Send Reset Link"}
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
