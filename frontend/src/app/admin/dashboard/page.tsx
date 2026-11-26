"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { SkeletonJourney } from "@/components/ui/skeleton";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  Users,
  GraduationCap,
  Building2,
  FileCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
  Wallet,
  ScrollText,
} from "lucide-react";

interface LeadStats {
  total: number;
  new: number;
  converted: number;
  conversion_rate: number;
  by_status: Record<string, number>;
}

const PIPELINE_COLORS: Record<string, { bar: string; dot: string; label: string }> = {
  new: { bar: "#D9A879", dot: "#D9A879", label: "New Enquiries" },
  contacted: { bar: "#B7CBC2", dot: "#B7CBC2", label: "Contacted" },
  in_discussion: { bar: "#3F6258", dot: "#3F6258", label: "In Discussion" },
  qualified: { bar: "#3F6258", dot: "#3F6258", label: "Qualified" },
  converted: { bar: "#394B49", dot: "#394B49", label: "Converted" },
  closed_lost: { bar: "#8E572C", dot: "#8E572C", label: "Closed / Lost" },
};

const FALLBACK_PALETTE = ["#394B49", "#3F6258", "#B7CBC2", "#D9A879", "#8E572C"];

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
          const count = Array.isArray(val)
            ? val.length
            : ((val as any)?.total ?? (val as any)?.items?.length ?? 0);
          setStudentCount(count);
        }
        if (unisData.status === "fulfilled") {
          const val = unisData.value;
          const count = Array.isArray(val)
            ? val.length
            : ((val as any)?.total ?? (val as any)?.items?.length ?? 0);
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
    return <SkeletonJourney />;
  }

  const totalLeads = stats?.total || 0;
  const newLeads = stats?.new || 0;
  const convertedLeads = stats?.converted || 0;
  const convRate = stats?.conversion_rate || 0;

  const byStatusEntries = Object.entries(stats?.by_status || {}).filter(
    ([, count]) => typeof count === "number"
  );
  const maxStageCount = Math.max(1, ...byStatusEntries.map(([, c]) => c));

  // SVG Donut ring geometry for conversion pulse
  const clampedConv = Math.min(100, Math.max(0, convRate));
  const ringRadius = 44;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (clampedConv / 100) * ringCircumference;

  return (
    <div className="space-y-8">
      {/* Executive Header Banner (Forest Slate Highlight) */}
      <section className="relative overflow-hidden rounded-2xl bg-[#394B49] p-6 sm:p-8 text-white shadow-sm border border-[#263331]">
        <div
          className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#B7CBC2]/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-24 -bottom-16 h-36 w-36 rounded-full bg-[#D9A879]/15"
          aria-hidden="true"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D9A879] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#263331]">
              Executive Console
            </span>
            <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-white">
              Admin Operations Console
            </h1>
            <p className="text-sm text-[#DCE5E8] leading-relaxed">
              Welcome, {user?.first_name}. Real-time CRM leads, student profiles, and university directories across LUGIE operations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/leads"
              className={buttonVariants({ variant: "warm", size: "md" })}
            >
              <Users className="h-4 w-4" />
              Manage CRM Leads
            </Link>
            <Link
              href="/admin/universities"
              className={buttonVariants({ variant: "secondary", size: "md" })}
            >
              <Building2 className="h-4 w-4" />
              University Directory
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Leads */}
        <div className="beyond-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
              Total Enquiries
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF3F5] text-[#394B49] border border-[#DCE5E8]">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#263331]">
            <AnimatedCounter target={totalLeads} />
          </p>
          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <StatusBadge tone="sage">{newLeads} New</StatusBadge>
            <span className="text-[#546866] truncate">Website & consultations</span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="beyond-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
              Conversion Rate
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EDF5F1] text-[#2F6B55] border border-[#B7CBC2]">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#263331]">
            {convRate}%
          </p>
          <p className="mt-3 text-xs text-[#546866]">
            <span className="font-semibold text-[#2F6B55]">{convertedLeads}</span> leads converted to active students
          </p>
        </div>

        {/* Registered Students */}
        <div className="beyond-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
              Active Students
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E6EFEA] text-[#3F6258] border border-[#B7CBC2]">
              <GraduationCap className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#263331]">
            <AnimatedCounter target={studentCount} />
          </p>
          <Link
            href="/admin/students"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#3F6258] hover:text-[#263331] transition"
          >
            View student roster <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Verified Universities */}
        <div className="beyond-card p-6">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
              Verified Universities
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F6EDE4] text-[#8E572C] border border-[#D9A879]/60">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#263331]">
            <AnimatedCounter target={uniCount} />
          </p>
          <Link
            href="/admin/universities"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8E572C] hover:text-[#263331] transition"
          >
            Manage partners & courses <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Beyond-Palette Data Visualisations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pipeline Stage Distribution Bar Chart */}
        <div className="beyond-card p-6 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#DCE5E8]">
              <div>
                <h2 className="text-base font-semibold text-[#263331]">
                  Lead Pipeline Distribution
                </h2>
                <p className="text-xs text-[#546866] mt-0.5">
                  Live stage breakdown across incoming enquiries
                </p>
              </div>
              <Link
                href="/admin/reports"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#3F6258] hover:text-[#263331] transition"
              >
                Full BI Reports <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {byStatusEntries.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-xs text-[#546866]">
                  No stage telemetry recorded yet. Enquiries will populate this breakdown automatically.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                {byStatusEntries.map(([status, count], idx) => {
                  const palette = PIPELINE_COLORS[status];
                  const fillColor =
                    palette?.bar || FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
                  const sharePct =
                    totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                  const relativeWidth = Math.max(
                    count > 0 ? 6 : 0,
                    Math.round((count / maxStageCount) * 100)
                  );

                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: fillColor }}
                            aria-hidden="true"
                          />
                          <span className="font-semibold capitalize text-[#394B49]">
                            {palette?.label || status.replace(/_/g, " ")}
                          </span>
                        </div>
                        <span className="font-mono text-[#546866]">
                          <strong className="text-[#263331]">{count}</strong> ({sharePct}%)
                        </span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-[#EEF3F5] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${relativeWidth}%`,
                            backgroundColor: fillColor,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#DCE5E8] flex flex-wrap items-center justify-between gap-2 text-xs text-[#546866]">
            <span>Total tracked leads: <strong className="text-[#263331]">{totalLeads}</strong></span>
            <span>Pending initial outreach: <strong className="text-[#8E572C]">{newLeads}</strong></span>
          </div>
        </div>

        {/* SVG Conversion & Capacity Ring */}
        <div className="beyond-card p-6 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE5E8]">
              <div>
                <h2 className="text-base font-semibold text-[#263331]">
                  Conversion Velocity
                </h2>
                <p className="text-xs text-[#546866] mt-0.5">
                  Enquiry-to-student enrollment efficiency
                </p>
              </div>
              <StatusBadge tone="warm">Live CRM</StatusBadge>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
                <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden="true">
                  <circle
                    cx="56"
                    cy="56"
                    r={ringRadius}
                    fill="none"
                    stroke="#EEF3F5"
                    strokeWidth="10"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r={ringRadius}
                    fill="none"
                    stroke="#D9A879"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-[#263331]">{convRate}%</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#546866]">
                    Converted
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2.5 text-xs">
                <div className="flex items-center justify-between rounded-xl bg-[#F3F0E8]/75 border border-[#DCE5E8] px-3.5 py-2.5">
                  <span className="text-[#546866]">Converted Leads</span>
                  <span className="font-semibold text-[#263331]">{convertedLeads}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F3F0E8]/75 border border-[#DCE5E8] px-3.5 py-2.5">
                  <span className="text-[#546866]">Active Student Dossiers</span>
                  <span className="font-semibold text-[#263331]">{studentCount}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#F3F0E8]/75 border border-[#DCE5E8] px-3.5 py-2.5">
                  <span className="text-[#546866]">Partner Institutions</span>
                  <span className="font-semibold text-[#263331]">{uniCount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#DCE5E8] flex flex-wrap items-center gap-3">
            <Link
              href="/admin/payments"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] transition"
            >
              <Wallet className="h-3.5 w-3.5" /> Payments Ledger
            </Link>
            <span className="text-[#DCE5E8]">•</span>
            <Link
              href="/admin/reports"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] transition"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Executive Reports
            </Link>
            <span className="text-[#DCE5E8]">•</span>
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] transition"
            >
              <ScrollText className="h-3.5 w-3.5" /> Audit Logs
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Modules Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/leads"
          className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between group"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF3F5] border border-[#DCE5E8] text-[#394B49] mb-4">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#263331]">CRM Lead Management</h3>
            <p className="text-xs text-[#546866] mt-1.5 leading-relaxed">
              Review new website enquiries, assign counsellors, schedule follow-ups, and convert leads into registered students.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#3F6258] group-hover:text-[#263331] mt-5 inline-flex items-center gap-1.5 transition">
            Open Leads CRM <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/packages"
          className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between group"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F6EDE4] border border-[#D9A879]/60 text-[#8E572C] mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#263331]">Packages & Service Pricing</h3>
            <p className="text-xs text-[#546866] mt-1.5 leading-relaxed">
              Maintain published pricing for Basic (₹7,999), Standard (₹13,999), and Premium (₹24,999) packages and 14 add-on services.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#8E572C] group-hover:text-[#263331] mt-5 inline-flex items-center gap-1.5 transition">
            Review Pricing <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>

        <Link
          href="/admin/documents"
          className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between group"
        >
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258] mb-4">
              <FileCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-[#263331]">Document Security & Audit</h3>
            <p className="text-xs text-[#546866] mt-1.5 leading-relaxed">
              Monitor incoming academic files, inspect automated ClamAV scan flags, and verify documents before university filing.
            </p>
          </div>
          <span className="text-xs font-semibold text-[#3F6258] group-hover:text-[#263331] mt-5 inline-flex items-center gap-1.5 transition">
            Inspect Documents <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}
