"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
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
            <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Create Your Account</h1>
            <p className="mt-2 text-sm text-[hsl(220,13%,46%)]">
              Start your journey to study abroad
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                  First Name
                </label>
                <input
                  id="first_name"
                  type="text"
                  required
                  value={form.first_name}
                  onChange={(e) => updateField("first_name", e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                  Last Name
                </label>
                <input
                  id="last_name"
                  type="text"
                  required
                  value={form.last_name}
                  onChange={(e) => updateField("last_name", e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                Mobile Phone <span className="font-semibold text-[hsl(166,72%,40%)]">(for WhatsApp & SMS OTP)</span>
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                placeholder="+91 93927 34699"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition placeholder:text-[hsl(220,13%,46%)]/60 focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
                placeholder="Min 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[hsl(222,47%,11%)]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) => updateField("confirmPassword", e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-[hsl(220,13%,91%)] bg-white px-3.5 py-2.5 text-sm text-[hsl(222,47%,11%)] shadow-sm transition focus:border-[hsl(166,72%,40%)] focus:outline-none focus:ring-1 focus:ring-[hsl(166,72%,40%)]"
              />
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <input
                id="consent"
                type="checkbox"
                checked={form.consent}
                onChange={(e) => updateField("consent", e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[hsl(220,13%,91%)] text-[hsl(166,72%,40%)] focus:ring-[hsl(166,72%,40%)]"
              />
              <label htmlFor="consent" className="text-xs leading-relaxed text-[hsl(220,13%,46%)]">
                I agree to the{" "}
                <Link href="/privacy-policy" className="font-medium text-[hsl(166,72%,40%)] transition hover:text-[hsl(166,72%,50%)] hover:underline">
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link href="/terms" className="font-medium text-[hsl(166,72%,40%)] transition hover:text-[hsl(166,72%,50%)] hover:underline">
                  Terms & Conditions
                </Link>
                . I consent to the processing of my personal data for education consultancy services.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[hsl(166,72%,50%)] focus:outline-none focus:ring-2 focus:ring-[hsl(166,72%,40%)] focus:ring-offset-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[hsl(220,13%,46%)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[hsl(166,72%,40%)] transition hover:text-[hsl(166,72%,50%)] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
