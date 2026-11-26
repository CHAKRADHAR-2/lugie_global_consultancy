"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { toast } from "sonner";
import {
  Building2,
  Search,
  MapPin,
  ExternalLink,
  GraduationCap,
  Plus,
  Loader2,
  CheckCircle2,
  X,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  Award,
  Shield,
  ThumbsUp,
  MessageSquare,
  Trash2,
  Layers,
  Send,
} from "lucide-react";

interface University {
  id: string;
  name: string;
  country_id: string;
  city: string | null;
  type: string | null;
  website: string | null;
  ranking: number | null;
}

interface Country {
  id: string;
  name: string;
}

interface Course {
  id: string;
  university_id: string;
  programme_name: string;
  degree_level: string | null;
  teaching_language: string;
  duration_months: number | null;
  tuition_fee: number | null;
  tuition_currency: string | null;
  official_url: string | null;
}

interface Intake {
  id: string;
  course_id: string;
  intake_name: string;
  application_deadline: string | null;
  start_date: string | null;
  is_open: boolean;
}

interface StudentOptedItem {
  id: string;
  university_name: string;
  country: string;
  course_name: string;
  intake: string;
  tier: "dream" | "target" | "safe";
  student_notes: string | null;
  status: string;
  counsellor_opinion: string | null;
  counsellor_verdict: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface CounsellorRecommendationItem {
  id: string;
  university_name: string;
  country: string;
  course_name: string;
  intake: string;
  tier: "dream" | "target" | "safe";
  match_reason: string | null;
  tuition_fee_range: string | null;
  admission_chance: string | null;
  status: string;
  created_at: string;
}

export default function StudentUniversitiesPage() {
  const router = useRouter();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<"opted" | "recommended" | "catalog">("opted");

  // Opted Universities State
  const [optedList, setOptedList] = useState<StudentOptedItem[]>([]);
  const [loadingOpted, setLoadingOpted] = useState(true);
  const [isNominateOpen, setIsNominateOpen] = useState(false);
  const [nominateForm, setNominateForm] = useState({
    university_name: "",
    country: "United States",
    course_name: "",
    intake: "Fall 2027",
    tier: "target" as "dream" | "target" | "safe",
    student_notes: "",
  });
  const [submittingNomination, setSubmittingNomination] = useState(false);
  const [deletingOptedId, setDeletingOptedId] = useState<string | null>(null);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<CounsellorRecommendationItem[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [shortlistingId, setShortlistingId] = useState<string | null>(null);

  // Catalog State
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Program Application Modal State (from catalog)
  const [modalUni, setModalUni] = useState<University | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>("");
  const [applicationNotes, setApplicationNotes] = useState<string>("");
  const [submittingApp, setSubmittingApp] = useState(false);

  useEffect(() => {
    loadOpted();
    loadRecommendations();
    loadCatalog();
  }, []);

  async function loadOpted() {
    setLoadingOpted(true);
    try {
      const data = await api.get<StudentOptedItem[]>("shortlists/opted");
      setOptedList(data || []);
    } catch (err) {
      console.error("Failed to load opted universities:", err);
    } finally {
      setLoadingOpted(false);
    }
  }

  async function loadRecommendations() {
    setLoadingRecs(true);
    try {
      const data = await api.get<CounsellorRecommendationItem[]>("shortlists/recommendations");
      setRecommendations(data || []);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  }

  async function loadCatalog() {
    try {
      const [unis, cnts] = await Promise.all([
        api.get<University[]>("universities"),
        api.get<Country[]>("countries"),
      ]);
      setUniversities(unis || []);
      setCountries(cnts || []);
    } catch (err) {
      console.error("Failed to load universities catalog:", err);
    } finally {
      setLoadingCatalog(false);
    }
  }

  // Handle nominating a university
  const handleNominateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nominateForm.university_name || !nominateForm.course_name) {
      toast.error("Please fill in university and course name.");
      return;
    }

    setSubmittingNomination(true);
    try {
      const res = await api.post<StudentOptedItem>("shortlists/opted", nominateForm);
      toast.success("University nominated! Dispatched to counsellor for evaluation & opinion.");
      setIsNominateOpen(false);
      setNominateForm({
        university_name: "",
        country: "United States",
        course_name: "",
        intake: "Fall 2027",
        tier: "target",
        student_notes: "",
      });
      await loadOpted();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit university nomination.");
    } finally {
      setSubmittingNomination(false);
    }
  };

  const handleDeleteOpted = async (optedId: string, uniName: string) => {
    if (!confirm(`Are you sure you want to remove ${uniName} from your opted list?`)) return;
    setDeletingOptedId(optedId);
    try {
      await api.delete(`shortlists/opted/${optedId}`);
      toast.success("University removed from your nominations.");
      setOptedList((prev) => prev.filter((item) => item.id !== optedId));
    } catch (err: any) {
      toast.error(err.message || "Failed to remove nomination.");
    } finally {
      setDeletingOptedId(null);
    }
  };

  const handleShortlistRecommendation = async (recId: string) => {
    setShortlistingId(recId);
    try {
      await api.post(`shortlists/recommendations/${recId}/shortlist`);
      toast.success("University shortlisted! Added to your target application dossier.");
      setRecommendations((prev) =>
        prev.map((r) => (r.id === recId ? { ...r, status: "shortlisted" } : r))
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to shortlist university.");
    } finally {
      setShortlistingId(null);
    }
  };

  // Pre-fill nomination from catalog
  const handlePreFillNominate = (uni: University) => {
    const countryName = countryMap.get(uni.country_id) || "International";
    setNominateForm((prev) => ({
      ...prev,
      university_name: uni.name,
      country: countryName,
    }));
    setActiveTab("opted");
    setIsNominateOpen(true);
  };

  const countryMap = new Map(countries.map((c) => [c.id, c.name]));

  const filteredCatalog = universities.filter((u) => {
    const matchesCountry = !selectedCountry || u.country_id === selectedCountry;
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(search.toLowerCase()));
    return matchesCountry && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)] flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[hsl(166,72%,40%)]" />
            University Strategy & Selection
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Submit your chosen universities for counsellor review and explore personalized recommendations.
          </p>
        </div>

        <button
          onClick={() => setIsNominateOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition"
        >
          <Plus className="h-4 w-4" />
          Nominate University for Review
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-8 text-xs font-bold">
        <button
          onClick={() => setActiveTab("opted")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === "opted"
              ? "border-[hsl(166,72%,40%)] text-[hsl(166,72%,40%)]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <Layers className="h-4 w-4" />
          Student Opted Universities ({optedList.length})
        </button>

        <button
          onClick={() => setActiveTab("recommended")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === "recommended"
              ? "border-[hsl(166,72%,40%)] text-[hsl(166,72%,40%)]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Counsellor Recommended ({recommendations.length})
        </button>

        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 border-b-2 transition flex items-center gap-2 ${
            activeTab === "catalog"
              ? "border-[hsl(166,72%,40%)] text-[hsl(166,72%,40%)]"
              : "border-transparent text-gray-400 hover:text-gray-700"
          }`}
        >
          <Search className="h-4 w-4" />
          Explore Global Catalog ({universities.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: Student Opted Universities (Two-way Counsellor Review Workflow) */}
      {/* ===================================================================== */}
      {activeTab === "opted" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-teal-50/60 border border-teal-100 p-4 text-xs text-teal-900 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-[hsl(166,72%,40%)] shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Student Opted Workflow:</strong> In this section, you nominate the institutions and programs you want to apply to. Your assigned counsellor reviews each choice against your academic transcripts, GRE/IELTS scores, and backlogs, then sends back an official admission verdict and strategic recommendations.
            </div>
          </div>

          {loadingOpted ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[hsl(166,72%,40%)]" />
            </div>
          ) : optedList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
              <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-gray-900">No Opted Universities Yet</h3>
              <p className="text-xs text-gray-500 mt-1 mb-4">
                You haven&apos;t nominated any universities for review yet. Click below to add your dream or target choices!
              </p>
              <button
                onClick={() => setIsNominateOpen(true)}
                className="rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)]"
              >
                Nominate a University
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {optedList.map((item) => {
                const isReviewed = item.status === "reviewed" || item.status === "approved";
                const isDream = item.tier === "dream";
                const isSafe = item.tier === "safe";

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                              isDream
                                ? "bg-purple-100 text-purple-700"
                                : isSafe
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {item.tier} Tier
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1 font-semibold">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {item.country}
                          </span>
                          <span className="text-xs text-gray-400">• Intake: {item.intake}</span>
                        </div>

                        <h3 className="text-lg font-bold text-[hsl(222,47%,11%)]">
                          {item.university_name}
                        </h3>
                        <p className="text-xs font-semibold text-[hsl(166,72%,40%)] mt-0.5">
                          {item.course_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start">
                        {isReviewed ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Counsellor Reviewed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-bold border border-amber-200">
                            <Clock className="h-3.5 w-3.5" />
                            Under Counsellor Review
                          </span>
                        )}

                        <button
                          onClick={() => handleDeleteOpted(item.id, item.university_name)}
                          disabled={deletingOptedId === item.id}
                          title="Remove nomination"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          {deletingOptedId === item.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Student remarks */}
                    {item.student_notes && (
                      <div className="rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                        <span className="font-semibold text-gray-900 block mb-0.5">
                          Student Notes to Counsellor:
                        </span>
                        {item.student_notes}
                      </div>
                    )}

                    {/* Counsellor Opinion Box */}
                    {item.counsellor_opinion ? (
                      <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-[hsl(166,72%,40%)]" />
                            <span className="text-xs font-bold text-gray-900">
                              Counsellor Verdict:
                            </span>
                            <span className="text-xs font-bold text-[hsl(166,72%,40%)] bg-white px-2 py-0.5 rounded border border-teal-200">
                              {item.counsellor_verdict || "Approved for Application"}
                            </span>
                          </div>
                          {item.reviewed_at && (
                            <span className="text-[10px] text-gray-400">
                              Reviewed {new Date(item.reviewed_at).toLocaleDateString("en-IN")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-teal-950 leading-relaxed">
                          {item.counsellor_opinion}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/30 p-3 text-xs text-amber-800 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                        <span>
                          Your assigned counsellor has received this nomination and is reviewing cutoff requirements. Opinion and advice will appear here shortly.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: Counsellor Recommended Universities (Dream • Target • Safe)    */}
      {/* ===================================================================== */}
      {activeTab === "recommended" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-indigo-50/60 border border-indigo-100 p-4 text-xs text-indigo-900 flex items-start gap-3">
            <Award className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Expert Strategic Recommendations:</strong> Based on your academic history (Class X, XII, Undergrad GPA), standardized test scores (GRE/GMAT), and English proficiency (IELTS/TOEFL), your counsellor has curated this balanced portfolio across Dream, Target, and Safe tiers.
            </div>
          </div>

          {loadingRecs ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-7 w-7 animate-spin text-[hsl(166,72%,40%)]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendations.map((rec) => {
                const isDream = rec.tier === "dream";
                const isSafe = rec.tier === "safe";
                const isShortlisted = rec.status === "shortlisted";

                return (
                  <div
                    key={rec.id}
                    className={`rounded-2xl p-6 border shadow-sm flex flex-col justify-between transition ${
                      isDream
                        ? "border-purple-200 bg-purple-50/30 hover:border-purple-300"
                        : isSafe
                        ? "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300"
                        : "border-blue-200 bg-blue-50/30 hover:border-blue-300"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            isDream
                              ? "bg-purple-100 text-purple-700"
                              : isSafe
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {rec.tier} Tier
                        </span>
                        <span className="text-xs font-semibold text-gray-500">{rec.country}</span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-[hsl(222,47%,11%)]">
                          {rec.university_name}
                        </h3>
                        <p className="text-xs font-semibold text-[hsl(166,72%,40%)] mt-0.5">
                          {rec.course_name}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Intake: {rec.intake}</p>
                      </div>

                      {/* Rationale */}
                      <div className="rounded-xl bg-white p-3 border border-gray-100 text-xs text-gray-700">
                        <span className="font-semibold text-gray-900 block mb-1 flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3 text-[hsl(166,72%,40%)]" /> Why Recommended:
                        </span>
                        <p className="text-[11px] text-gray-600 leading-relaxed">
                          {rec.match_reason}
                        </p>
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Tuition Estimate:</span>
                          <span className="font-semibold text-gray-800 text-[11px]">
                            {rec.tuition_fee_range || "Contact Counsellor"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block">Admission Chance:</span>
                          <span className="font-bold text-[hsl(166,72%,40%)] text-[11px]">
                            {rec.admission_chance || "Good Fit"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      {isShortlisted ? (
                        <div className="flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-100/70 rounded-lg">
                          <CheckCircle2 className="h-4 w-4" />
                          Shortlisted in Your Dossier
                        </div>
                      ) : (
                        <button
                          onClick={() => handleShortlistRecommendation(rec.id)}
                          disabled={shortlistingId === rec.id}
                          className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition disabled:opacity-50"
                        >
                          {shortlistingId === rec.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                          Shortlist This University
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: Global Catalog & Search                                        */}
      {/* ===================================================================== */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          {/* Search & Filters */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search university or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Country:</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full md:w-56 py-2 px-3 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(166,72%,40%)]"
              >
                <option value="">All Destinations</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Directory Grid */}
          {filteredCatalog.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
              <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No universities match your filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCatalog.map((uni) => {
                const countryName = countryMap.get(uni.country_id) || "International";
                return (
                  <div
                    key={uni.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[hsl(166,72%,40%)] bg-[hsl(166,72%,40%)]/10 px-2.5 py-0.5 rounded-full">
                          {uni.type || "Public University"}
                        </span>
                        {uni.ranking && (
                          <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500" />
                            Rank #{uni.ranking}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-[hsl(222,47%,11%)] leading-snug">
                        {uni.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        {uni.city ? `${uni.city}, ` : ""}
                        {countryName}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      {uni.website && (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-gray-400 hover:text-[hsl(166,72%,40%)] flex items-center gap-1 transition"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Official Site
                        </a>
                      )}

                      <button
                        onClick={() => handlePreFillNominate(uni)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] px-3 py-1.5 text-xs font-bold hover:bg-[hsl(166,72%,40%)] hover:text-white transition"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Nominate
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: Nominate University for Counsellor Review                     */}
      {/* ===================================================================== */}
      {isNominateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsNominateOpen(false)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(166,72%,40%)]">
                Student Choice Nomination
              </span>
              <h3 className="text-xl font-bold text-[hsl(222,47%,11%)] mt-1">
                Nominate University for Counsellor Review
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter your target university details. Your counsellor will evaluate admission cutoffs and return their verdict.
              </p>
            </div>

            <form onSubmit={handleNominateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  University Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical University of Munich (TUM)"
                  value={nominateForm.university_name}
                  onChange={(e) =>
                    setNominateForm({ ...nominateForm, university_name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(166,72%,40%)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    value={nominateForm.country}
                    onChange={(e) =>
                      setNominateForm({ ...nominateForm, country: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(166,72%,40%)] bg-white"
                  >
                    <option value="Germany">Germany</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                    <option value="Ireland">Ireland</option>
                    <option value="France">France</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Target Intake *
                  </label>
                  <select
                    value={nominateForm.intake}
                    onChange={(e) =>
                      setNominateForm({ ...nominateForm, intake: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(166,72%,40%)] bg-white"
                  >
                    <option value="Spring 2027">Spring 2027</option>
                    <option value="Fall 2027">Fall 2027</option>
                    <option value="Spring 2028">Spring 2028</option>
                    <option value="Fall 2028">Fall 2028</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course / Program Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.Sc. Informatics / Data Science"
                  value={nominateForm.course_name}
                  onChange={(e) =>
                    setNominateForm({ ...nominateForm, course_name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(166,72%,40%)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Priority Stratification Tier
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "dream", label: "🌟 Dream", desc: "Ambitious target" },
                    { id: "target", label: "🎯 Target", desc: "Strong match" },
                    { id: "safe", label: "🛡️ Safe", desc: "High probability" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() =>
                        setNominateForm({
                          ...nominateForm,
                          tier: t.id as "dream" | "target" | "safe",
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition ${
                        nominateForm.tier === t.id
                          ? "border-[hsl(166,72%,40%)] bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Notes / Specific Questions for Counsellor
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. I have 8.1 CGPA and 314 GRE. Please check if fee waivers or curricular analysis are required."
                  value={nominateForm.student_notes}
                  onChange={(e) =>
                    setNominateForm({ ...nominateForm, student_notes: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:outline-none focus:border-[hsl(166,72%,40%)]"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNominateOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNomination}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition disabled:opacity-50"
                >
                  {submittingNomination ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Submit for Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
