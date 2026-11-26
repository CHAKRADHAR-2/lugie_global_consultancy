"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import {
  GraduationCap,
  FileText,
  FileCheck2,
  FileBadge,
  Landmark,
  Award,
  Home,
  Plane,
  CheckCircle,
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
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-24 px-6 lg:px-8 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-[hsl(166,72%,40%)] opacity-[0.07] blur-[120px]" />
            <div className="mesh-orb-delayed absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[hsl(45,93%,58%)] opacity-[0.05] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <FadeIn delay={0.1} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 text-xs font-semibold tracking-widest uppercase text-[hsl(166,72%,50%)] mb-6 backdrop-blur-sm border border-white/[0.08]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Comprehensive Guidance</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Overseas Education Services
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                From your very first eligibility check to your first week on campus, Lugie provides
                transparent, methodical support at every milestone.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Services List */}
        <section className="bg-white py-24 px-6 lg:px-8 border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-7xl">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {SERVICES.map((service, index) => {
                const Icon = service.icon;
                return (
                  <StaggerItem key={index} className="flex">
                    <div className="group w-full flex flex-col justify-between rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-[hsl(166,72%,40%)]/5 hover:border-[hsl(166,72%,40%)]/30">
                      <div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] mb-6 transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl font-bold text-[hsl(222,47%,11%)] mb-3">
                          {service.title}
                        </h2>
                        <p className="text-sm text-[hsl(220,13%,46%)] leading-relaxed mb-6">
                          {service.description}
                        </p>

                        <div className="space-y-2.5 border-t border-[hsl(220,13%,91%)] pt-5 mb-6">
                          {service.details.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-[hsl(222,47%,20%)]">
                              <CheckCircle className="h-4 w-4 shrink-0 text-[hsl(160,84%,39%)] mt-0.5" />
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {service.link && (
                        <div className="pt-2">
                          <Link
                            href={service.link}
                            className="text-xs font-semibold text-[hsl(166,72%,40%)] hover:text-[hsl(166,72%,50%)] inline-flex items-center gap-1 transition-colors"
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
        <section className="bg-[hsl(220,14%,96%)] py-20 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                Flexible Advisory
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)] sm:text-4xl">
                Bundled Packages or Standalone Services
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-4 text-[hsl(220,13%,46%)] leading-relaxed">
                Need complete end-to-end support or just assistance with your SOP and visa? We offer
                structured packages as well as individual standalone services at flat, transparent fees.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-[hsl(166,72%,40%)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,50%)] hover:shadow-xl active:scale-[0.98]"
                >
                  View Transparent Pricing (From ₹7,999) <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/book-consultation"
                  className="rounded-xl border border-[hsl(220,13%,91%)] bg-white px-6 py-3.5 text-sm font-semibold text-[hsl(222,47%,11%)] transition-all hover:bg-[hsl(210,20%,98%)]"
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
