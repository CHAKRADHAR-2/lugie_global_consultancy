"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  Building2,
  ClipboardCheck,
  MapPin,
  Mail,
  Phone,
  MessageSquare,
  Eye,
  BookOpen,
  Award,
  Briefcase,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { DocumentRevealLoader, GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonCard } from "@/components/ui/skeleton";

interface Student {
  id: string;
  user_id: string;
  student_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  active_package?: string;
  date_of_birth: string | null;
  nationality: string | null;
  current_city: string | null;
  current_country: string | null;
  preferred_intake: string | null;
  profile_completion: number;
}

interface FullDossier {
  profile: any;
  academics: any[];
  language_tests: any[];
  work_experiences: any[];
  projects: any[];
  documents: any[];
  opted_universities: any[];
  recommendations: any[];
  assessment: any | null;
}

function getTierTone(tier: string): "success" | "sage" | "warm" | "misty" {
  const t = (tier || "").toLowerCase();
  if (t === "dream") return "warm";
  if (t === "safe") return "success";
  if (t === "target") return "sage";
  return "misty";
}

export default function CounsellorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Full Dossier Modal State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<FullDossier | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await api.get<any>("students");
        const list: Student[] = Array.isArray(data)
          ? data
          : data?.items && Array.isArray(data.items)
          ? data.items
          : [];
        setStudents(list);
      } catch (err) {
        console.error("Failed to load students:", err);
        toast.error("Failed to load student list.");
      } finally {
        setLoading(false);
      }
    }
    loadStudents();
  }, []);

  async function openDossier(studentId: string) {
    setSelectedStudentId(studentId);
    setLoadingDossier(true);
    setDossier(null);
    try {
      const data = await api.get<FullDossier>(`students/${studentId}/full-dossier`);
      setDossier(data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load candidate dossier");
    } finally {
      setLoadingDossier(false);
    }
  }

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const name = (s.student_name || `${s.first_name || ""} ${s.last_name || ""}`).toLowerCase();
    const email = (s.email || "").toLowerCase();
    const phone = (s.phone || "").toLowerCase();
    const city = (s.current_city || "").toLowerCase();
    const country = (s.current_country || "").toLowerCase();
    const intake = (s.preferred_intake || "").toLowerCase();
    return (
      name.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      city.includes(q) ||
      country.includes(q) ||
      intake.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>Enrolled Students Directory</span>
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Manage your assigned student roster, evaluate profiles, and review full academic dossiers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/counsellor/messages"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <MessageSquare className="h-4 w-4 text-[#3F6258]" />
            Chat Desk
          </Link>
          <Link
            href="/counsellor/assessments"
            className={buttonVariants({ variant: "primary", size: "md" })}
          >
            <ClipboardCheck className="h-4 w-4" />
            Conduct Assessment
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-3">
        <div className="relative">
          <Search className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student full name, email, phone, city, or target intake..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="space-y-6">
          <div className="beyond-card p-6">
            <GlobalOrbitLoader label="Syncing enrolled students…" size="md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-[#263331]">No students found</h3>
          <p className="text-sm text-[#546866] mt-1">
            {search ? "No students matching your search criteria." : "Enrolled students will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((student) => {
            const displayName =
              student.student_name ||
              `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
              student.email ||
              "Candidate";
            const completion = Math.min(100, Math.max(0, student.profile_completion || 0));
            return (
              <div
                key={student.id}
                className="beyond-card beyond-card-interactive p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 shrink-0 rounded-full bg-[#E6EFEA] border border-[#B7CBC2] text-[#263331] flex items-center justify-center font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-bold text-[#263331] text-sm truncate">
                          {displayName}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-[#546866] mt-0.5">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate">{student.email || "No email"}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1 text-xs text-[#546866] mt-0.5">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusBadge tone="sage" className="shrink-0">
                      {student.active_package || "Free Tier"}
                    </StatusBadge>
                  </div>

                  {/* Profile Completion Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-[#546866] mb-1.5">
                      <span>Profile Readiness</span>
                      <span className="font-semibold text-[#263331] tabular-nums">{completion}%</span>
                    </div>
                    <div className="w-full bg-[#DCE5E8] rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          completion >= 80
                            ? "bg-[#2F6B55]"
                            : completion >= 40
                            ? "bg-[#D9A879]"
                            : "bg-[#A63A3A]"
                        }`}
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl bg-[#F3F0E8]/60 border border-[#DCE5E8] p-3 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[#546866] block">Target Intake</span>
                      <div className="font-semibold text-[#263331] mt-0.5">
                        {student.preferred_intake || "Not Selected"}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#546866] block">Location</span>
                      <div className="font-semibold text-[#263331] truncate mt-0.5">
                        {[student.current_city, student.current_country || "India"]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#DCE5E8] flex flex-wrap items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="sage"
                    size="sm"
                    onClick={() => openDossier(student.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Full Dossier
                  </Button>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/counsellor/assessments?student_id=${student.id}`}
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#546866] hover:text-[#394B49] hover:underline"
                    >
                      <ClipboardCheck className="h-3.5 w-3.5" />
                      Assessment
                    </Link>
                    <Link
                      href="/counsellor/messages"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#546866] hover:text-[#394B49] hover:underline"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Student Dossier Modal */}
      <ModalShell
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        title="Complete Candidate Dossier & Academic Records"
        subtitle="Comprehensive verified data across profile, academics, tests, and opted universities."
        maxWidth="max-w-4xl"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
          {loadingDossier ? (
            <div className="py-16 flex items-center justify-center">
              <DocumentRevealLoader label="Loading full candidate dossier…" size="lg" />
            </div>
          ) : dossier ? (
            <>
              {/* Top Candidate Bar */}
              <div className="bg-[#E6EFEA]/70 rounded-xl p-5 border border-[#B7CBC2] flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-[#263331]">
                      {dossier.profile.student_name}
                    </h3>
                    <StatusBadge tone="sage">
                      {dossier.profile.active_package || "Free Tier"}
                    </StatusBadge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#546866] mt-1.5">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" /> {dossier.profile.email}
                    </span>
                    {dossier.profile.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> {dossier.profile.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />{" "}
                      {[dossier.profile.current_city, dossier.profile.current_country]
                        .filter(Boolean)
                        .join(", ") || "India"}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-[#546866]">
                    Target Intake
                  </p>
                  <p className="text-base font-bold text-[#2F6B55] mt-0.5">
                    {dossier.profile.preferred_intake || "Not set"}
                  </p>
                </div>
              </div>

              {/* 1. Academic History (Class X, XII, Undergrad) */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#263331] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#3F6258]" />
                  Academic Qualifications (Class X, XII, Undergrad)
                </h4>
                {dossier.academics.length === 0 ? (
                  <p className="text-xs text-[#546866] italic">No academic records submitted yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dossier.academics.map((ac) => (
                      <div
                        key={ac.id}
                        className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] text-xs space-y-1"
                      >
                        <div className="flex justify-between items-start font-bold text-[#263331]">
                          <span>{ac.qualification}</span>
                          <span className="text-[#2F6B55]">
                            {ac.cgpa ? `${ac.cgpa} CGPA` : `${ac.percentage}%`}
                          </span>
                        </div>
                        <p className="text-[#394B49] font-medium">{ac.institution}</p>
                        {ac.degree && (
                          <p className="text-[#546866]">
                            Degree: {ac.degree} ({ac.specialisation || "General"})
                          </p>
                        )}
                        <div className="flex justify-between text-[11px] text-[#546866] pt-1">
                          <span>
                            Duration: {ac.start_date || "N/A"} -{" "}
                            {ac.is_current ? "Present" : ac.end_date || "N/A"}
                          </span>
                          {ac.backlogs > 0 && (
                            <span className="text-[#A63A3A] font-semibold">
                              {ac.backlogs} Backlogs
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. English & Standardized Tests (IELTS, GRE, etc.) */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#263331] flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#8E572C]" />
                  Standardized &amp; English Proficiency Tests
                </h4>
                {dossier.language_tests.length === 0 ? (
                  <p className="text-xs text-[#546866] italic">
                    No standardized test scores reported yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {dossier.language_tests.map((t) => (
                      <div
                        key={t.id}
                        className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] text-xs text-center space-y-1"
                      >
                        <span className="font-bold text-[#263331] text-sm uppercase block">
                          {t.test_type}
                        </span>
                        <span className="text-lg font-bold text-[#3F6258] block tabular-nums">
                          {t.overall_score}
                        </span>
                        <div className="text-[10px] text-[#546866]">
                          L:{t.listening || "-"} | R:{t.reading || "-"} | W:{t.writing || "-"} | S:
                          {t.speaking || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Work Experience & Projects */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#263331] flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#3F6258]" />
                  Work Experience &amp; Technical Projects
                </h4>
                {dossier.work_experiences.length === 0 && dossier.projects.length === 0 ? (
                  <p className="text-xs text-[#546866] italic">
                    No work experiences or projects reported yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dossier.work_experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] text-xs space-y-1"
                      >
                        <div className="font-bold text-[#263331]">
                          {exp.job_title} @ {exp.company_name}
                        </div>
                        <p className="text-[#546866] text-[11px]">
                          {exp.location || "On-site"} &bull; {exp.employment_type || "Full-time"}
                        </p>
                        <p className="text-[#546866] text-[11px] line-clamp-2">{exp.description}</p>
                      </div>
                    ))}
                    {dossier.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] text-xs space-y-1"
                      >
                        <div className="font-bold text-[#263331]">{proj.title}</div>
                        <p className="text-[#546866] text-[11px] line-clamp-2">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Student Opted Universities & Counsellor Recommendations */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-[#263331] flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#3F6258]" />
                  University Shortlists &amp; Opted Choices
                </h4>
                {dossier.opted_universities.length === 0 ? (
                  <p className="text-xs text-[#546866] italic">
                    No student nominated universities yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {dossier.opted_universities.map((opt) => (
                      <div
                        key={opt.id}
                        className="bg-[#F3F0E8]/60 rounded-xl p-3.5 border border-[#DCE5E8] text-xs flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#263331]">
                            {opt.university_name} ({opt.country})
                          </div>
                          <p className="text-[#546866] mt-0.5">
                            {opt.course_name} &bull; {opt.intake}
                          </p>
                          {opt.counsellor_opinion && (
                            <p className="text-[#2F6B55] font-medium mt-1">
                              Verdict: {opt.counsellor_verdict || "Reviewed"} &mdash;{" "}
                              {opt.counsellor_opinion}
                            </p>
                          )}
                        </div>
                        <StatusBadge tone={getTierTone(opt.tier)} className="uppercase w-fit shrink-0">
                          {opt.tier}
                        </StatusBadge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-6 pt-4 border-t border-[#DCE5E8] flex justify-end">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setSelectedStudentId(null)}
          >
            Close Dossier
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}
