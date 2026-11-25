"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  GraduationCap,
  Search,
  User,
  Calendar,
  CheckCircle2,
  Building2,
  Loader2,
  Mail,
  Phone,
  Eye,
  X,
  BookOpen,
  Award,
  Briefcase,
  MapPin,
  CreditCard,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

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
    return !search || name.includes(q) || email.includes(q) || phone.includes(q) || intake.includes(q) || city.includes(q);
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            Active Students Directory & Complete Dossiers
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Total {students.length} registered students enrolled in admissions advisory programs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/messages"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border text-foreground font-semibold text-sm hover:bg-muted shadow-sm transition"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            Supervisory Chat Desk
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-card p-3 rounded-2xl border border-border shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          type="text"
          placeholder="Search by student full name, email, phone, location, or intake..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="bg-card p-5 rounded-2xl border border-border shadow-sm overflow-hidden">
        {students.length === 0 ? (
          <div className="py-12 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-foreground">No registered students yet</p>
            <p className="text-xs text-muted-foreground mt-1">Convert enquiries from the CRM Leads page.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="p-3.5">Candidate Details</th>
                  <th className="p-3.5">Contact (Email & Phone)</th>
                  <th className="p-3.5">Enrolled Plan</th>
                  <th className="p-3.5">City / Country</th>
                  <th className="p-3.5">Target Intake</th>
                  <th className="p-3.5">Readiness</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-foreground">
                {filtered.map((s) => {
                  const displayName = s.student_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email || "Candidate";
                  return (
                    <tr key={s.id} className="hover:bg-muted/30 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-sm text-foreground flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-primary" />
                          <span>{displayName}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">ID: {s.id.slice(0, 8)}...</span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{s.email || "No email"}</span>
                        </div>
                        {s.phone && (
                          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] mt-0.5">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <span className="bg-primary/10 text-primary font-bold px-2.5 py-0.5 rounded-full text-[11px] border border-primary/20">
                          {s.active_package || "Free Tier"}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {[s.current_city, s.current_country || "India"].filter(Boolean).join(", ")}
                      </td>
                      <td className="p-3.5 font-semibold text-primary">
                        {s.preferred_intake || "Not set"}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${s.profile_completion}%` }}
                            />
                          </div>
                          <span className="font-semibold text-[11px]">{s.profile_completion}%</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => openDossier(s.id)}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5" /> Full Dossier
                        </button>
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
                    Admin Full Candidate Dossier & Academic Records
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Complete records for candidate verification and audit.
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
                      Academic Records (Class X, Class XII, Undergrad)
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
