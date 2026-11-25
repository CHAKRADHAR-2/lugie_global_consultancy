"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";

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
    <div className="w-full max-w-md">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[hsl(215,50%,12%)]">Create Your Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Start your journey to study abroad
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                required
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              />
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                required
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Mobile Phone <span className="text-[hsl(174,85%,32%)] font-semibold">(for WhatsApp & SMS OTP)</span>
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              placeholder="+91 93927 34699"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              placeholder="Min 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[hsl(174,85%,32%)] focus:outline-none focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="consent"
              type="checkbox"
              checked={form.consent}
              onChange={(e) => updateField("consent", e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[hsl(174,85%,32%)] focus:ring-[hsl(174,85%,32%)]"
            />
            <label htmlFor="consent" className="text-xs text-gray-600">
              I agree to the{" "}
              <Link href="/privacy-policy" className="text-[hsl(174,85%,32%)] hover:underline">
                Privacy Policy
              </Link>{" "}
              and{" "}
              <Link href="/terms" className="text-[hsl(174,85%,32%)] hover:underline">
                Terms & Conditions
              </Link>
              . I consent to the processing of my personal data for education consultancy services.
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-[hsl(215,50%,12%)] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[hsl(215,50%,18%)] disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-[hsl(174,85%,32%)] hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
