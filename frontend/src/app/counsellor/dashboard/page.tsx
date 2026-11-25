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
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
  Plus,
  Loader2,
} from "lucide-react";

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
          : (leadsVal?.items && Array.isArray(leadsVal.items) ? leadsVal.items : []);

        const studentsVal = students.status === "fulfilled" ? students.value : [];
        const studentsList: any[] = Array.isArray(studentsVal)
          ? studentsVal
          : ((studentsVal as any)?.items && Array.isArray((studentsVal as any).items) ? (studentsVal as any).items : []);

        const assessmentsVal = assessments.status === "fulfilled" ? assessments.value : [];
        const assessmentsList: any[] = Array.isArray(assessmentsVal)
          ? assessmentsVal
          : ((assessmentsVal as any)?.items && Array.isArray((assessmentsVal as any).items) ? (assessmentsVal as any).items : []);

        const applicationsVal = applications.status === "fulfilled" ? applications.value : null;
        const applicationsList: any[] = Array.isArray(applicationsVal)
          ? applicationsVal
          : (applicationsVal?.items && Array.isArray(applicationsVal.items) ? applicationsVal.items : []);

        setMetrics({
          leadsCount: typeof leadsVal?.total === "number" ? leadsVal.total : leadsList.length,
          studentsCount: studentsList.length,
          assessmentsCount: assessmentsList.length,
          applicationsCount: typeof applicationsVal?.total === "number" ? applicationsVal.total : applicationsList.length,
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
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "My Assigned Leads",
      value: metrics.leadsCount,
      desc: "Prospects requiring qualification",
      href: "/counsellor/leads",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Students",
      value: metrics.studentsCount,
      desc: "Enrolled profile mentees",
      href: "/counsellor/students",
      icon: GraduationCap,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Profile Assessments",
      value: metrics.assessmentsCount,
      desc: "Drafted & reviewed evaluations",
      href: "/counsellor/assessments",
      icon: ClipboardCheck,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Applications In Progress",
      value: metrics.applicationsCount,
      desc: "Live university submissions",
      href: "/counsellor/applications",
      icon: FileCheck,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/10 via-secondary/20 to-primary/5 p-6 sm:p-8 border border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
              Advisory Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-2">
              Welcome back, {user?.first_name || "Counsellor"}!
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
              Track your student candidate pool, draft strategic evaluations, and shepherd applications through admission decisions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/counsellor/assessments"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-sm transition-opacity"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-card p-5 rounded-2xl border border-border hover:border-primary/40 transition-all shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-bold tracking-tight text-foreground">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Bottom Section: Recent Leads & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leads */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground text-base">Recent Leads & Enquiries</h3>
              <p className="text-xs text-muted-foreground">Prospects assigned to you</p>
            </div>
            <Link
              href="/counsellor/leads"
              className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No assigned leads found yet.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-xs">
                      {lead.first_name[0]}
                      {lead.last_name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {lead.email} • {lead.preferred_country || "Undecided"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                      {lead.status}
                    </span>
                    <Link
                      href="/counsellor/leads"
                      className="text-xs text-primary font-medium hover:underline ml-2"
                    >
                      Follow Up
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Advisory Checklist / Workflow Tips */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-foreground text-base flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Advisory Protocol
          </h3>
          <p className="text-xs text-muted-foreground">
            LUGIE ethical counseling standards must be honored on all communications:
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs space-y-1">
              <span className="font-semibold text-foreground">1. Honest Profile Evaluation</span>
              <p className="text-muted-foreground">
                Never promise guaranteed admissions or visas. Assess candidates accurately against public university GPA criteria.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs space-y-1">
              <span className="font-semibold text-foreground">2. Document Integrity</span>
              <p className="text-muted-foreground">
                Verify original transcripts and language test TRFs. Reject unverified certifications.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border text-xs space-y-1">
              <span className="font-semibold text-foreground">3. Fee Transparency</span>
              <p className="text-muted-foreground">
                Adhere strictly to standard pricing packages (₹7,999, ₹13,999, ₹24,999). University fees are non-negotiable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
