"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Building2,
  GraduationCap,
  Sparkles,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Send,
  X,
  Compass,
  DollarSign,
  TrendingUp,
} from "lucide-react";

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
        setOptedList(optedRes.value || []);
      }
      if (studentsRes.status === "fulfilled") {
        const list = studentsRes.value || [];
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            University Shortlisting & Recommendations Desk
          </h1>
          <p className="text-sm text-muted-foreground">
            Review university nominations chosen by students and prescribe curated institutional strategies.
          </p>
        </div>
        <button
          onClick={() => setShowRecModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90"
        >
          <Sparkles className="h-4 w-4" />
          Recommend University to Student
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-card p-3 rounded-2xl border border-border shadow-sm">
        <Search className="h-4 w-4 text-muted-foreground ml-2" />
        <input
          type="text"
          placeholder="Search by student name, email, university, or country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-sm focus:outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Main Opted Review Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading university nominations...</p>
        </div>
      ) : filteredOpted.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-sm">
          <Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
          <h3 className="font-semibold text-foreground">No student opted universities found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            When candidates opt universities in their portal, they appear here for your advisory verdict.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOpted.map((item) => {
            const isReviewed = item.status === "reviewed" || item.counsellor_opinion;
            return (
              <div
                key={item.id}
                className="bg-card rounded-2xl border border-border p-5 flex flex-col justify-between hover:border-primary/40 transition shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Candidate & Status Bar */}
                  <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-foreground">
                        <User className="h-3.5 w-3.5 text-primary" />
                        <span>{item.student_name || "Enrolled Student"}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span>{item.student_email || "Email on file"}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                        item.tier === "dream"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : item.tier === "target"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      }`}
                    >
                      {item.tier} Choice
                    </span>
                  </div>

                  {/* University & Course */}
                  <div>
                    <h4 className="font-bold text-foreground text-base">
                      {item.university_name}
                    </h4>
                    <p className="text-xs text-muted-foreground font-medium">
                      {item.course_name} • <span className="text-primary font-semibold">{item.country}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Target Intake: <span className="font-semibold text-foreground">{item.intake}</span>
                    </p>
                  </div>

                  {/* Student's Query / Notes */}
                  {item.student_notes && (
                    <div className="bg-muted/40 rounded-xl p-3 text-xs border border-border">
                      <span className="font-semibold text-foreground block mb-1">Student's Query:</span>
                      <p className="text-muted-foreground italic">&ldquo;{item.student_notes}&rdquo;</p>
                    </div>
                  )}

                  {/* Counsellor Opinion Verdict */}
                  {isReviewed && (
                    <div className="bg-emerald-50/50 rounded-xl p-3 text-xs border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Advisory Verdict: {item.counsellor_verdict}</span>
                      </div>
                      <p className="text-emerald-800 leading-relaxed">{item.counsellor_opinion}</p>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    {isReviewed ? "Delivered to candidate" : "Awaiting your evaluation"}
                  </span>
                  <button
                    onClick={() => handleOpenReview(item)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isReviewed ? "Update Opinion" : "Submit Expert Opinion"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Opinion Modal */}
      {reviewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Advisory Verdict & Opinion on Nominated Choice
                </h3>
                <p className="text-xs text-muted-foreground">
                  For {reviewModalItem.student_name}: {reviewModalItem.university_name}
                </p>
              </div>
              <button
                onClick={() => setReviewModalItem(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Admissions Calibrated Verdict *
                </label>
                <select
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Strong Competitive Match">Strong Competitive Match (High Probability)</option>
                  <option value="Target / High Fit">Target / Direct Fit (Balanced Strategy)</option>
                  <option value="Ambitious Reach">Ambitious Reach (Requires Strong SOP/GRE)</option>
                  <option value="High Risk / Safety Net Required">High Risk / Safety Net Required</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Expert Counsellor Opinion & Strategic Guidance *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide concrete advice on entrance exams, minimum CGPA cutoff, Vorprufung curricular matching, or alternative suggestions..."
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalItem(null)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submittingReview && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submittingReview ? "Sending..." : "Deliver Opinion"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Recommendation Modal */}
      {showRecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Recommend University to Candidate
                </h3>
                <p className="text-xs text-muted-foreground">
                  Suggest strategic universities tailored to the student&apos;s academic background.
                </p>
              </div>
              <button
                onClick={() => setShowRecModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecommendation} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Select Student *
                </label>
                <select
                  value={recStudentId}
                  onChange={(e) => setRecStudentId(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                >
                  {students.map((s) => {
                    const name = s.student_name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.email || "Candidate";
                    return (
                      <option key={s.id} value={s.id}>
                        {name} ({s.email})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    University Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Imperial College London"
                    value={recUniName}
                    onChange={(e) => setRecUniName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Country *
                  </label>
                  <select
                    value={recCountry}
                    onChange={(e) => setRecCountry(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Programme / Course *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MSc Advanced Computing"
                    value={recCourse}
                    onChange={(e) => setRecCourse(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Intake
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Fall 2027"
                    value={recIntake}
                    onChange={(e) => setRecIntake(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Tier Category
                  </label>
                  <select
                    value={recTier}
                    onChange={(e) => setRecTier(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="dream">Dream (Ambitious)</option>
                    <option value="target">Target (High Fit)</option>
                    <option value="safe">Safe (High Acceptance)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Estimated Acceptance Chance
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High (80-90%)"
                    value={recChance}
                    onChange={(e) => setRecChance(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Why this institution matches the candidate?
                </label>
                <textarea
                  rows={2}
                  placeholder="Explains curriculum alignment, placement track record, or post-study work visa benefits..."
                  value={recReason}
                  onChange={(e) => setRecReason(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRec}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  {submittingRec && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submittingRec ? "Submitting..." : "Send Recommendation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
