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
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Globe2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonCard } from "@/components/ui/skeleton";

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

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

function getAssessmentStatusTone(
  status: string
): "success" | "sage" | "warm" | "misty" | "warning" | "error" {
  const s = (status || "").toLowerCase();
  if (s === "approved") return "success";
  if (s === "submitted") return "sage";
  if (s === "rejected") return "error";
  if (s === "draft") return "misty";
  return "warning";
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
        const val = assessmentsRes.value as any;
        setAssessments(Array.isArray(val) ? val : val?.items || []);
      }
      if (studentsRes.status === "fulfilled") {
        const val = studentsRes.value as any;
        setStudents(Array.isArray(val) ? val : val?.items || []);
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
      a.student_id.toLowerCase().includes(q) ||
      (a.eligibility_notes && a.eligibility_notes.toLowerCase().includes(q));
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
            <ClipboardCheck className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>Profile Assessments</span>
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Author structured evaluations analyzing student GPA, test readiness, country options, and gap remediation.
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => setIsModalOpen(true)}
          className="shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create Assessment
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-3 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student ID or evaluation notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT_CLASS} pl-10 bg-white`}
          />
        </div>

        <div className="sm:w-52">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter assessments by status"
            className={`${INPUT_CLASS} bg-white font-medium`}
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
        <div className="space-y-6">
          <div className="beyond-card p-6">
            <GlobalOrbitLoader label="Loading profile assessments…" size="md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-[#263331]">No assessments found</h3>
          <p className="text-sm text-[#546866] mt-1">
            Click &ldquo;Create Assessment&rdquo; above to evaluate a student profile.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="beyond-card beyond-card-interactive p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-[#263331] text-sm">
                        {item.student_name || `Candidate #${item.student_id.slice(0, 8)}`}
                      </span>
                      <span className="text-xs text-[#546866]">({item.assessment_type})</span>
                    </div>
                    {item.student_email && (
                      <p className="text-xs text-[#546866] mt-0.5 truncate">{item.student_email}</p>
                    )}
                  </div>
                  <StatusBadge
                    tone={getAssessmentStatusTone(item.status)}
                    className="uppercase shrink-0"
                  >
                    {item.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                    {item.status === "submitted" && <Clock className="h-3 w-3" />}
                    {item.status === "rejected" && <XCircle className="h-3 w-3" />}
                    {item.status === "draft" && <AlertTriangle className="h-3 w-3" />}
                    {item.status}
                  </StatusBadge>
                </div>

                {/* Recommendations */}
                <div className="mt-4 space-y-2.5 text-xs">
                  {item.recommended_countries && (
                    <div className="flex items-start gap-2 text-[#546866]">
                      <Globe2 className="h-3.5 w-3.5 text-[#3F6258] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#263331]">Recommended: </span>
                        {Array.isArray(item.recommended_countries)
                          ? item.recommended_countries.join(", ")
                          : JSON.stringify(item.recommended_countries)}
                      </div>
                    </div>
                  )}

                  {item.recommended_courses && (
                    <div className="flex items-start gap-2 text-[#546866]">
                      <BookOpen className="h-3.5 w-3.5 text-[#8E572C] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#263331]">Target Courses: </span>
                        {Array.isArray(item.recommended_courses)
                          ? item.recommended_courses.join(", ")
                          : JSON.stringify(item.recommended_courses)}
                      </div>
                    </div>
                  )}

                  {item.eligibility_notes && (
                    <p className="mt-2 text-xs text-[#394B49] bg-[#F3F0E8]/60 p-3 rounded-xl border border-[#DCE5E8] leading-relaxed">
                      {item.eligibility_notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-[#DCE5E8] flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-[#546866]">
                  Drafted {new Date(item.created_at).toLocaleDateString()}
                </span>
                {item.status === "draft" && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleSubmitForReview(item.id)}
                  >
                    <Send className="h-3 w-3" />
                    Submit for Approval
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Assessment Modal */}
      <ModalShell
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Draft Profile Assessment"
        subtitle="Structure academic strengths, destination fit, and gap remediation."
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Select Student *
            </label>
            <select
              required
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className={INPUT_CLASS}
            >
              <option value="">-- Choose a student profile --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.student_name || `Candidate #${s.id.slice(0, 8)}`} ({s.email || "No email"} &bull;{" "}
                  {s.preferred_intake || "General"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Recommended Study Destinations (comma separated)
            </label>
            <input
              type="text"
              placeholder="Germany, Ireland, UK"
              value={formData.recommended_countries}
              onChange={(e) =>
                setFormData({ ...formData, recommended_countries: e.target.value })
              }
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Recommended Courses / Programs (comma separated)
            </label>
            <input
              type="text"
              placeholder="M.Sc Computer Science, Data Engineering"
              value={formData.recommended_courses}
              onChange={(e) =>
                setFormData({ ...formData, recommended_courses: e.target.value })
              }
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Academic Strengths
            </label>
            <textarea
              rows={2}
              placeholder="e.g. 8.6 CGPA from tier-1 university, 2 published research papers..."
              value={formData.strengths}
              onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Areas for Improvement / Gaps
            </label>
            <textarea
              rows={2}
              placeholder="e.g. IELTS 6.0 needs improvement to 6.5+ band; 1 year study gap needs work experience proof..."
              value={formData.weaknesses}
              onChange={(e) => setFormData({ ...formData, weaknesses: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Advisory Eligibility Notes *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Comprehensive assessment notes detailing university admission match, visa viability, and realistic deadlines..."
              value={formData.eligibility_notes}
              onChange={(e) => setFormData({ ...formData, eligibility_notes: e.target.value })}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submitting}
              loadingText="Saving..."
              disabled={submitting}
            >
              Save Draft
            </Button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}

export default function CounsellorAssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="beyond-card p-12 flex items-center justify-center">
          <GlobalOrbitLoader label="Loading profile assessments…" size="md" />
        </div>
      }
    >
      <AssessmentsContent />
    </Suspense>
  );
}
