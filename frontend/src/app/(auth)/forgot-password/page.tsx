"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Button, buttonVariants } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback";
import { KeyRound, Mail, ArrowLeft } from "lucide-react";

const inputClasses =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 py-2.5 pl-10 pr-3.5 text-sm text-[#394B49] placeholder:text-[#546866]/65 transition-colors focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2]";

export default function ForgotPasswordPage() {
  const prefersReduced = useReducedMotion();
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
    } catch {
      setSubmitted(true);
      toast.info("If an account exists with that email, a reset link has been dispatched.");
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
              <KeyRound className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="font-editorial text-3xl text-[#394B49]">Forgot Password?</h1>
            <p className="mt-2 text-sm text-[#546866]">
              No worries! Enter your registered email address and we will dispatch a reset link.
            </p>
          </div>

          {submitted ? (
            <div className="space-y-4">
              <FeedbackBanner
                tone="success"
                title="Reset Link Sent"
                message={`If an account exists with ${email}, a secure password reset link has been sent. Please check your inbox and spam folder.`}
              />
              <Link
                href="/login"
                className={buttonVariants({ variant: "primary", size: "lg", className: "w-full" })}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-[#394B49]">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#546866]"
                    aria-hidden="true"
                  />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                loadingText="Sending Link..."
                className="w-full"
              >
                Send Reset Link
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
