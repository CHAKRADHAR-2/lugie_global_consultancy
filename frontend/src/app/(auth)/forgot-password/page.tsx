"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
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
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Forgot Password?</h1>
            <p className="mt-2 text-sm text-[hsl(220,13%,46%)]">
              No worries! Enter your registered email address and we will dispatch a reset link.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-600" />
                <h4 className="text-sm font-semibold text-emerald-900">Reset Link Sent</h4>
                <p className="mt-1 text-xs text-emerald-700">
                  If an account exists with <strong>{email}</strong>, a secure password reset link has been sent. Please check your inbox and spam folder.
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[hsl(166,72%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(166,72%,40%)] focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[hsl(222,47%,11%)]">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[hsl(220,13%,46%)]" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[hsl(166,72%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(166,72%,40%)] focus:ring-offset-2 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {loading ? "Sending Link..." : "Send Reset Link"}
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
