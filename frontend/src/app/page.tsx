"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_TAGLINE } from "@/lib/constants";
import { BEYOND_EASE, BEYOND_SERVICES_LIST } from "@/lib/design-tokens";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { HorizonPath } from "@/components/ui/horizon-path";
import { buttonVariants } from "@/components/ui/button";
import {
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users2,
  Award,
  ChevronDown,
  Plane,
  FileText,
  BookOpen,
  Compass,
  Globe2,
  FileCheck2,
  PenTool,
  Landmark,
  Stamp,
  Home,
} from "lucide-react";

const SERVICE_ICONS = [
  Compass,
  Globe2,
  FileCheck2,
  PenTool,
  Award,
  Landmark,
  Stamp,
  Home,
];

const DESTINATIONS = [
  {
    name: "United Kingdom",
    highlight: "1-Year Master's · 2-Year Post-Study Visa",
    desc: "Home to Russell Group institutions with accelerated degree structures and clear post-study work pathways.",
    tint: "border-t-[#394B49]",
  },
  {
    name: "United States",
    highlight: "Global Research Hubs · 3-Year STEM OPT",
    desc: "Unmatched research ecosystems, flexible interdisciplinary degrees, and extended OPT authorization.",
    tint: "border-t-[#D9A879]",
  },
  {
    name: "Germany",
    highlight: "Tuition-Free Public Unis · 18-Mo Job Visa",
    desc: "High-value public engineering and technical master's degrees paired with strong industrial internships.",
    tint: "border-t-[#B7CBC2]",
  },
  {
    name: "Canada",
    highlight: "Co-op Programs · Up to 3-Year PGWP",
    desc: "Practical industry co-ops, welcoming academic communities, and structured graduate work permits.",
    tint: "border-t-[#8E572C]",
  },
  {
    name: "Australia",
    highlight: "Group of Eight (Go8) · Student Protections",
    desc: "Leading coastal campuses, world-recognized research facilities, and transparent post-study pathways.",
    tint: "border-t-[#394B49]",
  },
  {
    name: "Ireland",
    highlight: "European Tech Capital · 2-Year Stay-Back",
    desc: "English-speaking European hub hosting international technology, biotech, and finance headquarters.",
    tint: "border-t-[#B7CBC2]",
  },
];

