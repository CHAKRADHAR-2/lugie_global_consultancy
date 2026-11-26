"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { buttonVariants } from "@/components/ui/button";
import {
  GraduationCap,
  FileText,
  FileCheck2,
  FileBadge,
  Landmark,
  Award,
  Home,
  Plane,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const SERVICES = [
  {
    icon: GraduationCap,
    title: "1. Profile Assessment & University Shortlisting",
    description:
      "A comprehensive review of your GPA, test scores, research publications, and career ambitions. We match you with categorized Dream, Target, and Safe universities to maximize your acceptance rate.",
    details: [
      "Evaluation of transcript & backlog history",
      "Career mapping and course compatibility",
      "Analysis of return on investment (ROI) & post-study work rights",
    ],
  },
  {
    icon: FileText,
    title: "2. SOP, Personal Statement & LOR Strategy",
    description:
      "Stand out in competitive application pools with authentic, narrative-driven Statements of Purpose. We help brainstorm, structure, and refine your essays without AI boilerplate or generic templates.",
    details: [
      "1-on-1 brainstorming on your academic journey and motivation",
      "Line-by-line editorial feedback and tone refinement",
      "Guidance for professors and managers on writing impactful LORs",
    ],
  },
  {
    icon: FileCheck2,
    title: "3. Application Filing & Document Review",
    description:
      "Flawless application submission across international university portals (UCAS, Common App, Uni-Assist, university direct portals). We ensure all requirements and deadlines are met.",
    details: [
      "Transcript verification and credential evaluation assistance (WES)",
      "Strict deadline tracking for early bird and standard rounds",
      "Real-time status updates as admissions committees evaluate your file",
    ],
  },
  {
    icon: FileBadge,
    title: "4. Visa Guidance & Mock Interviews",
    description:
      "Complete preparation for student visas (US F-1, UK Student Visa, Canada Study Permit, Germany National Visa, Australia Subclass 500). Meticulous financial documentation and mock interviews.",
    details: [
      "Checklist of financial proofs, sponsor affidavits, and source of funds",
      "1-on-1 mock visa interviews with seasoned visa advisors",
      "Appointment booking and biometric coordination support",
    ],
    link: "/visa-assistance",
    linkText: "Learn about Visa Assistance →",
  },
  {
    icon: Landmark,
    title: "5. Education Loan Guidance",
    description:
      "Navigating collateral and non-collateral education loans with nationalized banks, private lenders, and NBFCs. We help compare interest rates, moratorium terms, and sanction timelines.",
    details: [
      "Public vs. private bank loan comparisons",
      "Pre-visa loan sanction letter assistance",
      "Clear explanation of disbursement terms and margin money",
    ],
    link: "/loans",
    linkText: "Learn about Loan Assistance →",
  },
  {
    icon: Award,
    title: "6. Scholarship Research & Application",
    description:
      "Targeted discovery of merit-based and departmental scholarships, state waivers, and international awards (Chevening, Commonwealth, DAAD, Fulbright, university-specific bursaries).",
    details: [
      "Curated list of scholarships matched to your target universities",
      "Review and editing of scholarship motivation essays",
      "Early deadline alerts and submission guidelines",
    ],
    link: "/scholarships",
    linkText: "Explore Scholarships →",
  },
  {
    icon: Home,
    title: "7. Student Accommodation Assistance",
    description:
      "Finding verified, safe, and student-friendly accommodation before you board the plane. University halls of residence, purpose-built student accommodations (PBSA), and private shared apartments.",
    details: [
      "On-campus vs. off-campus cost and lease comparison",
      "Assistance with tenancy deposit guidelines and guarantor requirements",
      "Neighborhood safety and transit connectivity assessment",
    ],
    link: "/accommodation",
    linkText: "Learn about Accommodation Support →",
  },
  {
    icon: Plane,
    title: "8. Forex, Insurance & Pre-Departure Briefing",
    description:
      "Everything you need for a smooth transition: tuition fee wire transfers, international student debit cards, health insurance (NHS surcharge, OSHC, US university health plans), and luggage checklists.",
    details: [
      "Competitive exchange rate options for tuition payments",
      "Mandatory student health insurance compliance checks",
      "Interactive pre-departure session with alumni and current students",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Comprehensive Guidance</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Overseas Education Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                From your very first eligibility check to your first week on campus, Lugie provides
                transparent, methodical support at every milestone.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        {/* Services List */}
        <section className="bg-white py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-7xl">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {SERVICES.map((service, index) => {
                const Icon = service.icon;
                return (
                  <StaggerItem key={index} className="flex">
                    <div className="group w-full flex flex-col justify-between rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/55 p-8 transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:border-[#B7CBC2] hover:shadow-md">
                      <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] mb-6 transition-colors group-hover:bg-[#394B49] group-hover:text-white group-hover:border-[#394B49]">
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <h2 className="text-xl font-semibold text-[#394B49] mb-3">
                          {service.title}
                        </h2>
                        <p className="text-sm text-[#546866] leading-relaxed mb-6">
                          {service.description}
                        </p>

                        <div className="space-y-2.5 border-t border-[#DCE5E8] pt-5 mb-6">
                          {service.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-[#394B49]">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#2F6B55] mt-0.5" aria-hidden="true" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {service.link && (
                        <div className="pt-2">
                          <Link
                            href={service.link}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#8E572C] hover:text-[#394B49] transition-colors"
                          >
                            {service.linkText}
                          </Link>
                        </div>
                      )}
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* Package CTA */}
        <section className="bg-[#394B49] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <span className="inline-block rounded-full border border-[#B7CBC2]/30 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5BE99] mb-4">
                Flexible Advisory
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                Bundled Packages or Standalone Services
              </h2>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-4 text-[#F3F0E8]/80 leading-relaxed">
                Need complete end-to-end support or just assistance with your SOP and visa? We offer
                structured packages as well as individual standalone services at flat, transparent fees.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/pricing"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  <span>View Transparent Pricing (From ₹7,999)</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Book Free Consultation
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
