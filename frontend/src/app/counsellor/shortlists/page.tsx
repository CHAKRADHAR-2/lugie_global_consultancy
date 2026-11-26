"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Building2,
  Sparkles,
  Search,
  CheckCircle2,
  User,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalShell, StatusBadge } from "@/components/ui/feedback";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonCard } from "@/components/ui/skeleton";

interface StudentOpted {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  university_name: string;
  country: string;
  course_name: string;
  intake: string;
  tier: string;
  student_notes: string | null;
  status: string;
  counsellor_opinion: string | null;
  counsellor_verdict: string | null;
  created_at: string;
}

interface StudentOption {
  id: string;
  student_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

const INPUT_CLASS =
  "w-full rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 px-3.5 py-2.5 text-sm text-[#394B49] placeholder:text-[#546866]/70 focus:border-[#394B49] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B7CBC2] transition";

function getTierTone(tier: string): "success" | "sage" | "warm" | "misty" {
  const t = (tier || "").toLowerCase();
  if (t === "dream") return "warm";
  if (t === "safe") return "success";
  if (t === "target") return "sage";
  return "misty";
}

export default function CounsellorShortlistsPage() {
  const [optedList, setOptedList] = useState<StudentOpted[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Review Modal State
  const [reviewModalItem, setReviewModalItem] = useState<StudentOpted | null>(null);
  const [verdict, setVerdict] = useState("Strong Competitive Match");
  const [opinion, setOpinion] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // New Recommendation Modal State
  const [showRecModal, setShowRecModal] = useState(false);
  const [recStudentId, setRecStudentId] = useState("");
  const [recUniName, setRecUniName] = useState("");
  const [recCountry, setRecCountry] = useState("United Kingdom");
  const [recCourse, setRecCourse] = useState("");
  const [recIntake, setRecIntake] = useState("Fall 2027");
  const [recTier, setRecTier] = useState("target");
  const [recReason, setRecReason] = useState("");
  const [recFees, setRecFees] = useState("£24,000 - £28,000 / year");
  const [recChance, setRecChance] = useState("High (75-85%)");
  const [submittingRec, setSubmittingRec] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const [optedRes, studentsRes] = await Promise.allSettled([
        api.get<StudentOpted[]>("shortlists/opted/all"),
        api.get<StudentOption[]>("students"),
      ]);

      if (optedRes.status === "fulfilled") {
        const val = optedRes.value as any;
        const list = Array.isArray(val) ? val : val?.items || [];
        setOptedList(list);
      }
      if (studentsRes.status === "fulfilled") {
        const val = studentsRes.value as any;
        const list: StudentOption[] = Array.isArray(val) ? val : val?.items || [];
        setStudents(list);
        if (list.length > 0 && !recStudentId) {
          setRecStudentId(list[0].id);
        }
      }
    } catch (err: any) {
      console.error("Failed to load shortlists:", err);
      toast.error("Failed to load shortlists");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenReview = (item: StudentOpted) => {
    setReviewModalItem(item);
    setVerdict(item.counsellor_verdict || "Strong Competitive Match");
    setOpinion(item.counsellor_opinion || "");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem || !opinion.trim()) {
      toast.error("Please enter your detailed opinion notes.");
      return;
    }

    setSubmittingReview(true);
    try {
      const updated = await api.post<StudentOpted>(
        `shortlists/opted/${reviewModalItem.id}/counsellor-review`,
        {
          status: "reviewed",
          counsellor_verdict: verdict,
          counsellor_opinion: opinion.trim(),
        }
      );
      toast.success("Expert opinion submitted to student!");
      setOptedList((prev) =>
        prev.map((o) => (o.id === reviewModalItem.id ? { ...o, ...updated } : o))
      );
      setReviewModalItem(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit opinion");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCreateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recStudentId || !recUniName.trim() || !recCourse.trim()) {
      toast.error("Please fill in university name and course.");
      return;
    }

    setSubmittingRec(true);
    try {
      await api.post("shortlists/recommendations", {
        student_id: recStudentId,
        university_name: recUniName.trim(),
        country: recCountry,
        course_name: recCourse.trim(),
        intake: recIntake,
        tier: recTier,
        match_reason: recReason.trim() || undefined,
        tuition_fee_range: recFees.trim() || undefined,
        admission_chance: recChance,
      });

      toast.success("Strategic recommendation sent to candidate's portal!");
      setShowRecModal(false);
      setRecUniName("");
      setRecCourse("");
      setRecReason("");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit recommendation");
    } finally {
      setSubmittingRec(false);
    }
  };

  const filteredOpted = optedList.filter((item) => {
    const q = search.toLowerCase();
    const uniMatch = item.university_name.toLowerCase().includes(q);
    const countryMatch = item.country.toLowerCase().includes(q);
    const courseMatch = item.course_name.toLowerCase().includes(q);
    const studentMatch =
      (item.student_name && item.student_name.toLowerCase().includes(q)) ||
      (item.student_email && item.student_email.toLowerCase().includes(q));
    return !search || uniMatch || countryMatch || courseMatch || studentMatch;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl tracking-tight text-[#263331] flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>University Shortlisting &amp; Recommendations Desk</span>
          </h1>
          <p className="text-sm text-[#546866] mt-1">
            Review university nominations chosen by students and prescribe curated institutional strategies.
          </p>
        </div>
        <Button
          type="button"
          variant="warm"
          size="md"
          onClick={() => setShowRecModal(true)}
          className="shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          Recommend University to Student
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#F3F0E8]/60 border border-[#DCE5E8] rounded-xl p-3">
        <div className="relative">
          <Search className="h-4 w-4 text-[#546866] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by student name, email, university, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${INPUT_CLASS} pl-10 bg-white`}
          />
        </div>
      </div>

      {/* Main Opted Review Grid */}
      {loading ? (
        <div className="space-y-6">
          <div className="beyond-card p-6">
            <GlobalOrbitLoader label="Loading university nominations…" size="md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      ) : filteredOpted.length === 0 ? (
        <div className="beyond-card p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258]">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-[#263331]">No student opted universities found</h3>
          <p className="text-sm text-[#546866] mt-1">
            When candidates opt universities in their portal, they appear here for your advisory verdict.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpted.map((item) => {
            const isReviewed = Boolean(item.status === "reviewed" || item.counsellor_opinion);
            return (
              <div
                key={item.id}
                className="beyond-card beyond-card-interactive p-5 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  {/* Top Candidate & Status Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#DCE5E8] pb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 font-bold text-sm text-[#263331]">
                        <User className="h-3.5 w-3.5 text-[#3F6258] shrink-0" />
                        <span className="truncate">{item.student_name || "Enrolled Student"}</span>
                      </div>
                      <div className="text-xs text-[#546866] flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.student_email || "Email on file"}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-1.5 shrink-0">
                      <StatusBadge tone={getTierTone(item.tier)} className="uppercase">
                        {item.tier} Choice
                      </StatusBadge>
                      <StatusBadge tone={isReviewed ? "success" : "warning"}>
                        {isReviewed ? "Reviewed" : "Pending Review"}
                      </StatusBadge>
                    </div>
                  </div>

                  {/* University & Course */}
                  <div>
                    <h2 className="font-bold text-[#263331] text-base">
                      {item.university_name}
                    </h2>
                    <p className="text-xs text-[#546866] font-medium mt-0.5">
                      {item.course_name} &bull;{" "}
                      <span className="text-[#3F6258] font-semibold">{item.country}</span>
                    </p>
                    <p className="text-xs text-[#546866] mt-1">
                      Target Intake:{" "}
                      <span className="font-semibold text-[#263331]">{item.intake}</span>
                    </p>
                  </div>

                  {/* Student's Query / Notes */}
                  {item.student_notes && (
                    <div className="bg-[#F3F0E8]/60 rounded-xl p-3.5 text-xs border border-[#DCE5E8]">
                      <span className="font-semibold text-[#263331] block mb-1">
                        Student&apos;s Query:
                      </span>
                      <p className="text-[#546866] italic leading-relaxed">
                        &ldquo;{item.student_notes}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Counsellor Opinion Verdict */}
                  {isReviewed && (
                    <div className="bg-[#EDF5F1] rounded-xl p-3.5 text-xs border border-[#B7CBC2] space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#2F6B55]">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                        <span>Advisory Verdict: {item.counsellor_verdict}</span>
                      </div>
                      <p className="text-[#263331] leading-relaxed">{item.counsellor_opinion}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-[#DCE5E8] flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-[#546866]">
                    {isReviewed ? "Delivered to candidate" : "Awaiting your evaluation"}
                  </span>
                  <Button
                    type="button"
                    variant={isReviewed ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleOpenReview(item)}
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isReviewed ? "Update Opinion" : "Submit Expert Opinion"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Opinion Modal */}
      <ModalShell
        isOpen={Boolean(reviewModalItem)}
        onClose={() => setReviewModalItem(null)}
        title="Advisory Verdict & Opinion on Nominated Choice"
        subtitle={
          reviewModalItem
            ? `For ${reviewModalItem.student_name || "Student"}: ${reviewModalItem.university_name}`
            : undefined
        }
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Admissions Calibrated Verdict *
            </label>
            <select
              value={verdict}
              onChange={(e) => setVerdict(e.target.value)}
              className={INPUT_CLASS}
            >
              <option value="Strong Competitive Match">
                Strong Competitive Match (High Probability)
              </option>
              <option value="Target / High Fit">
                Target / Direct Fit (Balanced Strategy)
              </option>
              <option value="Ambitious Reach">
                Ambitious Reach (Requires Strong SOP/GRE)
              </option>
              <option value="High Risk / Safety Net Required">
                High Risk / Safety Net Required
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Expert Counsellor Opinion &amp; Strategic Guidance *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Provide concrete advice on entrance exams, minimum CGPA cutoff, Vorprufung curricular matching, or alternative suggestions..."
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setReviewModalItem(null)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingReview}
              loadingText="Sending..."
              disabled={submittingReview}
            >
              Deliver Opinion
            </Button>
          </div>
        </form>
      </ModalShell>

      {/* Add Recommendation Modal */}
      <ModalShell
        isOpen={showRecModal}
        onClose={() => setShowRecModal(false)}
        title="Recommend University to Candidate"
        subtitle="Suggest strategic universities tailored to the student's academic background."
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleCreateRecommendation} className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Select Student *
            </label>
            <select
              value={recStudentId}
              onChange={(e) => setRecStudentId(e.target.value)}
              className={INPUT_CLASS}
              required
            >
              {students.map((s) => {
                const name =
                  s.student_name ||
                  `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
                  s.email ||
                  "Candidate";
                return (
                  <option key={s.id} value={s.id}>
                    {name} ({s.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                University Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Imperial College London"
                value={recUniName}
                onChange={(e) => setRecUniName(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Country *
              </label>
              <select
                value={recCountry}
                onChange={(e) => setRecCountry(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="United Kingdom">United Kingdom</option>
                <option value="Germany">Germany</option>
                <option value="United States">United States</option>
                <option value="Ireland">Ireland</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Programme / Course *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. MSc Advanced Computing"
                value={recCourse}
                onChange={(e) => setRecCourse(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Intake
              </label>
              <input
                type="text"
                placeholder="e.g. Fall 2027"
                value={recIntake}
                onChange={(e) => setRecIntake(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Tier Category
              </label>
              <select
                value={recTier}
                onChange={(e) => setRecTier(e.target.value)}
                className={INPUT_CLASS}
              >
                <option value="dream">Dream (Ambitious)</option>
                <option value="target">Target (High Fit)</option>
                <option value="safe">Safe (High Acceptance)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
                Estimated Acceptance Chance
              </label>
              <input
                type="text"
                placeholder="e.g. High (80-90%)"
                value={recChance}
                onChange={(e) => setRecChance(e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Tuition Fee Range
            </label>
            <input
              type="text"
              placeholder="e.g. £24,000 - £28,000 / year"
              value={recFees}
              onChange={(e) => setRecFees(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#394B49] mb-1.5">
              Why this institution matches the candidate?
            </label>
            <textarea
              rows={2}
              placeholder="Explains curriculum alignment, placement track record, or post-study work visa benefits..."
              value={recReason}
              onChange={(e) => setRecReason(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setShowRecModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={submittingRec}
              loadingText="Submitting..."
              disabled={submittingRec}
            >
              Send Recommendation
            </Button>
          </div>
        </form>
      </ModalShell>
    </div>
  );
}
