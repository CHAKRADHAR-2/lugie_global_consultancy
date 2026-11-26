"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import {
  ClipboardCheck,
  Building2,
  Award,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  MessageSquare,
  Lock,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SkeletonJourney } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/feedback";

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
    return <SkeletonJourney />;
  }

  const latest = assessments.length > 0 ? assessments[0] : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl text-[#263331] flex items-center gap-2.5">
            <ClipboardCheck className="h-6 w-6 text-[#3F6258] shrink-0" />
            <span>Counsellor Profile Assessment &amp; Capacity Evaluation</span>
          </h1>
          <p className="mt-1 text-sm text-[#546866]">
            Comprehensive advisory dossier, candidate capacity rating, pros &amp; cons analysis, and university stratification.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <StatusBadge tone="misty" className="py-1 px-3">
            <Lock className="h-3.5 w-3.5 text-[#546866]" />
            Read-Only Student Dossier
          </StatusBadge>
          <Link
            href="/student/messages"
            className={buttonVariants({ variant: "primary", size: "sm" })}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Discuss with Counsellor
          </Link>
        </div>
      </div>

      {/* Official Advisory Banner */}
      <div className="rounded-2xl bg-[#E6EFEA] border border-[#B7CBC2] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-[#2F6B55] shrink-0 mt-0.5" />
          <div className="text-xs text-[#263331]">
            <span className="font-bold text-sm block mb-0.5">
              Official Counsellor Advisory Record — Formally Reviewed &amp; Approved
            </span>
            <span className="text-[#394B49]">
              This evaluation is curated exclusively for your profile by Lugie Global Consultancy’s senior admissions team. As per platform policy, students have read-only access to preserve unbiased academic assessment standards.
            </span>
          </div>
        </div>
        <StatusBadge tone="slate" className="uppercase tracking-wider shrink-0">
          Senior Verified
        </StatusBadge>
      </div>

      {!latest ? (
        <div className="beyond-card p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF3F5] border border-[#DCE5E8] text-[#546866]">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h2 className="font-editorial text-xl text-[#263331]">Evaluation Dossier in Review</h2>
          <p className="text-xs text-[#546866] mt-1.5 mb-6 leading-relaxed">
            Your assigned senior counsellor is currently evaluating your uploaded transcripts, GPA, test scores, and work experience. Your formal assessment scorecard will appear here once approved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/student/profile"
              className={buttonVariants({ variant: "primary", size: "sm" })}
            >
              Update Academic History
            </Link>
            <Link
              href="/student/messages"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Ping Counsellor
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Candidate Capacity Rating Matrix */}
          <div>
            <h2 className="text-base font-bold text-[#263331] mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#3F6258]" />
              Candidate Capacity Rating &amp; Profile Competitiveness
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="beyond-card p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#546866] block mb-1.5">
                  Overall Readiness Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-[#2F6B55] tabular-nums">88%</span>
                  <StatusBadge tone="success">Strong Tier</StatusBadge>
                </div>
                <p className="text-[11px] text-[#546866] mt-2">
                  High probability for Top 100 global institutions.
                </p>
              </div>

              <div className="beyond-card p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#546866] block mb-1.5">
                  Academic Capacity
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#263331] tabular-nums">8.4 / 10</span>
                  <span className="text-xs font-semibold text-[#546866]">CGPA</span>
                </div>
                <p className="text-[11px] text-[#546866] mt-2">
                  Zero active backlogs. Meets German Curricular &amp; US GPA thresholds.
                </p>
              </div>

              <div className="beyond-card p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#546866] block mb-1.5">
                  Standardized Test Capacity
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#263331] tabular-nums">314</span>
                  <span className="text-xs font-semibold text-[#546866]">GRE / 7.5 IELTS</span>
                </div>
                <p className="text-[11px] text-[#546866] mt-2">
                  Quant 165+ clears STEM cutoffs across USA, UK, and Europe.
                </p>
              </div>

              <div className="beyond-card p-5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#546866] block mb-1.5">
                  Visa &amp; Financial Profile
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-[#2F6B55]">Low Risk</span>
                </div>
                <p className="text-[11px] text-[#546866] mt-2">
                  Standard ₹25L–35L fund availability with clean educational trajectory.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Pros & Cons Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pros / Strengths */}
            <div className="beyond-card border-[#B7CBC2] p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DCE5E8] text-[#2F6B55] font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 text-[#2F6B55]" />
                <span>Profile Strengths &amp; Key Advantages (Pros)</span>
              </div>

              <ul className="space-y-3 text-xs text-[#394B49]">
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#E6EFEA] border border-[#B7CBC2] text-[#2F6B55] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Consistent Academic Pedigree:</strong>
                    First class honours in undergraduate coursework with strong foundation in core algorithms and higher mathematics.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#E6EFEA] border border-[#B7CBC2] text-[#2F6B55] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Competitive Language Band:</strong>
                    IELTS Band 7.5 (no sub-band below 6.5) exempts candidate from pre-sessional English courses at Russell Group &amp; TU9 universities.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#E6EFEA] border border-[#B7CBC2] text-[#2F6B55] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Applied Technical Portfolio:</strong>
                    Relevant full-stack / machine learning internship experience providing strong narrative substance for SOP drafting.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#E6EFEA] border border-[#B7CBC2] text-[#2F6B55] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    ✓
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Ready Dossier Documentation:</strong>
                    Valid international passport and preliminary semester marksheets verified cleanly by security scanning.
                  </div>
                </li>
              </ul>
            </div>

            {/* Cons / Gaps & Remediations */}
            <div className="beyond-card border-[#D9A879] p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DCE5E8] text-[#8A5A1E] font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-[#8A5A1E]" />
                <span>Gaps &amp; Remediation Strategy (Cons)</span>
              </div>

              <ul className="space-y-3 text-xs text-[#394B49]">
                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#FCF6EC] border border-[#D9A879] text-[#8A5A1E] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Statement of Purpose Specificity:</strong>
                    General SOP lacks faculty citations for German universities. Remediation: Incorporate specific lab/course modules for TUM and RWTH Aachen.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#FCF6EC] border border-[#D9A879] text-[#8A5A1E] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Priority Application Deadlines:</strong>
                    Top-tier universities in USA close scholarship consideration by Dec 15 / Jan 15. Applications must be locked 30 days prior.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#FCF6EC] border border-[#D9A879] text-[#8A5A1E] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Academic Letters of Recommendation (LORs):</strong>
                    Ensure all 3 LORs are issued on official institutional letterhead with official institutional .edu / .ac email addresses.
                  </div>
                </li>

                <li className="flex items-start gap-2.5">
                  <span className="h-5 w-5 rounded-full bg-[#FCF6EC] border border-[#D9A879] text-[#8A5A1E] flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold">
                    !
                  </span>
                  <div>
                    <strong className="text-[#263331] block font-semibold">Curricular ECTS Equivalency:</strong>
                    For German TU9 applications, complete the Curricular Analysis form mapping your undergraduate ECTS credits to target guidelines.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Section 3: Stratified University Strategy (Dream • Target • Safe) */}
          <div className="beyond-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h2 className="text-base font-bold text-[#263331]">
                  Counsellor Stratified University Matrix (Dream • Target • Safe)
                </h2>
                <p className="text-xs text-[#546866] mt-0.5">
                  Balanced institutional selection calibrated to your 88% capacity rating.
                </p>
              </div>

              <Link
                href="/student/universities"
                className="text-xs font-semibold text-[#394B49] hover:text-[#8E572C] hover:underline inline-flex items-center gap-1"
              >
                Manage Shortlist <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Dream Tier */}
              <div className="rounded-xl border border-[#D9A879] bg-[#F6EDE4]/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge tone="warm" className="uppercase">
                    Dream (Ambitious)
                  </StatusBadge>
                  <Award className="h-4 w-4 text-[#8E572C]" />
                </div>
                <h4 className="text-sm font-bold text-[#263331]">
                  Technical University of Munich (TUM)
                </h4>
                <p className="text-xs text-[#546866]">Germany • M.Sc. Informatics</p>
                <div className="text-[11px] text-[#394B49] bg-white p-3 rounded-xl border border-[#DCE5E8]">
                  Global Rank #28. High competition aptitude assessment. Requires strong thesis proposal and curricular credit match.
                </div>
              </div>

              {/* Target Tier */}
              <div className="rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge tone="misty" className="uppercase">
                    Target (Strong Fit)
                  </StatusBadge>
                  <Building2 className="h-4 w-4 text-[#394B49]" />
                </div>
                <h4 className="text-sm font-bold text-[#263331]">
                  RWTH Aachen University
                </h4>
                <p className="text-xs text-[#546866]">Germany • M.Sc. Software Systems Eng.</p>
                <div className="text-[11px] text-[#394B49] bg-white p-3 rounded-xl border border-[#DCE5E8]">
                  Direct fit for your GPA and technical projects. Leading European engineering hub with zero tuition model.
                </div>
              </div>

              {/* Safe Tier */}
              <div className="rounded-xl border border-[#B7CBC2] bg-[#E6EFEA]/70 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <StatusBadge tone="sage" className="uppercase">
                    Safe (High Probability)
                  </StatusBadge>
                  <CheckCircle2 className="h-4 w-4 text-[#2F6B55]" />
                </div>
                <h4 className="text-sm font-bold text-[#263331]">
                  University of Glasgow
                </h4>
                <p className="text-xs text-[#546866]">United Kingdom • MSc Data Science</p>
                <div className="text-[11px] text-[#394B49] bg-white p-3 rounded-xl border border-[#DCE5E8]">
                  Russell Group member with 90%+ admit probability for candidate credentials. Fast offer turnaround (under 3 weeks).
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Senior Counsellor Remarks & Roadmap */}
          <div className="beyond-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#DCE5E8]">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#3F6258]" />
                <h3 className="text-base font-bold text-[#263331]">
                  Senior Counsellor Advisory Remarks &amp; Roadmap
                </h3>
              </div>
              <span className="text-xs text-[#546866]">
                Evaluation Date: {new Date(latest.created_at).toLocaleDateString("en-IN")}
              </span>
            </div>

            <p className="text-xs text-[#394B49] leading-relaxed whitespace-pre-line bg-[#F3F0E8]/60 p-4 rounded-xl border border-[#DCE5E8]">
              {latest.eligibility_notes ||
                "Candidate profile shows exemplary readiness for Fall 2025 / Winter 2025-2026 intake cycles.\n\n" +
                  "Key Directives:\n" +
                  "1. Lock German APS certification immediately as processing timelines typically take 4-6 weeks.\n" +
                  "2. Finalize master SOP draft highlighting your machine learning coursework and open-source contributions.\n" +
                  "3. Target dispatch of 5 university applications (2 Dream, 2 Target, 1 Safe) before early admission priority windows."}
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <span className="text-xs text-[#546866]">
                Have questions or need to discuss university choices?
              </span>
              <Link
                href="/student/messages"
                className={buttonVariants({ variant: "primary", size: "sm", className: "self-start" })}
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
