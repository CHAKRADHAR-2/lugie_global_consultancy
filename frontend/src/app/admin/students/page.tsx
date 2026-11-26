"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { SkeletonRow } from "@/components/ui/skeleton";
import { DocumentRevealLoader } from "@/components/ui/loading-concepts";
import {
  GraduationCap,
  Search,
  User,
  Building2,
  Mail,
  Phone,
  Eye,
  BookOpen,
  Award,
  Briefcase,
  MapPin,
  MessageSquare,
} from "lucide-react";

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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Full Dossier Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<FullDossier | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      try {
        const data = await api.get<Student[]>("students");
        setStudents(data || []);
      } catch (err) {
        console.error("Failed to load students:", err);
        toast.error("Failed to load student profiles.");
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
    const intake = (s.preferred_intake || "").toLowerCase();
    const city = (s.current_city || "").toLowerCase();
    return (
      !search ||
      name.includes(q) ||
      email.includes(q) ||
      phone.includes(q) ||
      intake.includes(q) ||
      city.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E572C]">
            Student Roster
          </span>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] mt-0.5">
            Active Students Directory &amp; Dossiers
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Total {students.length} registered students enrolled in admissions advisory programs.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/admin/messages"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <MessageSquare className="h-4 w-4 text-[#3F6258]" />
            Supervisory Chat Desk
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F3F0E8]/75 border border-[#DCE5E8] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#546866]" />
          <input
            type="text"
            placeholder="Search by student full name, email, phone, location, or intake..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#DCE5E8] bg-white pl-10 pr-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
          />
        </div>
        <span className="text-xs font-medium text-[#546866] shrink-0">
          Showing <strong className="text-[#263331]">{filtered.length}</strong> of{" "}
          <strong className="text-[#263331]">{students.length}</strong> students
        </span>
      </div>

      {/* Table Card */}
      <div className="beyond-card overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-1">
            <SkeletonRow cols={7} />
            <SkeletonRow cols={7} />
            <SkeletonRow cols={7} />
            <SkeletonRow cols={7} />
          </div>
        ) : students.length === 0 ? (
          <div className="py-14 text-center px-4">
            <GraduationCap className="h-10 w-10 text-[#546866]/45 mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#263331]">No registered students yet</p>
            <p className="text-xs text-[#546866] mt-1">
              Convert enquiries from the CRM Leads page to create student accounts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3F0E8]/75 border-b border-[#DCE5E8] text-[11px] font-semibold uppercase tracking-wider text-[#546866]">
                <tr>
                  <th className="py-3.5 px-4">Candidate Details</th>
                  <th className="py-3.5 px-4">Contact (Email &amp; Phone)</th>
                  <th className="py-3.5 px-4">Enrolled Plan</th>
                  <th className="py-3.5 px-4">City / Country</th>
                  <th className="py-3.5 px-4">Target Intake</th>
                  <th className="py-3.5 px-4">Readiness</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE5E8]/80 text-[#394B49]">
                {filtered.map((s) => {
                  const displayName =
                    s.student_name ||
                    `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
                    s.email ||
                    "Candidate";
                  const planName = s.active_package || "Free Tier";
                  const isPaidPlan = Boolean(s.active_package && s.active_package !== "Free Tier");

                  return (
                    <tr key={s.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-sm text-[#263331] flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6EFEA] text-[#3F6258] border border-[#B7CBC2]">
                            <User className="h-3.5 w-3.5" />
                          </span>
                          <span>{displayName}</span>
                        </div>
                        <span className="font-mono text-[10px] text-[#546866] pl-9 block">
                          ID: {s.id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-[#394B49] font-medium">
                          <Mail className="h-3 w-3 text-[#546866] shrink-0" />
                          <span>{s.email || "No email"}</span>
                        </div>
                        {s.phone && (
                          <div className="flex items-center gap-1.5 text-[#546866] text-[11px] mt-0.5">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge tone={isPaidPlan ? "warm" : "misty"}>
                          {planName}
                        </StatusBadge>
                      </td>
                      <td className="py-3.5 px-4 text-[#546866]">
                        {[s.current_city, s.current_country || "India"].filter(Boolean).join(", ")}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#3F6258]">
                        {s.preferred_intake || "Not set"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-[#EEF3F5] rounded-full h-2 overflow-hidden border border-[#DCE5E8]">
                            <div
                              className="h-full bg-[#394B49] rounded-full transition-all duration-500"
                              style={{ width: `${s.profile_completion}%` }}
                            />
                          </div>
                          <span className="font-semibold text-[11px] text-[#263331]">
                            {s.profile_completion}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openDossier(s.id)}
                        >
                          <Eye className="h-3.5 w-3.5" /> Full Dossier
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Dossier Modal */}
      <ModalShell
        isOpen={Boolean(selectedStudentId)}
        onClose={() => setSelectedStudentId(null)}
        title="Admin Full Candidate Dossier & Academic Records"
        subtitle="Complete records for candidate verification and audit."
        maxWidth="max-w-4xl"
      >
        <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-6">
          {loadingDossier ? (
            <div className="py-16">
              <DocumentRevealLoader label="Loading full candidate dossier…" size="lg" />
            </div>
          ) : dossier ? (
            <>
              {/* Top Candidate Bar (Executive Forest Slate) */}
              <div className="rounded-2xl bg-[#394B49] text-white p-5 flex flex-wrap items-center justify-between gap-4 border border-[#263331]">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-semibold text-white">
                      {dossier.profile.student_name}
                    </h3>
                    <span className="rounded-full bg-[#D9A879] px-2.5 py-0.5 text-[11px] font-semibold text-[#263331]">
                      {dossier.profile.active_package}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#DCE5E8] mt-1.5">
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
                  <p className="text-[11px] uppercase tracking-wider text-[#B7CBC2]">Target Intake</p>
                  <p className="text-base font-semibold text-white">
                    {dossier.profile.preferred_intake || "Not set"}
                  </p>
                </div>
              </div>

              {/* 1. Academic History */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#263331] flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-[#3F6258]" />
                  Academic Records (Class X, Class XII, Undergrad)
                </h4>
                {dossier.academics.length === 0 ? (
                  <p className="text-xs text-[#546866] italic">No academic records submitted yet.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dossier.academics.map((ac) => (
                      <div
                        key={ac.id}
                        className="bg-[#F3F0E8]/75 rounded-xl p-3.5 border border-[#DCE5E8] text-xs space-y-1"
                      >
                        <div className="flex justify-between items-start font-semibold text-[#263331]">
                          <span>{ac.qualification}</span>
                          <span className="text-[#3F6258]">
                            {ac.cgpa ? `${ac.cgpa} CGPA` : `${ac.percentage}%`}
                          </span>
                        </div>
                        <p className="text-[#394B49]">{ac.institution}</p>
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

              {/* 2. English & Standardized Tests */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#263331] flex items-center gap-2">
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
                        className="bg-[#F3F0E8]/75 rounded-xl p-3.5 border border-[#DCE5E8] text-xs text-center space-y-1"
                      >
                        <span className="font-semibold text-[#263331] text-sm uppercase block">
                          {t.test_type}
                        </span>
                        <span className="text-lg font-bold text-[#394B49] block">
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
                <h4 className="text-sm font-semibold text-[#263331] flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#394B49]" />
                  Work Experience &amp; Technical Projects
                </h4>
                {dossier.work_experiences.length === 0 && dossier.projects.length === 0 ? (
                  <p className="text-xs text-[#546866] italic">
                    No work experience or technical projects added yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dossier.work_experiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-[#F3F0E8]/75 rounded-xl p-3.5 border border-[#DCE5E8] text-xs space-y-1"
                      >
                        <div className="font-semibold text-[#263331]">
                          {exp.job_title} @ {exp.company_name}
                        </div>
                        <p className="text-[#546866] text-[11px]">
                          {exp.location || "On-site"} • {exp.employment_type || "Full-time"}
                        </p>
                        <p className="text-[#546866] text-[11px] line-clamp-2">{exp.description}</p>
                      </div>
                    ))}
                    {dossier.projects.map((proj) => (
                      <div
                        key={proj.id}
                        className="bg-[#F3F0E8]/75 rounded-xl p-3.5 border border-[#DCE5E8] text-xs space-y-1"
                      >
                        <div className="font-semibold text-[#263331]">{proj.title}</div>
                        <p className="text-[#546866] text-[11px] line-clamp-2">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Student Opted Universities */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#263331] flex items-center gap-2">
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
                        className="bg-[#F3F0E8]/75 rounded-xl p-3.5 border border-[#DCE5E8] text-xs flex justify-between items-center gap-3"
                      >
                        <div>
                          <div className="font-semibold text-[#263331]">
                            {opt.university_name} ({opt.country})
                          </div>
                          <p className="text-[#546866]">
                            {opt.course_name} • {opt.intake}
                          </p>
                          {opt.counsellor_opinion && (
                            <p className="text-[#3F6258] font-medium mt-1">
                              Verdict: {opt.counsellor_verdict || "Reviewed"} —{" "}
                              {opt.counsellor_opinion}
                            </p>
                          )}
                        </div>
                        <StatusBadge tone="sage" className="uppercase text-[10px]">
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
          <Button variant="secondary" size="md" onClick={() => setSelectedStudentId(null)}>
            Close Dossier
          </Button>
        </div>
      </ModalShell>
    </div>
  );
}
