"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { openAuthenticatedUrl } from "@/lib/auth-tokens";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModalShell, StatusBadge, FeedbackBanner } from "@/components/ui/feedback";
import { SkeletonRow } from "@/components/ui/skeleton";
import { DocumentRevealLoader } from "@/components/ui/loading-concepts";
import {
  GraduationCap,
  Search,
  User,
  UserPlus,
  Building2,
  Mail,
  Phone,
  Eye,
  BookOpen,
  Award,
  Briefcase,
  MapPin,
  MessageSquare,
  Trash2,
  FileText,
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
  is_active?: boolean;
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
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);

  // Add Student Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    current_city: "",
    current_country: "India",
    preferred_intake: "",
    password: "",
  });

  // Remove Student Confirmation Modal
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Full Dossier Modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [dossier, setDossier] = useState<FullDossier | null>(null);
  const [loadingDossier, setLoadingDossier] = useState(false);

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

  useEffect(() => {
    loadStudents();
  }, []);

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post<Student>("students", {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        current_city: formData.current_city.trim() || null,
        current_country: formData.current_country.trim() || "India",
        preferred_intake: formData.preferred_intake.trim() || null,
        password: formData.password,
      });
      toast.success(`Student account created for ${formData.first_name.trim()} ${formData.last_name.trim()}`);
      setIsAddModalOpen(false);
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        current_city: "",
        current_country: "India",
        preferred_intake: "",
        password: "",
      });
      await loadStudents();
    } catch (err: any) {
      toast.error(err.message || "Failed to create student account.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleStatus(student: Student) {
    const currentlyActive = student.is_active !== false;
    setTogglingUserId(student.user_id);
    try {
      await api.patch(`users/${student.user_id}/status`, { is_active: !currentlyActive });
      setStudents((prev) =>
        prev.map((item) =>
          item.user_id === student.user_id ? { ...item, is_active: !currentlyActive } : item
        )
      );
      toast.success(`Student account ${!currentlyActive ? "activated" : "deactivated"}.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update student status.");
    } finally {
      setTogglingUserId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`students/${studentToDelete.id}`);
      const deletedId = studentToDelete.id;
      const displayName =
        studentToDelete.student_name ||
        `${studentToDelete.first_name || ""} ${studentToDelete.last_name || ""}`.trim() ||
        studentToDelete.email ||
        "Student";
      setStudents((prev) => prev.filter((item) => item.id !== deletedId));
      if (selectedStudentId === deletedId) {
        setSelectedStudentId(null);
        setDossier(null);
      }
      toast.success(`${displayName} has been removed.`);
      setStudentToDelete(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove student account.");
    } finally {
      setDeleting(false);
    }
  }

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
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href="/admin/messages"
            className={buttonVariants({ variant: "secondary", size: "md" })}
          >
            <MessageSquare className="h-4 w-4 text-[#3F6258]" />
            Supervisory Chat Desk
          </Link>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            Add Student
          </Button>
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
            <p className="text-xs text-[#546866] mt-1 mb-4">
              Add a student directly or convert enquiries from the CRM Leads page to create student accounts.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddModalOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Add First Student
            </Button>
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
                  const isActive = s.is_active !== false;

                  return (
                    <tr key={s.id} className="hover:bg-[#EEF3F5]/45 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-sm text-[#263331] flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E6EFEA] text-[#3F6258] border border-[#B7CBC2]">
                            <User className="h-3.5 w-3.5" />
                          </span>
                          <span>{displayName}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-9 mt-1">
                          <span className="font-mono text-[10px] text-[#546866]">
                            ID: {s.id.slice(0, 8)}...
                          </span>
                          <StatusBadge tone={isActive ? "success" : "error"}>
                            {isActive ? "Active" : "Inactive"}
                          </StatusBadge>
                        </div>
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
                        <div className="inline-flex flex-wrap items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openDossier(s.id)}
                          >
                            <Eye className="h-3.5 w-3.5" /> Dossier
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            loading={togglingUserId === s.user_id}
                            loadingText="Saving…"
                            onClick={() => handleToggleStatus(s)}
                          >
                            {isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setStudentToDelete(s)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </Button>
                        </div>
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

              {/* 5. Uploaded Documents */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-[#263331] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#3F6258]" />
                  Uploaded Dossier Documents ({(dossier.documents || []).length})
                </h4>
                {(dossier.documents || []).length === 0 ? (
                  <p className="text-xs text-[#546866] italic">
                    No documents uploaded by this candidate yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {(dossier.documents || []).map((doc: any) => (
                      <div
                        key={doc.id}
                        className="bg-[#F3F0E8]/75 rounded-xl p-3.5 border border-[#DCE5E8] text-xs flex flex-wrap justify-between items-center gap-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-[#263331] truncate">
                            {doc.document_type?.replace(/_/g, " ") || "Document"}
                          </div>
                          <p className="text-[#546866] truncate mt-0.5">
                            {doc.file_name} • {((doc.file_size || 0) / 1024).toFixed(0)} KB
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge
                            tone={
                              doc.status === "verified"
                                ? "success"
                                : doc.status === "rejected"
                                ? "error"
                                : "misty"
                            }
                            className="uppercase text-[10px]"
                          >
                            {doc.status}
                          </StatusBadge>
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              openAuthenticatedUrl(
                                `/api/proxy/documents/${doc.id}/file`,
                                doc.file_name || "document"
                              ).catch((e) =>
                                toast.error(
                                  e instanceof Error ? e.message : "Unable to open document."
                                )
                              )
                            }
                          >
                            <Eye className="h-3.5 w-3.5" /> Inspect
                          </Button>
                        </div>
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

      {/* Add Student Modal */}
      <ModalShell
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
        subtitle="Create a student portal account and onboarding workspace."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                placeholder="Aarav"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                placeholder="Mehta"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              placeholder="student@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              placeholder="+91 9876543210"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.current_city}
                onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                placeholder="Bengaluru"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1">
                Target Intake
              </label>
              <input
                type="text"
                value={formData.preferred_intake}
                onChange={(e) => setFormData({ ...formData, preferred_intake: e.target.value })}
                className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
                placeholder="Fall 2026"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1">
              Temporary Password *
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition"
              placeholder="Minimum 8 characters"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              loadingText="Creating…"
            >
              Create Student
            </Button>
          </div>
        </form>
      </ModalShell>

      {/* Remove Student Confirmation Modal */}
      <ModalShell
        isOpen={Boolean(studentToDelete)}
        onClose={() => !deleting && setStudentToDelete(null)}
        title="Remove Student Account"
        subtitle="Confirm permanent deletion of this student record."
        maxWidth="max-w-md"
      >
        {studentToDelete && (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#DCE5E8] bg-[#F3F0E8]/60 p-3.5 text-xs text-[#394B49]">
              <p className="font-semibold text-sm text-[#263331]">
                {studentToDelete.student_name ||
                  `${studentToDelete.first_name || ""} ${studentToDelete.last_name || ""}`.trim() ||
                  "Student"}
              </p>
              <p className="text-[#546866] mt-0.5">{studentToDelete.email || "No email"}</p>
            </div>

            <FeedbackBanner
              tone="warning"
              title="This action cannot be undone"
              message="Removing this student will permanently delete their portal login, academic dossier, uploaded documents, applications, chat history, and order records. Use Deactivate instead if you only want to suspend login access temporarily."
            />

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                size="md"
                disabled={deleting}
                onClick={() => setStudentToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="md"
                loading={deleting}
                loadingText="Removing…"
                onClick={handleConfirmDelete}
              >
                <Trash2 className="h-4 w-4" /> Remove Permanently
              </Button>
            </div>
          </div>
        )}
      </ModalShell>
    </div>
  );
}
