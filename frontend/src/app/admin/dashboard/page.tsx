"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import {
  Users,
  GraduationCap,
  Building2,
  FileCheck,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Plus,
  Clock,
  Sparkles,
  Loader2,
} from "lucide-react";

interface LeadStats {
  total: number;
  new: number;
  converted: number;
  conversion_rate: number;
  by_status: Record<string, number>;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [uniCount, setUniCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=/admin/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [statsData, studentsData, unisData] = await Promise.allSettled([
          api.get<LeadStats>("leads/stats/overview"),
          api.get<any[]>("students"),
          api.get<any[]>("universities"),
        ]);

        if (statsData.status === "fulfilled") setStats(statsData.value);
        if (studentsData.status === "fulfilled") {
          const val = studentsData.value;
          const count = Array.isArray(val) ? val.length : ((val as any)?.total ?? (val as any)?.items?.length ?? 0);
          setStudentCount(count);
        }
        if (unisData.status === "fulfilled") {
          const val = unisData.value;
          const count = Array.isArray(val) ? val.length : ((val as any)?.total ?? (val as any)?.items?.length ?? 0);
          setUniCount(count);
        }
      } catch (err) {
        console.error("Failed to load admin metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadMetrics();
    }
  }, [user]);

  if (authLoading || (loading && user)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  const totalLeads = stats?.total || 0;
  const newLeads = stats?.new || 0;
  const convertedLeads = stats?.converted || 0;
  const convRate = stats?.conversion_rate || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)]">Admin Operations Console</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome, {user?.first_name}. Real-time CRM leads, student profiles, and university directories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition"
          >
            <Users className="h-4 w-4" />
            Manage CRM Leads
          </Link>
          <Link
            href="/admin/universities"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <Building2 className="h-4 w-4" />
            University Directory
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Leads */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Enquiries
            </span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[hsl(222,47%,11%)]">{totalLeads}</p>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              {newLeads} New
            </span>
            <span className="text-gray-400">Website & consultations</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Conversion Rate
            </span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[hsl(222,47%,11%)]">{convRate}%</p>
          <p className="mt-2 text-xs text-gray-500">
            {convertedLeads} leads converted to active students
          </p>
        </div>

        {/* Registered Students */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Active Students
            </span>
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[hsl(222,47%,11%)]">{studentCount}</p>
          <Link
            href="/admin/students"
            className="mt-2 inline-block text-xs font-semibold text-purple-600 hover:underline"
          >
            View student roster →
          </Link>
        </div>

        {/* Verified Universities */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Verified Universities
            </span>
            <Building2 className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[hsl(222,47%,11%)]">{uniCount}</p>
          <Link
            href="/admin/universities"
            className="mt-2 inline-block text-xs font-semibold text-amber-600 hover:underline"
          >
            Manage partners & courses →
          </Link>
        </div>
      </div>

      {/* Operational Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/leads"
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-[hsl(166,72%,40%)] transition flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">CRM Lead Management</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Review new website enquiries, assign counsellors, schedule follow-ups, and convert leads into registered students.
            </p>
          </div>
          <span className="text-xs font-bold text-[hsl(166,72%,40%)] mt-4 inline-flex items-center gap-1">
            Open Leads CRM <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          href="/admin/packages"
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-[hsl(166,72%,40%)] transition flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Packages & Service Pricing</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Maintain published pricing for Basic (₹7,999), Standard (₹13,999), and Premium (₹24,999) packages and 14 add-on services.
            </p>
          </div>
          <span className="text-xs font-bold text-[hsl(166,72%,40%)] mt-4 inline-flex items-center gap-1">
            Review Pricing <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link
          href="/admin/documents"
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:border-[hsl(166,72%,40%)] transition flex flex-col justify-between"
        >
          <div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700 mb-4">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Document Security & Audit</h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Monitor incoming academic files, inspect automated ClamAV scan flags, and verify documents before university filing.
            </p>
          </div>
          <span className="text-xs font-bold text-[hsl(166,72%,40%)] mt-4 inline-flex items-center gap-1">
            Inspect Documents <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>
    </div>
  );
}
