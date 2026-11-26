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
  FileCheck2,
  ShieldCheck,
  Mail,
  Smartphone,
} from "lucide-react";
import { VerificationModal } from "@/components/auth/VerificationModal";

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
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  const completionPct = profile?.profile_completion || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(222,47%,11%)]">
            Welcome back, {user?.first_name}! 👋
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your profile readiness, applications, and verified documents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/student/universities"
            className="inline-flex items-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition"
          >
            <Building2 className="h-4 w-4" />
            Explore Universities
          </Link>
          <Link
            href="/student/documents"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
          >
            <Upload className="h-4 w-4" />
            Upload Document
          </Link>
        </div>
      </div>

      {/* Verification Status Banner */}
      <div className={`rounded-2xl p-4 md:p-5 border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition ${
        verificationStatus.is_email_verified && verificationStatus.is_phone_verified
          ? "bg-emerald-50/50 border-emerald-200"
          : "bg-amber-50/60 border-amber-200"
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl mt-0.5 ${
            verificationStatus.is_email_verified && verificationStatus.is_phone_verified
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2">
              Candidate Contact Verification
              {verificationStatus.is_email_verified && verificationStatus.is_phone_verified ? (
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> All Channels Verified
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Action Required
                </span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[11px] text-gray-600">
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-gray-400" />
                Email: {verificationStatus.is_email_verified ? (
                  <strong className="text-emerald-700">Verified (Brevo)</strong>
                ) : (
                  <span className="text-amber-700 font-medium">Unverified</span>
                )}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Smartphone className="h-3 w-3 text-gray-400" />
                Mobile: {verificationStatus.is_phone_verified ? (
                  <strong className="text-emerald-700">Verified (Firebase)</strong>
                ) : (
                  <span className="text-amber-700 font-medium">Unverified</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsVerificationModalOpen(true)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap shadow-sm ${
            verificationStatus.is_email_verified && verificationStatus.is_phone_verified
              ? "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              : "bg-amber-600 text-white hover:bg-amber-700"
          }`}
        >
          {verificationStatus.is_email_verified && verificationStatus.is_phone_verified
            ? "Manage Verification"
            : "Complete Verification"}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Profile Completion */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Profile Strength
            </span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
              {completionPct}%
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-3xl font-extrabold text-[hsl(222,47%,11%)]">
              {completionPct}%
            </span>
          </div>
          <div className="mt-3 w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-[hsl(166,72%,40%)] h-2 rounded-full transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <Link
            href="/student/profile"
            className="mt-3 inline-block text-xs font-semibold text-[hsl(166,72%,40%)] hover:underline"
          >
            Complete profile details →
          </Link>
        </div>

        {/* Applications */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Applications
            </span>
            <GraduationCap className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[hsl(222,47%,11%)]">
            {applications.length}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {applications.filter((a) => a.status === "submitted").length} submitted to universities
          </p>
          <Link
            href="/student/applications"
            className="mt-3 inline-block text-xs font-semibold text-purple-600 hover:underline"
          >
            View applications tracker →
          </Link>
        </div>

        {/* Documents */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Verified Documents
            </span>
            <FileText className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[hsl(222,47%,11%)]">
            {documents.length}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {documents.filter((d) => d.scan_status === "clean" || d.scan_status === "scan_disabled").length} verified safe
          </p>
          <Link
            href="/student/documents"
            className="mt-3 inline-block text-xs font-semibold text-emerald-600 hover:underline"
          >
            Manage student dossier →
          </Link>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Unread Alerts
            </span>
            <Bell className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-4 text-3xl font-extrabold text-[hsl(222,47%,11%)]">
            {unreadCount}
          </p>
          <p className="mt-2 text-xs text-gray-500">Status updates & counsellor messages</p>
          <Link
            href="/student/messages"
            className="mt-3 inline-block text-xs font-semibold text-amber-600 hover:underline"
          >
            Check notifications →
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Applications List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[hsl(222,47%,11%)]">
                Active Applications
              </h2>
              <Link
                href="/student/applications"
                className="text-xs font-semibold text-[hsl(166,72%,40%)] hover:underline"
              >
                View all ({applications.length})
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
                <GraduationCap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">No applications started yet</p>
                <p className="text-xs text-gray-500 mt-1">
                  Explore verified universities and start your first university draft.
                </p>
                <Link
                  href="/student/universities"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)]"
                >
                  Browse Universities <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 transition"
                  >
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {app.application_reference || `Application #${app.id.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Created {new Date(app.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                        {app.status}
                      </span>
                      <Link
                        href={`/student/applications`}
                        className="text-xs font-semibold text-[hsl(166,72%,40%)] hover:underline"
                      >
                        Details →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Profile Completion Next Steps & Advisory Banner */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm mb-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span>Assigned Counsellor Desk</span>
            </div>
            <p className="text-xs text-emerald-950 leading-relaxed">
              Your profile is reviewed directly by our founding consultancy team. Ensure your
              undergraduate transcripts and language test scores are submitted so we can finalize
              your university shortlists.
            </p>
            <div className="mt-4 pt-3 border-t border-emerald-200/50 flex justify-between items-center text-xs">
              <span className="font-semibold text-emerald-900">Need direct advice?</span>
              <a
                href="mailto:counselling@lugie.com"
                className="font-bold text-emerald-700 underline"
              >
                Message Counsellor
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[hsl(222,47%,11%)]">
              Next Action Items
            </h3>
            <ul className="space-y-3 text-xs text-gray-600">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${completionPct >= 50 ? "text-emerald-600" : "text-gray-300"}`} />
                <span>Fill personal & passport details</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${documents.length > 0 ? "text-emerald-600" : "text-gray-300"}`} />
                <span>Upload undergraduate marksheet or degree</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${applications.length > 0 ? "text-emerald-600" : "text-gray-300"}`} />
                <span>Review university shortlist with counsellor</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
