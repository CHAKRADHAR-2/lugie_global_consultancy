"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion, useReducedMotion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Button } from "@/components/ui/button";
import { FeedbackBanner } from "@/components/ui/feedback";

const inputClasses =
  "mt-1.5 block w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/65 transition-colors focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2]";

export default function RegisterPage() {
  const router = useRouter();
  const prefersReduced = useReducedMotion();
  const { user, loading: authLoading, register } = useAuth();

  useEffect(() => {
    if (authLoading || !user) return;
    const roles = user.roles || [];
    if (roles.includes("super_admin") || roles.includes("admin")) {
      router.replace("/admin/dashboard");
    } else if (roles.includes("counsellor")) {
      router.replace("/counsellor/dashboard");
    } else {
      router.replace("/student/dashboard");
    }
  }, [authLoading, user, router]);

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    consent: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.consent) {
      setError("You must agree to the Privacy Policy and Terms.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
      });
      router.push("/student/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
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
            <h1 className="font-editorial text-3xl text-[#394B49]">Create Your Account</h1>
            <p className="mt-2 text-sm text-[#546866]">
              Start your journey to study abroad
            </p>
          </div>

          {error && (
            <FeedbackBanner
              tone="error"
              title="Please check your details"
              message={error}
              className="mb-5"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-xs font-semibold text-[#394B49]">
                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  required
                  autoComplete="given-name"
                  value={form.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-xs font-semibold text-[#394B49]">
                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  autoComplete="family-name"
                  value={form.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#394B49]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={inputClasses}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-[#394B49]">
                Mobile Phone{" "}
                <span className="font-semibold text-[#3F6258]">(for WhatsApp &amp; SMS OTP)</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                autoComplete="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={inputClasses}
                placeholder="+91 93927 34699"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-[#394B49]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className={inputClasses}
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#394B49]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className={inputClasses}
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="consent"
                type="checkbox"
                checked={form.consent}
                onChange={(e) => updateField("consent", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#B7CBC2] accent-[#394B49] focus:ring-[#394B49]"
              />
              <label htmlFor="consent" className="text-xs leading-relaxed text-[#546866]">
                I agree to the{" "}
                <Link
                  href="/privacy-policy"
                  className="font-semibold text-[#8E572C] underline underline-offset-2 transition hover:text-[#394B49]"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-[#8E572C] underline underline-offset-2 transition hover:text-[#394B49]"
                >
                  Terms &amp; Conditions
                </Link>
                . I consent to the processing of my personal data for education consultancy services.
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              loadingText="Creating account..."
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[#546866]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#8E572C] transition hover:text-[#394B49] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
