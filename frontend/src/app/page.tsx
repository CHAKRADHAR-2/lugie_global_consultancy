import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import {
  GraduationCap,
  FileCheck2,
  Award,
  Globe2,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Building2,
  HelpCircle,
  Users2,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[hsl(215,50%,12%)] px-6 py-24 sm:py-32 lg:px-8 text-white">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-[hsl(174,85%,42%)] mb-6 backdrop-blur-sm border border-white/10">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Honest, Founder-Led Overseas Education Guidance</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-tight">
              Study Abroad With <br className="hidden sm:inline" />
              <span className="text-[hsl(174,85%,42%)]">Clarity, Not Hype</span>
            </h1>

            <p className="mt-4 text-xl sm:text-2xl font-light italic text-white/80">
              {APP_TAGLINE}
            </p>

            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70">
              Direct founder counseling, realistic university shortlisting, and zero false promises.
              From your first transcript review to your campus arrival in the UK, US, Canada, Australia, Germany, or Ireland.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/book-consultation"
                className="rounded-xl bg-[hsl(174,85%,32%)] px-8 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-[hsl(174,85%,38%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(174,85%,32%)]"
              >
                Get Your Free Profile Assessment
              </Link>
              <Link
                href="/pricing"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                View Transparent Pricing (From ₹7,999)
              </Link>
            </div>

            {/* Differentiators Bar */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 pt-10 text-left text-xs">
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="h-4 w-4 text-[hsl(174,85%,42%)] shrink-0" />
                <span>Zero Falsified Claims</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="h-4 w-4 text-[hsl(174,85%,42%)] shrink-0" />
                <span>Published Fixed Pricing</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="h-4 w-4 text-[hsl(174,85%,42%)] shrink-0" />
                <span>Official University Data Only</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <CheckCircle className="h-4 w-4 text-[hsl(174,85%,42%)] shrink-0" />
                <span>Direct Founder Attention</span>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-white px-6 py-20 lg:px-8 border-b border-gray-100">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                Methodical & Transparent
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[hsl(215,50%,12%)] sm:text-4xl">
                Your 4-Step Journey to Global Classrooms
              </h2>
              <p className="mt-3 text-base text-gray-600">
                A structured, stress-free methodology designed by founders who have guided hundreds of students.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Profile Assessment",
                  desc: "We analyze your transcripts, GPA, backlogs, test scores, and career ambitions to pinpoint viable options.",
                },
                {
                  step: "02",
                  title: "Strategic Shortlisting",
                  desc: "We categorize your university targets into Dream, Target, and Safe bands based on actual acceptance data.",
                },
                {
                  step: "03",
                  title: "Narrative & Filing",
                  desc: "Authentic, compelling SOP writing and LOR guidance. Accurate portal submissions before deadlines.",
                },
                {
                  step: "04",
                  title: "Visa, Funds & Transition",
                  desc: "Meticulous financial dossier checks, realistic mock visa interviews, accommodation, and forex setup.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col justify-between hover:shadow-md transition hover:border-gray-200"
                >
                  <div>
                    <span className="inline-block text-3xl font-black text-[hsl(174,85%,32%)] mb-4">
                      {item.step}
                    </span>
                    <h3 className="text-lg font-bold text-[hsl(215,50%,12%)] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Study Destinations Preview */}
        <section className="bg-gray-50/60 px-6 py-20 lg:px-8 border-b border-gray-100">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                  Destinations
                </span>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[hsl(215,50%,12%)]">
                  Where Will Your Ambition Take You?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Comprehensive guidance across the most respected education hubs worldwide.
                </p>
              </div>
              <Link
                href="/destinations"
                className="mt-4 md:mt-0 text-sm font-semibold text-[hsl(174,85%,32%)] hover:underline inline-flex items-center gap-1"
              >
                Compare all study destinations <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "United Kingdom",
                  highlight: "1-Year Master's · 2-Year Post-Study Visa",
                  desc: "Home to Russell Group institutions with accelerated degree structures and generous post-study work routes.",
                },
                {
                  name: "United States",
                  highlight: "World-Class Tech Hubs · 3-Year STEM OPT",
                  desc: "Unmatched research funding, top-tier global rankings, and extensive OPT employment authorization.",
                },
                {
                  name: "Germany",
                  highlight: "Tuition-Free Public Unis · 18-Mo Job Visa",
                  desc: "Low-cost, high-value technical and engineering master's programs with exceptional industrial tie-ups.",
                },
                {
                  name: "Canada",
                  highlight: "Co-op Programs · Up to 3-Year PGWP",
                  desc: "Welcoming multicultural environment, practical industry co-ops, and strong quality of life.",
                },
                {
                  name: "Australia",
                  highlight: "Group of Eight (Go8) · High Student Wages",
                  desc: "World-renowned research facilities, robust student protection regulations, and coastal quality of living.",
                },
                {
                  name: "Ireland",
                  highlight: "European Tech Capital · 2-Year Stay-Back",
                  desc: "English-speaking European hub hosting headquarters for Google, Meta, Pfizer, and global finance firms.",
                },
              ].map((dest, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition hover:border-gray-200 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-[hsl(215,50%,12%)]">{dest.name}</h3>
                    <span className="inline-block rounded-full bg-[hsl(174,85%,32%)]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[hsl(174,85%,32%)] my-3">
                      {dest.highlight}
                    </span>
                    <p className="text-xs text-gray-600 leading-relaxed mb-6">{dest.desc}</p>
                  </div>
                  <Link
                    href={`/destinations`}
                    className="text-xs font-semibold text-[hsl(215,50%,12%)] hover:text-[hsl(174,85%,32%)] inline-flex items-center gap-1 transition"
                  >
                    View requirements & intakes <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Transparent Packages Overview */}
        <section className="bg-white px-6 py-20 lg:px-8 border-b border-gray-100">
          <div className="mx-auto max-w-6xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                Upfront Pricing
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[hsl(215,50%,12%)] sm:text-4xl">
                Fixed & Published Package Rates
              </h2>
              <p className="mt-3 text-base text-gray-600">
                We believe in total fee transparency. No surprises, no hidden university markups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Basic */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(215,50%,12%)]">Basic Package</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[hsl(215,50%,12%)]">₹7,999</span>
                    <span className="text-xs text-gray-500">/ package</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-6">
                    Essential evaluation and shortlisting for self-driven students.
                  </p>
                  <ul className="space-y-3 text-xs text-gray-700 border-t border-gray-100 pt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Profile & Transcript Evaluation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Up to 3 University Shortlists</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>1 Master SOP Review & Feedback</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Application Portal Guidance</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Link
                    href="/book-consultation?pkg=Basic"
                    className="w-full block text-center rounded-lg bg-[hsl(215,50%,12%)] py-3 text-xs font-semibold text-white hover:bg-[hsl(215,50%,18%)] transition"
                  >
                    Select Basic (₹7,999)
                  </Link>
                </div>
              </div>

              {/* Standard */}
              <div className="relative rounded-2xl border-2 border-[hsl(174,85%,32%)] bg-white p-8 flex flex-col justify-between shadow-lg ring-4 ring-[hsl(174,85%,32%)]/10">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(174,85%,32%)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[hsl(215,50%,12%)]">Standard Package</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[hsl(215,50%,12%)]">₹13,999</span>
                    <span className="text-xs text-gray-500">/ package</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-6">
                    Full admissions, custom SOPs, LORs, and complete visa preparation.
                  </p>
                  <ul className="space-y-3 text-xs text-gray-700 border-t border-gray-100 pt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Up to 6 Universities (Dream/Target/Safe)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Up to 3 Custom SOPs + 2 LORs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Full Student Visa Filing & Checklist</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>1-on-1 Mock Visa Interview</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Education Loan Paperwork Support</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Link
                    href="/book-consultation?pkg=Standard"
                    className="w-full block text-center rounded-lg bg-[hsl(174,85%,32%)] py-3 text-xs font-semibold text-white shadow hover:bg-[hsl(174,85%,38%)] transition"
                  >
                    Select Standard (₹13,999)
                  </Link>
                </div>
              </div>

              {/* Premium */}
              <div className="rounded-2xl border border-gray-200 bg-white p-8 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-[hsl(215,50%,12%)]">Premium Package</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-[hsl(215,50%,12%)]">₹24,999</span>
                    <span className="text-xs text-gray-500">/ package</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 mb-6">
                    Founder-led strategic counseling with unlimited submissions & 3 mock sessions.
                  </p>
                  <ul className="space-y-3 text-xs text-gray-700 border-t border-gray-100 pt-6">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Founder-Led Advisory (Up to 10 Unis)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>All Custom SOPs, Essays & 3 LORs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>3 Extensive 1-on-1 Mock Visa Sessions</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Priority Scholarship Discovery & Essays</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Accommodation Support & Direct WhatsApp Access</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <Link
                    href="/book-consultation?pkg=Premium"
                    className="w-full block text-center rounded-lg bg-[hsl(215,50%,12%)] py-3 text-xs font-semibold text-white hover:bg-[hsl(215,50%,18%)] transition"
                  >
                    Select Premium (₹24,999)
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/pricing"
                className="text-xs font-semibold text-gray-600 hover:text-[hsl(174,85%,32%)] underline"
              >
                See detailed package comparison and 14 standalone add-on services →
              </Link>
            </div>
          </div>
        </section>

        {/* Transparent FAQ Section */}
        <section className="bg-gray-50/70 px-6 py-20 lg:px-8 border-b border-gray-100">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                Got Questions?
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-[hsl(215,50%,12%)]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: "Do you guarantee university admission or visas?",
                  a: "No. Any agency claiming 100% guaranteed admissions or visas is being dishonest. Admissions committees and sovereign immigration authorities make all final determinations. Lugie prepares the strongest possible, compliant, and authentic file, but does not offer fake guarantees.",
                },
                {
                  q: "Are university application fees and visa fees included in the package?",
                  a: "No. Our packages cover Lugie's professional advisory, editorial, shortlisting, and preparation services. Third-party fees (university application fees, embassy visa fees, test registrations, SEVIS/NHS fees) are paid directly to the authorized institutions.",
                },
                {
                  q: "Can I upgrade my package later?",
                  a: "Yes! If you start with the Basic Package (₹7,999) and later decide you need full visa filing support or mock interviews, you can simply pay the price difference to upgrade to Standard or Premium.",
                },
                {
                  q: "How does the profile assessment work?",
                  a: "When you book a free consultation or submit an enquiry, our founders review your academic transcripts, English scores, and career goals. We then provide an honest evaluation of which countries and programs match your profile before you commit to any paid service.",
                },
                {
                  q: "What if I have backlogs or academic gaps?",
                  a: "Many top international universities accept students with backlogs or gaps if accompanied by honest explanations, work experience proofs, and strong Statements of Purpose. We help structure your application with full transparency.",
                },
              ].map((faq, index) => (
                <div key={index} className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm">
                  <h3 className="text-base font-bold text-[hsl(215,50%,12%)] mb-2">{faq.q}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready for an Honest Conversation About Your Future?
            </h2>
            <p className="mt-4 text-lg text-white/70 max-w-xl mx-auto">
              Book a no-obligation session with our advisors. We will review your profile and give you straight answers.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/book-consultation"
                className="rounded-xl bg-[hsl(174,85%,32%)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-[hsl(174,85%,38%)] transition"
              >
                Schedule Free Profile Assessment
              </Link>
              <Link
                href="/contact"
                className="rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Contact Us Directly
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
