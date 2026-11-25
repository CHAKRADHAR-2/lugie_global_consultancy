import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  GraduationCap,
  FileText,
  FileCheck2,
  FileBadge,
  Landmark,
  Award,
  Home,
  Plane,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Our Services",
  description: "End-to-end overseas education guidance from profile assessment to pre-departure.",
};

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
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Comprehensive Guidance
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Overseas Education Services
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              From your very first eligibility check to your first week on campus, Lugie provides
              transparent, methodical support at every milestone.
            </p>
          </div>
        </section>

        {/* Services List */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {SERVICES.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition hover:shadow-md hover:border-gray-200"
                  >
                    <div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] mb-6">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h2 className="text-xl font-bold text-[hsl(215,50%,12%)] mb-3">
                        {service.title}
                      </h2>
                      <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        {service.description}
                      </p>

                      <div className="space-y-2 border-t border-gray-100 pt-4 mb-6">
                        {service.details.map((detail, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                            <span>{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {service.link && (
                      <div className="pt-2">
                        <Link
                          href={service.link}
                          className="text-xs font-semibold text-[hsl(174,85%,32%)] hover:underline inline-flex items-center gap-1"
                        >
                          {service.linkText}
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Package CTA */}
        <section className="bg-gray-50 border-t border-gray-100 py-16 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-[hsl(215,50%,12%)]">
              Bundled Packages or Standalone Services
            </h2>
            <p className="mt-4 text-gray-600">
              Need complete end-to-end support or just assistance with your SOP and visa? We offer
              structured packages as well as individual standalone services at flat, transparent fees.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/pricing"
                className="rounded-lg bg-[hsl(174,85%,32%)] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition"
              >
                View Transparent Pricing (From ₹7,999)
              </Link>
              <Link
                href="/book-consultation"
                className="rounded-lg border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white transition"
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
