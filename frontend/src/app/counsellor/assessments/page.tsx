"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Search,
  Plus,
  Send,
  Edit3,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Loader2,
  User,
  Globe2,
  BookOpen,
} from "lucide-react";

interface Assessment {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  assessed_by: string | null;
  assessment_type: string;
  strengths: any;
  weaknesses: any;
  recommended_countries: any;
  recommended_courses: any;
  eligibility_notes: string | null;
  improvement_suggestions: any;
  status: string;
  is_reviewed: boolean;
  reviewed_at: string | null;
  created_at: string;
}

interface StudentOption {
  id: string;
  student_name?: string;
  email?: string;
  phone?: string;
  nationality: string | null;
  current_country: string | null;
  preferred_intake: string | null;
}

function AssessmentsContent() {
  const searchParams = useSearchParams();
  const preselectedStudent = searchParams?.get("student_id") || "";

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    student_id: preselectedStudent,
    assessment_type: "manual",
    strengths: "",
    weaknesses: "",
    recommended_countries: "",
    recommended_courses: "",
    eligibility_notes: "",
    improvement_suggestions: "",
  });

  async function loadData() {
    try {
      const [assessmentsRes, studentsRes] = await Promise.allSettled([
        api.get<Assessment[]>("assessments"),
        api.get<StudentOption[]>("students"),
      ]);
      if (assessmentsRes.status === "fulfilled") {
        setAssessments(assessmentsRes.value || []);
      }
      if (studentsRes.status === "fulfilled") {
        setStudents(studentsRes.value || []);
      }
    } catch (err) {
      console.error("Failed to load assessments:", err);
      toast.error("Failed to load assessments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    if (preselectedStudent) {
      setFormData((prev) => ({ ...prev, student_id: preselectedStudent }));
      setIsModalOpen(true);
    }
  }, [preselectedStudent]);

  async function handleCreateAssessment(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.student_id) {
      toast.error("Please select a student.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        student_id: formData.student_id,
        assessment_type: formData.assessment_type,
        strengths: formData.strengths ? { summary: formData.strengths } : null,
        weaknesses: formData.weaknesses ? { summary: formData.weaknesses } : null,
        recommended_countries: formData.recommended_countries
          ? formData.recommended_countries.split(",").map((s) => s.trim())
          : [],
        recommended_courses: formData.recommended_courses
          ? formData.recommended_courses.split(",").map((s) => s.trim())
          : [],
        eligibility_notes: formData.eligibility_notes || null,
        improvement_suggestions: formData.improvement_suggestions
          ? { suggestions: formData.improvement_suggestions }
          : null,
      };

      await api.post("assessments", payload);
      toast.success("Draft assessment saved successfully!");
      setIsModalOpen(false);
      setFormData({
        student_id: "",
        assessment_type: "manual",
        strengths: "",
        weaknesses: "",
        recommended_countries: "",
        recommended_courses: "",
        eligibility_notes: "",
        improvement_suggestions: "",
      });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmitForReview(assessmentId: string) {
    if (!confirm("Submit this evaluation to Admin for quality verification?")) return;
    try {
      await api.post(`assessments/${assessmentId}/submit`, {});
      toast.success("Assessment submitted for Admin review!");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit assessment.");
    }
  }

  const filtered = assessments.filter((a) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      (a.student_name && a.student_name.toLowerCase().includes(q)) ||
      (a.student_email && a.student_email.toLowerCase().includes(q)) ||
      a.student_id.includes(q) ||
      (a.eligibility_notes && a.eligibility_notes.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-6 w-6 text-primary" />
            Profile Assessments
          </h1>
          <p className="text-sm text-muted-foreground">
            Author structured evaluations analyzing student GPA, test readiness, country options, and gap remediation.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 shadow-sm transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Create Assessment
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 bg-card p-2.5 rounded-2xl border border-border">
          <Search className="h-4 w-4 text-muted-foreground ml-2" />
          <input
            type="text"
            placeholder="Search by student ID or evaluation notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-2xl border border-border">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none text-sm focus:outline-none text-foreground font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Assessments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-40" />
          <h3 className="font-semibold text-foreground">No assessments found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Click "Create Assessment" above to evaluate a student profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {item.student_name || `Candidate #${item.student_id.slice(0, 8)}`}
                      </span>
                      <span className="text-xs text-muted-foreground">({item.assessment_type})</span>
                    </div>
                    {item.student_email && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.student_email}</p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase ${
                      item.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : item.status === "submitted"
                        ? "bg-blue-500/10 text-blue-600"
                        : item.status === "rejected"
                        ? "bg-rose-500/10 text-rose-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {item.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                    {item.status === "submitted" && <Clock className="h-3 w-3" />}
                    {item.status === "rejected" && <XCircle className="h-3 w-3" />}
                    {item.status === "draft" && <AlertTriangle className="h-3 w-3" />}
                    {item.status}
                  </span>
                </div>

                {/* Recommendations */}
                <div className="mt-4 space-y-2 text-xs">
                  {item.recommended_countries && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <Globe2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">Recommended: </span>
                        {Array.isArray(item.recommended_countries)
                          ? item.recommended_countries.join(", ")
                          : JSON.stringify(item.recommended_countries)}
                      </div>
                    </div>
                  )}

                  {item.recommended_courses && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-foreground">Target Courses: </span>
                        {Array.isArray(item.recommended_courses)
                          ? item.recommended_courses.join(", ")
                          : JSON.stringify(item.recommended_courses)}
                      </div>
                    </div>
                  )}

                  {item.eligibility_notes && (
                    <p className="mt-2 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-xl border border-border">
                      {item.eligibility_notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  Drafted {new Date(item.created_at).toLocaleDateString()}
                </span>
                {item.status === "draft" && (
                  <button
                    onClick={() => handleSubmitForReview(item.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
                  >
                    <Send className="h-3 w-3" />
                    Submit for Approval
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-xl rounded-3xl p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-primary" />
                Draft Profile Assessment
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssessment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">Select Student *</label>
                <select
                  required
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                >
                  <option value="">-- Choose a student profile --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.student_name || `Candidate #${s.id.slice(0, 8)}`} ({s.email || "No email"} • {s.preferred_intake || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Recommended Study Destinations (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Germany, Ireland, UK"
                  value={formData.recommended_countries}
                  onChange={(e) => setFormData({ ...formData, recommended_countries: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Recommended Courses / Programs (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="M.Sc Computer Science, Data Engineering"
                  value={formData.recommended_courses}
                  onChange={(e) => setFormData({ ...formData, recommended_courses: e.target.value })}
                  className="w-full mt-1 px-3 py-2 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Academic Strengths</label>
                <textarea
                  rows={2}
                  placeholder="e.g. 8.6 CGPA from tier-1 university, 2 published research papers..."
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  className="w-full mt-1 p-2.5 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Areas for Improvement / Gaps</label>
                <textarea
                  rows={2}
                  placeholder="e.g. IELTS 6.0 needs improvement to 6.5+ band; 1 year study gap needs work experience proof..."
                  value={formData.weaknesses}
                  onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
                  className="w-full mt-1 p-2.5 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Advisory Eligibility Notes *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Comprehensive assessment notes detailing university admission match, visa viability, and realistic deadlines..."
                  value={formData.eligibility_notes}
                  onChange={(e) => setFormData({ ...formData, eligibility_notes: e.target.value })}
                  className="w-full mt-1 p-2.5 text-sm bg-muted rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm rounded-xl border border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-sm rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CounsellorAssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AssessmentsContent />
    </Suspense>
  );
}
