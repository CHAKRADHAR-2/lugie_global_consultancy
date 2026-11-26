"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import {
  FileText,
  GraduationCap,
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  Upload,
  Building2,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  Mail,
  Smartphone,
  Compass,
  MessageSquare,
} from "lucide-react";
import { VerificationModal } from "@/components/auth/VerificationModal";
import { Button, buttonVariants } from "@/components/ui/button";
import { HorizonPath } from "@/components/ui/horizon-path";
import { SkeletonJourney } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/feedback";

interface StudentProfile {
  id: string;
  user_id: string;
  profile_completion: number;
  current_country: string | null;
  preferred_intake: string | null;
}

interface Application {
  id: string;
  course_id: string;
  status: string;
  created_at: string;
  application_reference: string | null;
}

interface DocumentItem {
  id: string;
  document_type: string;
  filename: string;
  scan_status: string;
  created_at: string;
}

function getAppStatusTone(status: string): "success" | "sage" | "warm" | "misty" | "warning" | "error" {
  const s = status.toLowerCase();
  if (s.includes("offer") || s.includes("accept") || s.includes("enroll") || s.includes("approv")) {
    return "success";
  }
  if (s.includes("submit") || s.includes("review")) {
    return "sage";
  }
  if (s.includes("pending") || s.includes("wait")) {
    return "warning";
  }
  if (s.includes("reject") || s.includes("declin")) {
    return "error";
  }
  if (s.includes("draft")) {
    return "warm";
  }
  return "misty";
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Verification state
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<{
    is_email_verified: boolean;
    is_phone_verified: boolean;
    email: string;
    phone: string | null;
  }>({
    is_email_verified: false,
    is_phone_verified: false,
    email: "",
    phone: null,
  });

  const loadVerificationStatus = async () => {
    try {
      const res = await api.get<{
        is_email_verified: boolean;
        is_phone_verified: boolean;
        email: string;
        phone: string | null;
      }>("auth/verification-status");
      if (res) {
        setVerificationStatus(res);
      }
    } catch (err) {
      console.error("Failed to fetch verification status:", err);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?from=/student/dashboard");
    } else if (user && (user.roles?.includes("super_admin") || user.roles?.includes("admin"))) {
      router.push("/admin/dashboard");
    } else if (user && user.roles?.includes("counsellor")) {
      router.push("/counsellor/dashboard");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    async function loadStudentData() {
      try {
        const [profData, appsData, docsData, notifData] = await Promise.allSettled([
          api.get<StudentProfile>("students/me/profile"),
          api.get<Application[]>("applications/me"),
          api.get<DocumentItem[]>("documents/me"),
          api.get<{ count: number }>("notifications/unread-count"),
        ]);

        if (profData.status === "fulfilled") setProfile(profData.value);
        if (appsData.status === "fulfilled") setApplications(appsData.value || []);
        if (docsData.status === "fulfilled") setDocuments(docsData.value || []);
        if (notifData.status === "fulfilled") setUnreadCount(notifData.value?.count || 0);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.roles?.includes("student")) {
      loadVerificationStatus();
      loadStudentData();
    }
  }, [user]);

  if (authLoading || (loading && user?.roles?.includes("student"))) {
    return <SkeletonJourney />;
  }

  const completionPct = Math.min(100, Math.max(0, profile?.profile_completion || 0));
  const allVerified = verificationStatus.is_email_verified && verificationStatus.is_phone_verified;
  const cleanDocuments = documents.filter(
    (d) => d.scan_status === "clean" || d.scan_status === "scan_disabled"
  );
  const pendingDocuments = documents.filter(
    (d) => d.scan_status !== "clean" && d.scan_status !== "scan_disabled" && d.scan_status !== "quarantined"
  );
  const submittedApps = applications.filter((a) => a.status !== "draft");
  const hasOfferOrVisa = applications.some((a) => {
    const s = a.status.toLowerCase();
    return s.includes("offer") || s.includes("accept") || s.includes("visa") || s.includes("enroll");
  });

  // Profile ring SVG geometry
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (completionPct / 100) * ringCircumference;

  // Horizon Path 5-step journey milestones
  const journeyMilestones = [
    {
      label: "Profile & Verification",
      detail: allVerified && completionPct >= 50 ? "Verified & active" : "Complete profile & OTP",
      href: "/student/profile",
      state: allVerified && completionPct >= 50 ? "done" : "current",
    },
    {
      label: "Documents & Tests",
      detail:
        cleanDocuments.length > 0
          ? `${cleanDocuments.length} verified file${cleanDocuments.length === 1 ? "" : "s"}`
          : "Upload transcripts",
      href: "/student/documents",
      state:
        cleanDocuments.length >= 2
          ? "done"
          : cleanDocuments.length > 0 || (allVerified && completionPct >= 50)
          ? "current"
          : "upcoming",
    },
    {
      label: "Shortlisting",
      detail: applications.length > 0 ? "Institutions selected" : "Nominate Dream / Target",
      href: "/student/universities",
      state:
        applications.length > 0
          ? "done"
          : cleanDocuments.length > 0
          ? "current"
          : "upcoming",
    },
    {
      label: "Application Filing",
      detail:
        submittedApps.length > 0
          ? `${submittedApps.length} submitted`
          : applications.length > 0
          ? `${applications.length} in draft`
          : "Pending shortlist",
      href: "/student/applications",
      state:
        submittedApps.length > 0
          ? "done"
          : applications.length > 0
          ? "current"
          : "upcoming",
    },
    {
      label: "Visa & Departure",
      detail: hasOfferOrVisa ? "Offer / visa stage" : "Post-offer readiness",
      href: "/student/applications",
      state: hasOfferOrVisa ? "done" : submittedApps.length > 0 ? "current" : "upcoming",
    },
  ] as const;

  const actionChecklist = [
    {
      done: allVerified,
      title: "Verify email & mobile channels",
      subtitle: allVerified
        ? "Email & phone verified for committee updates"
        : "Required for visa & offer notifications",
      actionType: "modal" as const,
      cta: allVerified ? "Verified" : "Verify now",
    },
    {
      done: completionPct >= 50,
      title: "Fill personal, passport & academic details",
      subtitle: `Profile strength currently at ${completionPct}%`,
      href: "/student/profile",
      cta: "Update profile",
    },
    {
      done: documents.length > 0,
      title: "Upload undergraduate marksheet or degree",
      subtitle:
        documents.length > 0
          ? `${cleanDocuments.length} of ${documents.length} scanned clean`
          : "Add transcripts & test scorecards",
      href: "/student/documents",
      cta: "Open dossier",
    },
    {
      done: applications.length > 0,
      title: "Review university shortlist with counsellor",
      subtitle:
        applications.length > 0
          ? `${applications.length} active application${applications.length === 1 ? "" : "s"}`
          : "Nominate Dream, Target & Safe options",
      href: "/student/universities",
      cta: "Explore choices",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Editorial Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#546866]">
              Your Admissions Horizon
            </span>
            {profile?.preferred_intake && (
              <StatusBadge tone="sage">Target: {profile.preferred_intake}</StatusBadge>
            )}
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#263331] tracking-tight">
            Welcome back, {user?.first_name}
          </h1>
          <p className="mt-1.5 text-sm text-[#546866]">
            Track your profile readiness, guided milestones, applications, and verified dossier.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/student/universities"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <Building2 className="h-4 w-4" />
            Explore Universities
          </Link>
          <Link
            href="/student/documents"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div
        className={`rounded-2xl p-4 md:p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
          allVerified
            ? "bg-[#E6EFEA] border-[#B7CBC2] text-[#263331]"
            : "bg-[#FCF6EC] border-[#D9A879] text-[#263331]"
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl mt-0.5 border ${
              allVerified
                ? "bg-white border-[#B7CBC2] text-[#2F6B55]"
                : "bg-[#F6EDE4] border-[#D9A879] text-[#8A5A1E]"
            }`}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xs font-bold text-[#263331]">
                Candidate Contact Verification
              </h2>
              {allVerified ? (
                <StatusBadge tone="success">
                  <CheckCircle2 className="h-3 w-3" />
                  All Channels Verified
                </StatusBadge>
              ) : (
                <StatusBadge tone="warning">
                  <AlertCircle className="h-3 w-3" />
                  Action Required
                </StatusBadge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-[#546866]">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#546866]" />
                Email:{" "}
                {verificationStatus.is_email_verified ? (
                  <strong className="text-[#2F6B55] font-semibold">Verified (Brevo)</strong>
                ) : (
                  <span className="text-[#8A5A1E] font-semibold">Unverified</span>
                )}
              </span>
              <span className="text-[#B7CBC2]">•</span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-[#546866]" />
                Mobile:{" "}
                {verificationStatus.is_phone_verified ? (
                  <strong className="text-[#2F6B55] font-semibold">Verified (Firebase)</strong>
                ) : (
                  <span className="text-[#8A5A1E] font-semibold">Unverified</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant={allVerified ? "secondary" : "warm"}
          size="sm"
          onClick={() => setIsVerificationModalOpen(true)}
          className="shrink-0"
        >
          {allVerified ? "Manage Verification" : "Complete Verification"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setIsVerificationModalOpen(false)}
        defaultEmail={user?.email || ""}
        defaultPhone={user?.phone || ""}
        initialVerifiedEmail={verificationStatus.is_email_verified}
        initialVerifiedPhone={verificationStatus.is_phone_verified}
        onSuccess={loadVerificationStatus}
      />

      {/* Horizon Path Journey Timeline */}
      <section className="beyond-card p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-[#8E572C]" />
              <h2 className="text-sm font-bold text-[#263331]">
                Your Guided Horizon Path
              </h2>
            </div>
            <p className="text-xs text-[#546866] mt-0.5">
              Every stage from dossier setup to pre-departure readiness in one calm overview.
            </p>
          </div>
          <div className="w-full sm:w-52">
            <HorizonPath variant="compact" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {journeyMilestones.map((step, index) => {
            const isDone = step.state === "done";
            const isCurrent = step.state === "current";
            return (
              <Link
                key={step.label}
                href={step.href}
                className={`group rounded-xl border p-3.5 transition flex flex-col justify-between gap-2.5 ${
                  isDone
                    ? "bg-[#E6EFEA]/70 border-[#B7CBC2] hover:bg-[#E6EFEA]"
                    : isCurrent
                    ? "bg-[#F6EDE4]/80 border-[#D9A879] hover:bg-[#F6EDE4]"
                    : "bg-[#F3F0E8]/60 border-[#DCE5E8] hover:border-[#B7CBC2] hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                      isDone
                        ? "bg-[#2F6B55] text-white"
                        : isCurrent
                        ? "bg-[#D9A879] text-[#263331]"
                        : "bg-white border border-[#DCE5E8] text-[#546866]"
                    }`}
                  >
                    {isDone ? "✓" : index + 1}
                  </span>
                  <StatusBadge tone={isDone ? "success" : isCurrent ? "warm" : "misty"}>
                    {isDone ? "Complete" : isCurrent ? "Active" : "Up Next"}
                  </StatusBadge>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#263331] group-hover:underline">
                    {step.label}
                  </p>
                  <p className="text-[11px] text-[#546866] mt-0.5">{step.detail}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile Completion Ring + Bar */}
        <div className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                Profile Strength
              </span>
              <p className="mt-2 text-3xl font-bold text-[#263331] tabular-nums">
                {completionPct}%
              </p>
            </div>
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
              <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  fill="none"
                  stroke="#B7CBC2"
                  strokeOpacity="0.45"
                  strokeWidth="5"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  fill="none"
                  stroke={completionPct >= 75 ? "#394B49" : "#D9A879"}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  className="transition-all duration-700"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-[#394B49] tabular-nums">
                {completionPct}%
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="w-full bg-[#B7CBC2]/35 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-[#394B49] via-[#6E8B82] to-[#D9A879]"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <Link
              href="/student/profile"
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline"
            >
              Complete profile details <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Applications */}
        <div className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                Applications
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF3F5] border border-[#DCE5E8] text-[#394B49]">
                <GraduationCap className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#263331] tabular-nums">
              {applications.length}
            </p>
            <p className="mt-1.5 text-xs text-[#546866]">
              {applications.filter((a) => a.status === "submitted").length} submitted to universities
            </p>
          </div>
          <Link
            href="/student/applications"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline"
          >
            View applications tracker <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Documents */}
        <div className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                Verified Documents
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#2F6B55]">
                <FileText className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#263331] tabular-nums">
              {documents.length}
            </p>
            <p className="mt-1.5 text-xs text-[#546866]">
              {cleanDocuments.length} verified safe
              {pendingDocuments.length > 0 ? ` • ${pendingDocuments.length} pending` : ""}
            </p>
          </div>
          <Link
            href="/student/documents"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline"
          >
            Manage student dossier <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Notifications */}
        <div className="beyond-card beyond-card-interactive p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                Unread Alerts
              </span>
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F6EDE4] border border-[#D9A879]/70 text-[#8E572C]">
                <Bell className="h-4 w-4" />
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[#263331] tabular-nums">
              {unreadCount}
            </p>
            <p className="mt-1.5 text-xs text-[#546866]">
              Status updates &amp; counsellor messages
            </p>
          </div>
          <Link
            href="/student/messages"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline"
          >
            Check notifications <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Applications & Document Scan Status */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Applications */}
          <div className="beyond-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-[#263331]">
                  Active Applications
                </h2>
                <p className="text-xs text-[#546866] mt-0.5">
                  Live status across your selected institutions
                </p>
              </div>
              <Link
                href="/student/applications"
                className="text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline"
              >
                View all ({applications.length})
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#B7CBC2] bg-[#F3F0E8]/50 p-8 text-center">
                <GraduationCap className="h-8 w-8 text-[#546866] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#263331]">
                  No applications started yet
                </p>
                <p className="text-xs text-[#546866] mt-1 max-w-sm mx-auto">
                  Explore verified universities and start your first university draft with your counsellor.
                </p>
                <Link
                  href="/student/universities"
                  className={buttonVariants({ variant: "primary", size: "sm", className: "mt-4" })}
                >
                  Browse Universities <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/40 hover:bg-[#E6EFEA]/40 hover:border-[#B7CBC2] transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#263331]">
                        {app.application_reference || `Application #${app.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-[#546866] mt-0.5 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        Created {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <StatusBadge tone={getAppStatusTone(app.status)} className="uppercase">
                        {app.status}
                      </StatusBadge>
                      <Link
                        href="/student/applications"
                        className="text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline whitespace-nowrap"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Dossier Scan Status */}
          <div className="beyond-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#263331]">
                  Dossier Scan &amp; Integrity Status
                </h2>
                <p className="text-xs text-[#546866] mt-0.5">
                  Recent transcripts, test scorecards, and identity records
                </p>
              </div>
              <Link
                href="/student/documents"
                className="text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline"
              >
                Open Dossier ({documents.length})
              </Link>
            </div>

            {documents.length === 0 ? (
              <div className="rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/50 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-[#546866] shrink-0" />
                  <p className="text-xs text-[#546866]">
                    Upload your passport, academic transcripts, and IELTS/GRE scorecards to unlock counsellor evaluation.
                  </p>
                </div>
                <Link
                  href="/student/documents"
                  className={buttonVariants({ variant: "secondary", size: "sm", className: "shrink-0" })}
                >
                  Upload Now
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {documents.slice(0, 3).map((doc) => {
                  const isClean = doc.scan_status === "clean" || doc.scan_status === "scan_disabled";
                  const isQuarantined = doc.scan_status === "quarantined";
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/40 px-4 py-3 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-[#263331] truncate">{doc.document_type}</p>
                        <p className="text-[11px] font-mono text-[#546866] truncate">{doc.filename}</p>
                      </div>
                      <StatusBadge
                        tone={isClean ? "success" : isQuarantined ? "error" : "warning"}
                        className="shrink-0"
                      >
                        {isClean ? "Clean" : isQuarantined ? "Quarantined" : "Scan Pending"}
                      </StatusBadge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Counsellor Desk & Next Recommended Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assigned Counsellor Communication Desk */}
          <div className="rounded-2xl border border-[#B7CBC2] bg-[#E6EFEA] p-6 text-[#263331] shadow-[0_1px_3px_rgba(57,75,73,0.04)]">
            <div className="flex items-center gap-2 font-bold text-[#263331] text-sm mb-2">
              <Sparkles className="h-4 w-4 text-[#8E572C]" />
              <span>Assigned Counsellor Desk</span>
            </div>
            <p className="text-xs text-[#394B49] leading-relaxed">
              Your profile is reviewed directly by our founding consultancy team. Ensure your
              undergraduate transcripts and language test scores are submitted so we can finalize
              your university shortlists.
            </p>

            <div className="mt-4 pt-4 border-t border-[#B7CBC2] flex flex-col gap-2.5">
              <Link
                href="/student/messages"
                className={buttonVariants({ variant: "primary", size: "sm", className: "w-full" })}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Open Counsellor Chat
              </Link>
              <div className="flex justify-between items-center text-[11px] pt-1">
                <span className="font-medium text-[#546866]">Prefer email?</span>
                <a
                  href="mailto:counselling@lugie.com"
                  className="font-semibold text-[#263331] underline hover:text-[#8E572C]"
                >
                  counselling@lugie.com
                </a>
              </div>
            </div>
          </div>

          {/* Next Recommended Actions Checklist */}
          <div className="beyond-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#263331]">
                Next Recommended Actions
              </h3>
              <span className="text-[11px] font-semibold text-[#546866] tabular-nums">
                {actionChecklist.filter((i) => i.done).length}/{actionChecklist.length} done
              </span>
            </div>

            <ul className="space-y-3">
              {actionChecklist.map((item) => (
                <li
                  key={item.title}
                  className={`rounded-xl border p-3 transition ${
                    item.done
                      ? "bg-[#EDF5F1]/60 border-[#B7CBC2]/70"
                      : "bg-[#F3F0E8]/60 border-[#DCE5E8]"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={`h-4 w-4 mt-0.5 shrink-0 ${
                        item.done ? "text-[#2F6B55]" : "text-[#B7CBC2]"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-xs font-semibold ${
                          item.done ? "text-[#263331]" : "text-[#394B49]"
                        }`}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#546866] mt-0.5">{item.subtitle}</p>
                      {!item.done && (
                        <div className="mt-2">
                          {"actionType" in item && item.actionType === "modal" ? (
                            <button
                              type="button"
                              onClick={() => setIsVerificationModalOpen(true)}
                              className="text-[11px] font-semibold text-[#8E572C] hover:underline cursor-pointer"
                            >
                              {item.cta} →
                            </button>
                          ) : (
                            <Link
                              href={item.href || "/student/profile"}
                              className="text-[11px] font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline"
                            >
                              {item.cta} →
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