const FAQS = [
  {
    q: "Do you guarantee university admission or visas?",
    a: "No. Any agency claiming 100% guaranteed admissions or visas is being dishonest. Admissions committees and sovereign immigration authorities make all final determinations. Lugie prepares the strongest possible, compliant, and authentic file, without false guarantees.",
  },
  {
    q: "Are university application fees and visa fees included in the package?",
    a: "No. Our packages cover Lugie's professional advisory, editorial, shortlisting, and preparation services. Third-party fees (university application fees, embassy visa fees, test registrations, SEVIS/NHS fees) are paid directly to the authorized institutions.",
  },
  {
    q: "Can I upgrade my package later?",
    a: "Yes. If you start with the Basic Package (₹7,999) and later decide you need full visa filing support or mock interviews, you can pay only the price difference to upgrade to Standard or Premium.",
  },
  {
    q: "How does the profile assessment work?",
    a: "When you book a free consultation or submit an enquiry, our founders review your academic transcripts, English scores, and career goals. We provide an honest evaluation of realistic countries and programs before you commit to any paid service.",
  },
  {
    q: "What if I have backlogs or academic gaps?",
    a: "Many international universities accept students with backlogs or gaps when accompanied by clear, truthful explanations, work experience proofs, and thoughtful Statements of Purpose. We help structure your file with full transparency.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* ═══════════════ 1. SIGNATURE EDITORIAL HERO ═══════════════ */}
        <section className="beyond-surface relative overflow-hidden border-b border-[#DCE5E8] px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold text-[#3F6258] mb-7">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D9A879]" aria-hidden="true" />
              <span>Honest, Founder-Led Overseas Education Guidance</span>
            </div>

            <h1 className="font-editorial text-4xl sm:text-6xl lg:text-[4.25rem] leading-[1.08] text-[#394B49]">
              Study Abroad With{" "}
              <span className="relative inline-block text-[#8E572C]">
                Clarity
                <span
                  className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-[#D9A879]/65"
                  aria-hidden="true"
                />
              </span>
              , Not Hype.
            </h1>

            <p className="mt-4 font-editorial italic text-xl sm:text-2xl text-[#8E572C]">
              {APP_TAGLINE}.
            </p>

            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-[#546866]">
              Direct founder counselling, realistic university shortlisting, and transparent published pricing.
              From your first transcript review to campus arrival across the UK, US, Canada, Australia, Germany, and Ireland.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/book-consultation"
                className={buttonVariants({ variant: "warm", size: "lg" })}
              >
                <span>Get Your Free Profile Assessment</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/pricing"
                className={buttonVariants({ variant: "secondary", size: "lg" })}
              >
                View Transparent Pricing (From ₹7,999)
              </Link>
            </div>

            {/* The Horizon Path visual bridge inside the hero */}
            <div className="mx-auto mt-12 max-w-4xl">
              <HorizonPath variant="hero" waypoints={5} delay={0.15} />
            </div>

            {/* Trust Pillars */}
            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#DCE5E8] pt-8 text-left">
              {[
                { icon: CheckCircle2, label: "Zero Falsified Claims" },
                { icon: ShieldCheck, label: "Published Fixed Pricing" },
                { icon: Award, label: "Official University Data" },
                { icon: Users2, label: "Direct Founder Attention" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 rounded-xl bg-white/80 border border-[#DCE5E8] px-3.5 py-2.5 text-[#394B49]"
                >
                  <item.icon className="h-4 w-4 text-[#8E572C] shrink-0" aria-hidden="true" />
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 2. MEASURED IMPACT STATS ═══════════════ */}
        <section className="bg-white border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
              {[
                { target: 500, suffix: "+", label: "Students Guided" },
                { target: 50, suffix: "+", label: "Partner Universities" },
                { target: 6, suffix: "", label: "Key Destinations" },
                { target: 95, suffix: "%", label: "Visa Success Rate" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-2xl bg-[#F3F0E8]/60 p-5 border border-[#DCE5E8]">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    className="font-editorial text-3xl sm:text-4xl text-[#394B49]"
                  />
                  <span className="text-xs font-medium text-[#546866]">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ 3. COMPREHENSIVE 8 SERVICES ═══════════════ */}
        <section className="bg-[#F3F0E8] px-6 py-20 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <FadeIn>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                  End-to-End Advisory
                </span>
                <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                  Eight Guided Steps Across Borders
                </h2>
                <p className="mt-3 max-w-xl text-sm text-[#546866] leading-relaxed">
                  Every service milestone along your Horizon Path — transparent, documented, and tailored to your academic ambitions.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <Link
                  href="/services"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <span>Explore Full Services</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </FadeIn>
            </div>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {BEYOND_SERVICES_LIST.map((service, idx) => {
                const IconComp = SERVICE_ICONS[idx % SERVICE_ICONS.length];
                return (
                  <StaggerItem key={service.id} className="flex">
                    <Link
                      href={service.href}
                      className="beyond-card beyond-card-interactive group flex w-full flex-col justify-between p-6"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E6EFEA] border border-[#B7CBC2] text-[#3F6258] transition-colors group-hover:bg-[#394B49] group-hover:text-white group-hover:border-[#394B49]">
                            <IconComp className="h-5 w-5" aria-hidden="true" />
                          </div>
                          <span className="font-editorial text-xl text-[#B7CBC2] group-hover:text-[#8E572C] transition-colors">
                            {service.step}
                          </span>
                        </div>
                        <h3 className="text-base font-semibold text-[#394B49] leading-snug">
                          {service.title}
                        </h3>
                        <p className="mt-2 text-xs text-[#546866] leading-relaxed">
                          {service.summary}
                        </p>
                      </div>
                      <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#8E572C] group-hover:text-[#394B49] transition-colors">
                        Learn more
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </Link>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════ 4. HOW LUGIE WORKS (STUDENT JOURNEY) ═══════════════ */}
        <section className="bg-white px-6 py-20 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                How Lugie Works
              </span>
              <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                Your 4-Stage Student Journey
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#546866]">
                A calm, structured methodology built to remove guesswork at every milestone.
              </p>
            </FadeIn>

            <div className="mt-8">
              <HorizonPath variant="divider" />
            </div>

            <StaggerContainer className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  icon: FileText,
                  title: "Profile Assessment",
                  desc: "We audit transcripts, GPA, backlogs, test scores, and budget to identify realistic pathways.",
                },
                {
                  step: "02",
                  icon: Building2,
                  title: "Strategic Shortlisting",
                  desc: "Universities categorized into Dream, Target, and Safe tiers grounded in verified admissions data.",
                },
                {
                  step: "03",
                  icon: BookOpen,
                  title: "Narrative & Filing",
                  desc: "Authentic editorial guidance for SOPs, LORs, and CVs alongside timely portal submissions.",
                },
                {
                  step: "04",
                  icon: Plane,
                  title: "Visa & Departure",
                  desc: "Financial dossier checks, mock embassy interviews, loan papers, accommodation, and arrival prep.",
                },
              ].map((item) => (
                <StaggerItem key={item.step}>
                  <div className="h-full rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/65 p-6 transition-all duration-300 hover:bg-white hover:border-[#B7CBC2] hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex rounded-xl bg-white border border-[#DCE5E8] p-2.5 text-[#394B49]">
                        <item.icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="font-editorial text-3xl text-[#D9A879]">{item.step}</span>
                    </div>
                    <h3 className="mt-5 text-lg font-semibold text-[#394B49]">{item.title}</h3>
                    <p className="mt-2 text-sm text-[#546866] leading-relaxed">{item.desc}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════ 5. DESTINATION DISCOVERY ═══════════════ */}
        <section className="bg-[#EEF3F5]/70 px-6 py-20 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <FadeIn>
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                  Destination Discovery
                </span>
                <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                  Where Will Your Ambition Take You?
                </h2>
                <p className="mt-2 text-sm text-[#546866]">
                  Objective guidance across the world&apos;s most respected higher-education corridors.
                </p>
              </FadeIn>
              <FadeIn delay={0.15}>
                <Link
                  href="/destinations"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  <span>Compare All Destinations</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </FadeIn>
            </div>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {DESTINATIONS.map((dest) => (
                <StaggerItem key={dest.name}>
                  <div
                    className={`beyond-card beyond-card-interactive group border-t-4 ${dest.tint} p-6 flex flex-col justify-between h-full`}
                  >
                    <div>
                      <h3 className="font-editorial text-2xl text-[#394B49]">{dest.name}</h3>
                      <span className="mt-3 inline-block rounded-full bg-[#E6EFEA] border border-[#B7CBC2] px-3 py-1 text-[11px] font-semibold text-[#3F6258]">
                        {dest.highlight}
                      </span>
                      <p className="mt-3 text-sm text-[#546866] leading-relaxed">{dest.desc}</p>
                    </div>
                    <Link
                      href="/destinations"
                      className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#394B49] hover:text-[#8E572C] transition-colors"
                    >
                      View requirements & intakes
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════ 6. TRANSPARENT PRICING PACKAGES ═══════════════ */}
        <section className="bg-white px-6 py-20 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                Upfront Pricing
              </span>
              <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                Fixed & Published Package Rates
              </h2>
              <p className="mt-3 text-sm sm:text-base text-[#546866]">
                Total fee transparency before you begin. Zero hidden commission markups.
              </p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-7 items-stretch">
              {/* Basic */}
              <StaggerItem>
                <div className="beyond-card beyond-card-interactive p-8 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-editorial text-2xl text-[#394B49]">Basic Package</h3>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-[#394B49]">₹7,999</span>
                      <span className="text-xs text-[#546866]">/ package</span>
                    </div>
                    <p className="text-sm text-[#546866] mt-2 mb-6">
                      Essential evaluation and shortlisting for self-driven students.
                    </p>
                    <ul className="space-y-3 text-sm text-[#394B49] border-t border-[#DCE5E8] pt-6">
                      {[
                        "Profile & Transcript Evaluation",
                        "Up to 3 University Shortlists",
                        "1 Master SOP Review & Feedback",
                        "Application Portal Guidance",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[#DCE5E8]">
                    <Link
                      href="/book-consultation?pkg=Basic"
                      className={buttonVariants({ variant: "secondary", size: "md", className: "w-full" })}
                    >
                      Select Basic (₹7,999)
                    </Link>
                  </div>
                </div>
              </StaggerItem>

              {/* Standard — Featured */}
              <StaggerItem>
                <div className="relative rounded-2xl border-2 border-[#B7CBC2] bg-[#F3F0E8]/45 p-8 flex flex-col justify-between h-full shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#D9A879] border border-[#C49263] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#263331] shadow-xs whitespace-nowrap">
                    Most Popular
                  </div>
                  <div>
                    <h3 className="font-editorial text-2xl text-[#394B49]">Standard Package</h3>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-[#394B49]">₹13,999</span>
                      <span className="text-xs text-[#546866]">/ package</span>
                    </div>
                    <p className="text-sm text-[#546866] mt-2 mb-6">
                      Full admissions, custom SOPs, LORs, and complete visa preparation.
                    </p>
                    <ul className="space-y-3 text-sm text-[#394B49] border-t border-[#DCE5E8] pt-6">
                      {[
                        "Up to 6 Universities (Dream/Target/Safe)",
                        "Up to 3 Custom SOPs + 2 LORs",
                        "Full Student Visa Filing & Checklist",
                        "1-on-1 Mock Visa Interview",
                        "Education Loan Paperwork Support",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[#DCE5E8]">
                    <Link
                      href="/book-consultation?pkg=Standard"
                      className={buttonVariants({ variant: "warm", size: "md", className: "w-full" })}
                    >
                      Select Standard (₹13,999)
                    </Link>
                  </div>
                </div>
              </StaggerItem>

              {/* Premium */}
              <StaggerItem>
                <div className="beyond-card beyond-card-interactive p-8 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="font-editorial text-2xl text-[#394B49]">Premium Package</h3>
                    <div className="mt-4 flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-[#394B49]">₹24,999</span>
                      <span className="text-xs text-[#546866]">/ package</span>
                    </div>
                    <p className="text-sm text-[#546866] mt-2 mb-6">
                      Founder-led strategic counselling with up to 10 submissions & 3 mock sessions.
                    </p>
                    <ul className="space-y-3 text-sm text-[#394B49] border-t border-[#DCE5E8] pt-6">
                      {[
                        "Founder-Led Advisory (Up to 10 Unis)",
                        "All Custom SOPs, Essays & 3 LORs",
                        "3 Extensive 1-on-1 Mock Visa Sessions",
                        "Priority Scholarship Discovery & Essays",
                        "Accommodation Support & Direct WhatsApp Access",
                      ].map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[#DCE5E8]">
                    <Link
                      href="/book-consultation?pkg=Premium"
                      className={buttonVariants({ variant: "primary", size: "md", className: "w-full" })}
                    >
                      Select Premium (₹24,999)
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <FadeIn delay={0.2}>
              <div className="mt-10 text-center">
                <Link
                  href="/pricing"
                  className="text-sm font-semibold text-[#8E572C] hover:text-[#394B49] underline underline-offset-4 transition-colors"
                >
                  See detailed package comparison and 14 standalone add-on services →
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════ 7. FREQUENTLY ASKED QUESTIONS ═══════════════ */}
        <section className="bg-[#F3F0E8] px-6 py-20 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-4xl">
            <FadeIn className="text-center mb-12">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                Got Questions?
              </span>
              <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                Frequently Asked Questions
              </h2>
            </FadeIn>

            <StaggerContainer className="space-y-3.5">
              {FAQS.map((faq, index) => (
                <StaggerItem key={index}>
                  <FAQItem question={faq.q} answer={faq.a} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════ 8. EDITORIAL FINAL CTA BAND ═══════════════ */}
        <section className="bg-[#394B49] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <FadeIn>
              <span className="inline-block rounded-full border border-[#B7CBC2]/30 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5BE99] mb-4">
                Start With Honesty
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white">
                Ready for an Honest Conversation About Your Future?
              </h2>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-5 text-base sm:text-lg text-[#F3F0E8]/80 max-w-xl mx-auto">
                Book a no-obligation session with our founders. We review your transcripts and give you clear, unvarnished answers.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  Schedule Free Profile Assessment
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Contact Us Directly
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

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  return (
    <div className="rounded-2xl border border-[#DCE5E8] bg-white overflow-hidden transition-colors hover:border-[#B7CBC2]">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left cursor-pointer"
      >
        <h3 className="text-base font-semibold text-[#394B49] pr-4">{question}</h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: prefersReduced ? 0 : 0.25, ease: BEYOND_EASE.editorial }}
          className="shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-[#546866]" aria-hidden="true" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={prefersReduced ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: prefersReduced ? 0.05 : 0.28, ease: BEYOND_EASE.editorial }}
          >
            <p className="px-6 pb-6 text-sm text-[#546866] leading-relaxed border-t border-[#DCE5E8]/60 pt-4">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
