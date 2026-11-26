"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import Link from "next/link";
import {
  Users,
  GraduationCap,
  ClipboardCheck,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  Plus,
  Compass,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/feedback";
import { HorizonPath } from "@/components/ui/horizon-path";
import { SkeletonJourney } from "@/components/ui/skeleton";

function getLeadStatusTone(status: string): "success" | "sage" | "warm" | "misty" | "warning" | "error" {
  const s = (status || "").toLowerCase();
  if (s === "converted" || s === "qualified") return "success";
  if (s === "in_progress" || s === "contacted") return "warm";
  if (s === "lost" || s === "rejected") return "error";
  return "misty";
}

export default function CounsellorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [metrics, setMetrics] = useState({
    leadsCount: 0,
    studentsCount: 0,
    assessmentsCount: 0,
    applicationsCount: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=/counsellor/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const [leads, students, assessments, applications] = await Promise.allSettled([
          api.get<any>("leads"),
          api.get<any[]>("students"),
          api.get<any[]>("assessments"),
          api.get<any>("applications"),
        ]);

        const leadsVal = leads.status === "fulfilled" ? leads.value : null;
        const leadsList: any[] = Array.isArray(leadsVal)
          ? leadsVal
          : leadsVal?.items && Array.isArray(leadsVal.items)
          ? leadsVal.items
          : [];

        const studentsVal = students.status === "fulfilled" ? students.value : [];
        const studentsList: any[] = Array.isArray(studentsVal)
          ? studentsVal
          : (studentsVal as any)?.items && Array.isArray((studentsVal as any).items)
          ? (studentsVal as any).items
          : [];

        const assessmentsVal = assessments.status === "fulfilled" ? assessments.value : [];
        const assessmentsList: any[] = Array.isArray(assessmentsVal)
          ? assessmentsVal
          : (assessmentsVal as any)?.items && Array.isArray((assessmentsVal as any).items)
          ? (assessmentsVal as any).items
          : [];

        const applicationsVal = applications.status === "fulfilled" ? applications.value : null;
        const applicationsList: any[] = Array.isArray(applicationsVal)
          ? applicationsVal
          : applicationsVal?.items && Array.isArray(applicationsVal.items)
          ? applicationsVal.items
          : [];

        setMetrics({
          leadsCount: typeof leadsVal?.total === "number" ? leadsVal.total : leadsList.length,
          studentsCount: studentsList.length,
          assessmentsCount: assessmentsList.length,
          applicationsCount:
            typeof applicationsVal?.total === "number"
              ? applicationsVal.total
              : applicationsList.length,
        });

        setRecentLeads(leadsList.slice(0, 5));
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadData();
    }
  }, [user]);

  if (authLoading || (loading && user)) {
    return <SkeletonJourney />;
  }

  const statCards = [
    {
      title: "My Assigned Leads",
      value: metrics.leadsCount,
      desc: "Prospects requiring qualification",
      href: "/counsellor/leads",
      icon: Users,
      iconWrap: "bg-[#EEF3F5] border-[#DCE5E8] text-[#394B49]",
    },
    {
      title: "Active Students",
      value: metrics.studentsCount,
      desc: "Enrolled profile mentees",
      href: "/counsellor/students",
      icon: GraduationCap,
      iconWrap: "bg-[#E6EFEA] border-[#B7CBC2] text-[#2F6B55]",
    },
    {
      title: "Profile Assessments",
      value: metrics.assessmentsCount,
      desc: "Drafted & reviewed evaluations",
      href: "/counsellor/assessments",
      icon: ClipboardCheck,
      iconWrap: "bg-[#F6EDE4] border-[#D9A879]/70 text-[#8E572C]",
    },
    {
      title: "Applications In Progress",
      value: metrics.applicationsCount,
      desc: "Live university submissions",
      href: "/counsellor/applications",
      icon: FileCheck,
      iconWrap: "bg-[#E6EFEA] border-[#B7CBC2] text-[#3F6258]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Welcome Banner */}
      <section className="beyond-card p-6 sm:p-8 bg-gradient-to-br from-white via-[#F3F0E8]/50 to-[#E6EFEA]/60">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="sage">
                <Compass className="h-3 w-3" />
                Advisory Workspace
              </StatusBadge>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#546866]">
                Counsellor Desk
              </span>
            </div>
            <h1 className="font-editorial text-3xl sm:text-4xl text-[#263331] tracking-tight">
              Welcome back, {user?.first_name || "Counsellor"}
            </h1>
            <p className="text-sm text-[#546866] max-w-xl leading-relaxed">
              Track your student candidate pool, draft strategic evaluations, and shepherd applications through admission decisions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0">
            <div className="w-44 hidden sm:block">
              <HorizonPath variant="compact" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/counsellor/leads"
                className={buttonVariants({ variant: "secondary", size: "md" })}
              >
                <Users className="h-4 w-4" />
                Review Leads
              </Link>
              <Link
                href="/counsellor/assessments"
                className={buttonVariants({ variant: "primary", size: "md" })}
              >
                <Plus className="h-4 w-4" />
                New Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                    {card.title}
                  </span>
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl border ${card.iconWrap}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-3 text-3xl font-bold tracking-tight text-[#263331] tabular-nums">
                  {card.value}
                </div>
                <p className="mt-1.5 text-xs text-[#546866]">{card.desc}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#394B49] group-hover:text-[#8E572C] transition-colors">
                Open workspace <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section: Recent Leads & Advisory Protocol */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recent Leads */}
        <div className="lg:col-span-2 beyond-card p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-bold text-[#263331] text-base">Recent Leads &amp; Enquiries</h2>
              <p className="text-xs text-[#546866] mt-0.5">Prospects assigned to your advisory desk</p>
            </div>
            <Link
              href="/counsellor/leads"
              className="text-xs font-semibold text-[#394B49] hover:text-[#8E572C] inline-flex items-center gap-1 hover:underline shrink-0"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#B7CBC2] bg-[#F3F0E8]/50 py-10 px-6 text-center">
              <Users className="h-8 w-8 text-[#546866] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-semibold text-[#263331]">No assigned leads found yet</p>
              <p className="text-xs text-[#546866] mt-1">
                New enquiries allocated to your roster will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#DCE5E8]/80">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#EEF3F5]/45 -mx-3 px-3 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 shrink-0 rounded-full bg-[#E6EFEA] border border-[#B7CBC2] text-[#263331] flex items-center justify-center font-bold text-xs">
                      {lead.first_name?.[0] || "L"}
                      {lead.last_name?.[0] || ""}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#263331] truncate">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-xs text-[#546866] truncate">
                        {lead.email} &bull; {lead.preferred_country || "Undecided"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <StatusBadge tone={getLeadStatusTone(lead.status)} className="uppercase">
                      {lead.status?.replace(/_/g, " ") || "new"}
                    </StatusBadge>
                    <Link
                      href="/counsellor/leads"
                      className="text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline whitespace-nowrap"
                    >
                      Follow Up &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advisory Checklist / Protocol */}
        <div className="beyond-card p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#2F6B55]">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-bold text-[#263331] text-base">Advisory Protocol</h2>
            </div>
          </div>
          <p className="text-xs text-[#546866] leading-relaxed">
            LUGIE ethical counseling standards must be honored on all communications:
          </p>

          <div className="space-y-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8] text-xs space-y-1">
              <span className="font-semibold text-[#263331] block">1. Honest Profile Evaluation</span>
              <p className="text-[#546866] leading-relaxed">
                Never promise guaranteed admissions or visas. Assess candidates accurately against public university GPA criteria.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8] text-xs space-y-1">
              <span className="font-semibold text-[#263331] block">2. Document Integrity</span>
              <p className="text-[#546866] leading-relaxed">
                Verify original transcripts and language test TRFs. Reject unverified certifications.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8] text-xs space-y-1">
              <span className="font-semibold text-[#263331] block">3. Fee Transparency</span>
              <p className="text-[#546866] leading-relaxed">
                Adhere strictly to standard pricing packages (₹7,999, ₹13,999, ₹24,999). University fees are non-negotiable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
