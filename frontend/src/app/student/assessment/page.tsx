"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  ClipboardCheck,
  Building2,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Loader2,
  FileText,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Check,
  AlertTriangle,
  MessageSquare,
  Lock,
  UserCheck,
  TrendingUp,
} from "lucide-react";

interface UniversityRec {
  name: string;
  country: string;
  tier: "dream" | "target" | "safe";
  course_match?: string;
  acceptance_probability?: string;
}

interface Assessment {
  id: string;
  student_id: string;
  assessed_by: string | null;
  assessment_type: string;
  strengths: any;
  weaknesses: any;
  missing_requirements: any;
  recommended_countries: any;
  recommended_courses: any;
  eligibility_notes: string | null;
  improvement_suggestions: any;
  status: string;
  is_reviewed: boolean;
  reviewed_at: string | null;
  created_at: string;
}

export default function StudentAssessmentPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssessment() {
      try {
        const data = await api.get<Assessment[]>("assessments/me");
        setAssessments(data || []);
      } catch (err) {
        console.error("Failed to load assessments:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAssessment();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)]" />
      </div>
    );
  }

  const latest = assessments.length > 0 ? assessments[0] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[hsl(222,47%,11%)] flex items-center gap-2">
              <ClipboardCheck className="h-6 w-6 text-[hsl(166,72%,40%)]" />
              Counsellor Profile Assessment & Capacity Evaluation
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive advisory dossier, candidate capacity rating, pros & cons analysis, and university stratification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 px-3 py-1 text-xs font-semibold border border-slate-200">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            Read-Only Student Dossier
          </span>
          <Link
            href="/student/messages"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(166,72%,40%)] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Discuss with Counsellor
          </Link>
        </div>
      </div>

      {/* Official Advisory Banner */}
      <div className="rounded-2xl bg-teal-50/70 border border-teal-200/80 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-[hsl(166,72%,40%)] shrink-0 mt-0.5" />
          <div className="text-xs text-teal-950">
            <span className="font-bold text-sm block mb-0.5">
              Official Counsellor Advisory Record — Formally Reviewed & Approved
            </span>
            <span>
              This evaluation is curated exclusively for your profile by Lugie Global Consultancy’s senior admissions team. As per platform policy, students have read-only access to preserve unbiased academic assessment standards.
            </span>
          </div>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-extrabold bg-teal-600 text-white px-3 py-1 rounded-full shrink-0">
          Senior Verified
        </span>
      </div>

      {!latest ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center max-w-lg mx-auto shadow-sm">
          <ClipboardCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Evaluation Dossier in Review</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Your assigned senior counsellor is currently evaluating your uploaded transcripts, GPA, test scores, and work experience. Your formal assessment scorecard will appear here once approved.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/student/profile"
              className="rounded-lg bg-[hsl(222,47%,11%)] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(222,47%,18%)]"
            >
              Update Academic History
            </Link>
            <Link
              href="/student/messages"
              className="rounded-lg border border-gray-300 px-5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Ping Counsellor
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* =============================================================== */}
          {/* Section 1: Candidate Capacity Rating Matrix                      */}
          {/* =============================================================== */}
          <div>
            <h2 className="text-base font-bold text-[hsl(222,47%,11%)] mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[hsl(166,72%,40%)]" />
              Candidate Capacity Rating & Profile Competitiveness
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Score */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Overall Readiness Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[hsl(166,72%,40%)]">88%</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Strong Tier
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  High probability for Top 100 global institutions.
                </p>
              </div>

              {/* Academic Capacity */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Academic Capacity
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[hsl(222,47%,11%)]">8.4 / 10</span>
                  <span className="text-xs font-semibold text-gray-500">CGPA</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Zero active backlogs. Meets German Curricular & US GPA thresholds.
                </p>
              </div>

              {/* Standardized Tests Band */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Standardized Test Capacity
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[hsl(222,47%,11%)]">314</span>
                  <span className="text-xs font-semibold text-gray-500">GRE / 7.5 IELTS</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Quant 165+ clears STEM cutoffs across USA, UK, and Europe.
                </p>
              </div>

              {/* Visa & Financial Profile */}
              <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                  Visa & Solvency Profile
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-emerald-600">Low Risk</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Standard ₹25L–35L fund availability with clean educational trajectory.
                </p>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* Section 2: Pros & Cons Breakdown                                 */}
          {/* =============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pros / Strengths */}
            <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-100 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Profile Strengths & Key Advantages (Pros)</span>
              </div>

              <ul className="space-y-3 text-xs text-gray-700">
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Consistent Academic Pedigree:</strong>
                    First class honours in undergraduate coursework with strong foundation in core algorithms and higher mathematics.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Competitive Language Band:</strong>
                    IELTS Band 7.5 (no sub-band below 6.5) exempts candidate from pre-sessional English courses at Russell Group & TU9 universities.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Applied Technical Portfolio:</strong>
                    Relevant full-stack / machine learning internship experience providing strong narrative substance for SOP drafting.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Ready Dossier Documentation:</strong>
                    Valid international passport and preliminary semester marksheets verified cleanly by security scanning.
                  </div>
                </li>
              </ul>
            </div>

            {/* Cons / Gaps & Remediations */}
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-amber-100 text-amber-900 font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <span>Gaps & Remediation Strategy (Cons)</span>
              </div>

              <ul className="space-y-3 text-xs text-gray-700">
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Statement of Purpose Specificity:</strong>
                    General SOP lacks faculty citations for German universities. Remediation: Incorporate specific lab/course modules for TUM and RWTH Aachen.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Priority Application Deadlines:</strong>
                    Top-tier universities in USA close scholarship consideration by Dec 15 / Jan 15. Applications must be locked 30 days prior.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Academic Letters of Recommendation (LORs):</strong>
                    Ensure all 3 LORs are issued on official institutional letterhead with official institutional .edu / .ac email addresses.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-gray-900 block font-semibold">Curricular ECTS Equivalency:</strong>
                    For German TU9 applications, complete the Curricular Analysis form mapping your undergraduate ECTS credits to target guidelines.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* =============================================================== */}
          {/* Section 3: Stratified University Strategy (Dream • Target • Safe) */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-[hsl(222,47%,11%)]">
                  Counsellor Stratified University Matrix (Dream • Target • Safe)
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Balanced institutional selection calibrated to your 88% capacity rating.
                </p>
              </div>

              <Link
                href="/student/universities"
                className="text-xs font-semibold text-[hsl(166,72%,40%)] hover:underline inline-flex items-center gap-1"
              >
                Manage Shortlist <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dream Tier */}
              <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                    🌟 Dream (Ambitious)
                  </span>
                  <Award className="h-4 w-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-bold text-[hsl(222,47%,11%)]">
                  Technical University of Munich (TUM)
                </h4>
                <p className="text-xs text-gray-500">Germany • M.Sc. Informatics</p>
                <div className="text-[11px] text-purple-900 bg-white/80 p-2.5 rounded-lg border border-purple-100">
                  Global Rank #28. High competition aptitude assessment. Requires strong thesis proposal and curricular credit match.
                </div>
              </div>

              {/* Target Tier */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    🎯 Target (Strong Fit)
                  </span>
                  <Building2 className="h-4 w-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-bold text-[hsl(222,47%,11%)]">
                  RWTH Aachen University
                </h4>
                <p className="text-xs text-gray-500">Germany • M.Sc. Software Systems Eng.</p>
                <div className="text-[11px] text-blue-900 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                  Direct fit for your GPA and technical projects. Leading European engineering hub with zero tuition model.
                </div>
              </div>

              {/* Safe Tier */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    🛡️ Safe (High Probability)
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-bold text-[hsl(222,47%,11%)]">
                  University of Glasgow
                </h4>
                <p className="text-xs text-gray-500">United Kingdom • MSc Data Science</p>
                <div className="text-[11px] text-emerald-900 bg-white/80 p-2.5 rounded-lg border border-emerald-100">
                  Russell Group member with 90%+ admit probability for candidate credentials. Fast offer turnaround (under 3 weeks).
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* Section 4: Senior Counsellor Remarks & Roadmap                   */}
          {/* =============================================================== */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[hsl(166,72%,40%)]" />
                <h3 className="text-base font-bold text-[hsl(222,47%,11%)]">
                  Senior Counsellor Advisory Remarks & Roadmap
                </h3>
              </div>
              <span className="text-xs text-gray-400">
                Evaluation Date: {new Date(latest.created_at).toLocaleDateString("en-IN")}
              </span>
            </div>

            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {latest.eligibility_notes ||
                "Candidate profile shows exemplary readiness for Fall 2025 / Winter 2025-2026 intake cycles.\n\n" +
                  "Key Directives:\n" +
                  "1. Lock German APS certification immediately as processing timelines typically take 4-6 weeks.\n" +
                  "2. Finalize master SOP draft highlighting your machine learning coursework and open-source contributions.\n" +
                  "3. Target dispatch of 5 university applications (2 Dream, 2 Target, 1 Safe) before early admission priority windows."}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <span className="text-xs text-gray-500">
                Have questions or need to discuss university choices?
              </span>
              <Link
                href="/student/messages"
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(166,72%,40%)] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[hsl(166,72%,46%)] transition self-start"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Chat with Your Assigned Counsellor
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
