"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import Link from "next/link";
import {
  GraduationCap,
  Search,
  User,
  Calendar,
  CheckCircle2,
  Building2,
  Loader2,
  ClipboardCheck,
  FileText,
  MapPin,
  ArrowRight,
  Mail,
  Phone,
  CreditCard,
  MessageSquare,
  Eye,
  X,
  BookOpen,
  Award,
  Briefcase,
  FileCheck,
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
        const data = await api.get<Student[]>("students");
        setStudents(data || []);
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
    const city = (s.current_city || "").toLowerCase();
    const country = (s.current_country || "").toLowerCase();
    const intake = (s.preferred_intake || "").toLowerCase();
    return name.includes(q) || email.includes(q) || city.includes(q) || country.includes(q) || intake.includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Enrolled Students Directory
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage your assigned student roster, evaluate profiles, and review full academic dossiers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/counsellor/messages"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted shadow-sm transition"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            Chat Desk
          </Link>
          <Link
            href="/counsellor/assessments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-sm transition-opacity"
          >
            <ClipboardCheck className="h-4 w-4" />
            Conduct Assessment
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-card p-3 rounded-2xl border border-border shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          type="text"
          placeholder="Search by student full name, email, phone, city, or target intake..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground">No students found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {search ? "No students matching your search criteria." : "Enrolled students will appear here."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((student) => {
            const displayName = student.student_name || `${student.first_name || ""} ${student.last_name || ""}`.trim() || student.email || "Candidate";
            return (
              <div
                key={student.id}
                className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                          {displayName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span className="truncate max-w-[180px]">{student.email || "No email"}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-primary/20">
                      {student.active_package || "Free Tier"}
                    </span>
                  </div>

                  {/* Profile Completion Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Profile Readiness</span>
                      <span className="font-semibold text-foreground">{student.profile_completion}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          student.profile_completion >= 80
                            ? "bg-emerald-500"
                            : student.profile_completion >= 40
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${student.profile_completion}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Target Intake:</span>
                      <div className="font-semibold text-foreground">
                        {student.preferred_intake || "Not Selected"}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <div className="font-semibold text-foreground truncate">
                        {[student.current_city, student.current_country || "India"].filter(Boolean).join(", ")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => openDossier(student.id)}
                    className="inline-flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Full Dossier
                  </button>
                  <Link
                    href={`/counsellor/assessments?student_id=${student.id}`}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ClipboardCheck className="h-3.5 w-3.5" />
                    Assessment
                  </Link>
                  <Link
                    href="/counsellor/messages"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Chat
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Student Dossier Modal */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl max-h-[90vh] rounded-3xl bg-card border border-border shadow-2xl flex flex-col overflow-hidden my-auto">
            {/* Header */}
            <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Complete Candidate Dossier & Academic Records
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Comprehensive verified data across profile, academics, tests, and opted universities.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="p-2 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loadingDossier ? (
                <div className="py-24 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Loading full candidate dossier...</p>
                </div>
              ) : dossier ? (
                <>
                  {/* Top Candidate Bar */}
                  <div className="bg-primary/5 rounded-2xl p-5 border border-primary/20 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold text-foreground">
                          {dossier.profile.student_name}
                        </h4>
                        <span className="bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full text-xs">
                          {dossier.profile.active_package}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {dossier.profile.email}
                        </span>
                        {dossier.profile.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {dossier.profile.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{" "}
                          {[dossier.profile.current_city, dossier.profile.current_country].filter(Boolean).join(", ") || "India"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Target Intake</p>
                      <p className="text-base font-bold text-primary">{dossier.profile.preferred_intake || "Not set"}</p>
                    </div>
                  </div>

                  {/* 1. Academic History (Class X, XII, Undergrad) */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Academic Qualifications (Class X, XII, Undergrad)
                    </h5>
                    {dossier.academics.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No academic records submitted yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {dossier.academics.map((ac) => (
                          <div key={ac.id} className="bg-muted/30 rounded-xl p-3 border border-border text-xs space-y-1">
                            <div className="flex justify-between items-start font-bold text-foreground">
                              <span>{ac.qualification}</span>
                              <span className="text-primary">{ac.cgpa ? `${ac.cgpa} CGPA` : `${ac.percentage}%`}</span>
                            </div>
                            <p className="text-muted-foreground">{ac.institution}</p>
                            {ac.degree && <p className="text-muted-foreground">Degree: {ac.degree} ({ac.specialisation || "General"})</p>}
                            <div className="flex justify-between text-[11px] text-muted-foreground/80 pt-1">
                              <span>Duration: {ac.start_date || "N/A"} - {ac.is_current ? "Present" : ac.end_date || "N/A"}</span>
                              {ac.backlogs > 0 && <span className="text-rose-600 font-semibold">{ac.backlogs} Backlogs</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 2. English & Standardized Tests (IELTS, GRE, etc.) */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Award className="h-4 w-4 text-primary" />
                      Standardized & English Proficiency Tests
                    </h5>
                    {dossier.language_tests.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No standardized test scores reported yet.</p>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {dossier.language_tests.map((t) => (
                          <div key={t.id} className="bg-muted/30 rounded-xl p-3 border border-border text-xs text-center space-y-1">
                            <span className="font-bold text-foreground text-sm uppercase block">{t.test_type}</span>
                            <span className="text-lg font-bold text-primary block">{t.overall_score}</span>
                            <div className="text-[10px] text-muted-foreground">
                              L:{t.listening || "-"} | R:{t.reading || "-"} | W:{t.writing || "-"} | S:{t.speaking || "-"}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Work Experience & Projects */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      Work Experience & Technical Projects
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dossier.work_experiences.map((exp) => (
                        <div key={exp.id} className="bg-muted/30 rounded-xl p-3 border border-border text-xs space-y-1">
                          <div className="font-bold text-foreground">{exp.job_title} @ {exp.company_name}</div>
                          <p className="text-muted-foreground text-[11px]">{exp.location || "On-site"} • {exp.employment_type || "Full-time"}</p>
                          <p className="text-muted-foreground text-[11px] line-clamp-2">{exp.description}</p>
                        </div>
                      ))}
                      {dossier.projects.map((proj) => (
                        <div key={proj.id} className="bg-muted/30 rounded-xl p-3 border border-border text-xs space-y-1">
                          <div className="font-bold text-foreground">{proj.title}</div>
                          <p className="text-muted-foreground text-[11px] line-clamp-2">{proj.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Student Opted Universities & Counsellor Recommendations */}
                  <div className="space-y-3">
                    <h5 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      University Shortlists & Opted Choices
                    </h5>
                    {dossier.opted_universities.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No student nominated universities yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {dossier.opted_universities.map((opt) => (
                          <div key={opt.id} className="bg-muted/30 rounded-xl p-3 border border-border text-xs flex justify-between items-center">
                            <div>
                              <div className="font-bold text-foreground">{opt.university_name} ({opt.country})</div>
                              <p className="text-muted-foreground">{opt.course_name} • {opt.intake}</p>
                              {opt.counsellor_opinion && (
                                <p className="text-primary font-medium mt-1">
                                  Verdict: {opt.counsellor_verdict || "Reviewed"} — {opt.counsellor_opinion}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {opt.tier}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/10">
              <button
                onClick={() => setSelectedStudentId(null)}
                className="rounded-xl border border-border px-5 py-2 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
