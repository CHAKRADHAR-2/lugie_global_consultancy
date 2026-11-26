"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_TAGLINE } from "@/lib/constants";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  GraduationCap,
  FileCheck2,
  Award,
  Globe2,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users2,
  Sparkles,
  ChevronDown,
  Plane,
  FileText,
  BookOpen,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Header />

      <main className="flex-1">
        {/* ═══════════════ HERO SECTION ═══════════════ */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] px-6 py-28 sm:py-36 lg:px-8 text-white">
          {/* Animated gradient mesh */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="mesh-orb absolute top-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-[hsl(166,72%,40%)] opacity-[0.07] blur-[120px]" />
            <div className="mesh-orb-delayed absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-[hsl(45,93%,58%)] opacity-[0.05] blur-[100px]" />
            <div className="mesh-orb-slow absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(199,89%,48%)] opacity-[0.04] blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-5xl text-center">
            <FadeIn delay={0.1} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 text-xs font-semibold text-[hsl(166,72%,50%)] mb-8 backdrop-blur-sm border border-white/[0.08]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Honest, Founder-Led Overseas Education Guidance</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
                Study Abroad With{" "}
                <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-[hsl(166,72%,50%)] to-[hsl(166,72%,65%)] bg-clip-text text-transparent">
                  Clarity, Not Hype
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.35}>
              <p className="mt-4 text-xl sm:text-2xl font-light italic text-[hsl(45,93%,68%)]">
                {APP_TAGLINE}
              </p>
            </FadeIn>

            <FadeIn delay={0.5}>
              <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/60">
                Direct founder counseling, realistic university shortlisting, and zero false promises.
                From your first transcript review to your campus arrival in the UK, US, Canada, Australia, Germany, or Ireland.
              </p>
            </FadeIn>

            <FadeIn delay={0.65}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className="group relative overflow-hidden rounded-xl bg-[hsl(166,72%,40%)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:shadow-xl hover:shadow-[hsl(166,72%,40%)]/30 active:scale-[0.98]"
                >
                  <span className="relative z-10">Get Your Free Profile Assessment</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[hsl(166,72%,46%)] to-[hsl(166,72%,40%)] opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/[0.08] hover:border-white/25"
                >
                  View Transparent Pricing (From ₹7,999)
                </Link>
              </div>
            </FadeIn>

            {/* Stats Bar */}
            <FadeIn delay={0.8}>
              <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/[0.08] pt-10">
                {[
                  { icon: CheckCircle, label: "Zero Falsified Claims" },
                  { icon: ShieldCheck, label: "Published Fixed Pricing" },
                  { icon: Award, label: "Official University Data Only" },
                  { icon: Users2, label: "Direct Founder Attention" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-white/70">
                    <item.icon className="h-4 w-4 text-[hsl(166,72%,50%)] shrink-0" />
                    <span className="text-xs font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════ STATS BANNER ═══════════════ */}
        <section className="bg-white border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-center">
              {[
                { target: 500, suffix: "+", label: "Students Guided" },
                { target: 50, suffix: "+", label: "Partner Universities" },
                { target: 6, suffix: "", label: "Countries Covered" },
                { target: 95, suffix: "%", label: "Visa Success Rate" },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <AnimatedCounter
                    target={stat.target}
                    suffix={stat.suffix}
                    className="text-3xl font-black text-[hsl(222,47%,11%)] sm:text-4xl"
                  />
                  <span className="text-xs font-medium text-[hsl(220,13%,46%)]">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="bg-white px-6 py-24 lg:px-8 border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="text-center max-w-3xl mx-auto">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                Methodical & Transparent
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)] sm:text-4xl">
                Your 4-Step Journey to Global Classrooms
              </h2>
              <p className="mt-4 text-base text-[hsl(220,13%,46%)]">
                A structured, stress-free methodology designed by founders who have guided hundreds of students.
              </p>
            </FadeIn>

            <StaggerContainer className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "01",
                  icon: FileText,
                  title: "Profile Assessment",
                  desc: "We analyze your transcripts, GPA, backlogs, test scores, and career ambitions to pinpoint viable options.",
                },
                {
                  step: "02",
                  icon: Building2,
                  title: "Strategic Shortlisting",
                  desc: "We categorize your university targets into Dream, Target, and Safe bands based on actual acceptance data.",
                },
                {
                  step: "03",
                  icon: BookOpen,
                  title: "Narrative & Filing",
                  desc: "Authentic, compelling SOP writing and LOR guidance. Accurate portal submissions before deadlines.",
                },
                {
                  step: "04",
                  icon: Plane,
                  title: "Visa, Funds & Transition",
                  desc: "Meticulous financial dossier checks, realistic mock visa interviews, accommodation, and forex setup.",
                },
              ].map((item) => (
                <StaggerItem key={item.step}>
                  <div className="group relative rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-6 transition-all duration-300 hover:border-[hsl(166,72%,40%)]/30 hover:shadow-lg hover:shadow-[hsl(166,72%,40%)]/5 hover:-translate-y-1">
                    {/* Step number */}
                    <span className="text-4xl font-black text-[hsl(166,72%,40%)]/20 group-hover:text-[hsl(166,72%,40%)]/40 transition-colors">
                      {item.step}
                    </span>
                    {/* Icon */}
                    <div className="mt-3 inline-flex rounded-xl bg-[hsl(166,72%,40%)]/10 p-2.5 text-[hsl(166,72%,40%)]">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold text-[hsl(222,47%,11%)]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-[hsl(220,13%,46%)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════ STUDY DESTINATIONS ═══════════════ */}
        <section className="bg-[hsl(220,14%,96%)] px-6 py-24 lg:px-8 border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-14">
              <FadeIn>
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                    Destinations
                  </span>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)]">
                    Where Will Your Ambition Take You?
                  </h2>
                  <p className="mt-3 text-sm text-[hsl(220,13%,46%)]">
                    Comprehensive guidance across the most respected education hubs worldwide.
                  </p>
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <Link
                  href="/destinations"
                  className="mt-4 md:mt-0 text-sm font-semibold text-[hsl(166,72%,40%)] hover:text-[hsl(166,72%,46%)] inline-flex items-center gap-1.5 transition-colors"
                >
                  Compare all destinations <ArrowRight className="h-4 w-4" />
                </Link>
              </FadeIn>
            </div>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "United Kingdom",
                  highlight: "1-Year Master's · 2-Year Post-Study Visa",
                  desc: "Home to Russell Group institutions with accelerated degree structures and generous post-study work routes.",
                  accent: "from-blue-500/10 to-red-500/10",
                },
                {
                  name: "United States",
                  highlight: "World-Class Tech Hubs · 3-Year STEM OPT",
                  desc: "Unmatched research funding, top-tier global rankings, and extensive OPT employment authorization.",
                  accent: "from-blue-500/10 to-indigo-500/10",
                },
                {
                  name: "Germany",
                  highlight: "Tuition-Free Public Unis · 18-Mo Job Visa",
                  desc: "Low-cost, high-value technical and engineering master's programs with exceptional industrial tie-ups.",
                  accent: "from-yellow-500/10 to-red-500/10",
                },
                {
                  name: "Canada",
                  highlight: "Co-op Programs · Up to 3-Year PGWP",
                  desc: "Welcoming multicultural environment, practical industry co-ops, and strong quality of life.",
                  accent: "from-red-500/10 to-white/0",
                },
                {
                  name: "Australia",
                  highlight: "Group of Eight (Go8) · High Student Wages",
                  desc: "World-renowned research facilities, robust student protection regulations, and coastal quality of living.",
                  accent: "from-blue-500/10 to-yellow-500/10",
                },
                {
                  name: "Ireland",
                  highlight: "European Tech Capital · 2-Year Stay-Back",
                  desc: "English-speaking European hub hosting headquarters for Google, Meta, Pfizer, and global finance firms.",
                  accent: "from-green-500/10 to-orange-500/10",
                },
              ].map((dest, i) => (
                <StaggerItem key={i}>
                  <div className="group relative rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 hover:border-[hsl(220,13%,85%)] flex flex-col justify-between min-h-[220px]">
                    {/* Gradient accent */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${dest.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                    <div className="relative">
                      <h3 className="text-xl font-bold text-[hsl(222,47%,11%)]">
                        {dest.name}
                      </h3>
                      <span className="inline-block rounded-full bg-[hsl(166,72%,40%)]/10 px-3 py-1 text-[11px] font-semibold text-[hsl(166,72%,40%)] mt-3">
                        {dest.highlight}
                      </span>
                      <p className="mt-3 text-sm text-[hsl(220,13%,46%)] leading-relaxed">
                        {dest.desc}
                      </p>
                    </div>
                    <Link
                      href="/destinations"
                      className="relative mt-4 text-xs font-semibold text-[hsl(222,47%,11%)] hover:text-[hsl(166,72%,40%)] inline-flex items-center gap-1.5 transition-colors"
                    >
                      View requirements & intakes{" "}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════ PRICING PREVIEW ═══════════════ */}
        <section className="bg-white px-6 py-24 lg:px-8 border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-6xl">
            <FadeIn className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                Upfront Pricing
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)] sm:text-4xl">
                Fixed & Published Package Rates
              </h2>
              <p className="mt-4 text-base text-[hsl(220,13%,46%)]">
                We believe in total fee transparency. No surprises, no hidden university markups.
              </p>
            </FadeIn>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {/* Basic */}
              <StaggerItem>
                <div className="group rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1">
                  <div>
                    <h3 className="text-xl font-bold text-[hsl(222,47%,11%)]">Basic Package</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <AnimatedCounter
                        target={7999}
                        prefix="₹"
                        className="text-3xl font-extrabold text-[hsl(222,47%,11%)]"
                      />
                      <span className="text-xs text-[hsl(220,13%,46%)]">/ package</span>
                    </div>
                    <p className="text-sm text-[hsl(220,13%,46%)] mt-2 mb-6">
                      Essential evaluation and shortlisting for self-driven students.
                    </p>
                    <ul className="space-y-3 text-sm text-[hsl(222,47%,20%)] border-t border-[hsl(220,13%,91%)] pt-6">
                      {["Profile & Transcript Evaluation", "Up to 3 University Shortlists", "1 Master SOP Review & Feedback", "Application Portal Guidance"].map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <CheckCircle className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[hsl(220,13%,91%)]">
                    <Link
                      href="/book-consultation?pkg=Basic"
                      className="w-full block text-center rounded-xl bg-[hsl(222,47%,11%)] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[hsl(222,47%,18%)] active:scale-[0.98]"
                    >
                      Select Basic (₹7,999)
                    </Link>
                  </div>
                </div>
              </StaggerItem>

              {/* Standard — Featured */}
              <StaggerItem>
                <div className="group relative rounded-2xl border-2 border-[hsl(166,72%,40%)] bg-white p-8 flex flex-col justify-between shadow-lg shadow-[hsl(166,72%,40%)]/10 transition-all duration-300 hover:shadow-xl hover:shadow-[hsl(166,72%,40%)]/15 hover:-translate-y-1">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[hsl(166,72%,36%)] to-[hsl(166,72%,44%)] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                    Most Popular
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[hsl(222,47%,11%)]">Standard Package</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <AnimatedCounter
                        target={13999}
                        prefix="₹"
                        className="text-3xl font-extrabold text-[hsl(222,47%,11%)]"
                      />
                      <span className="text-xs text-[hsl(220,13%,46%)]">/ package</span>
                    </div>
                    <p className="text-sm text-[hsl(220,13%,46%)] mt-2 mb-6">
                      Full admissions, custom SOPs, LORs, and complete visa preparation.
                    </p>
                    <ul className="space-y-3 text-sm text-[hsl(222,47%,20%)] border-t border-[hsl(220,13%,91%)] pt-6">
                      {["Up to 6 Universities (Dream/Target/Safe)", "Up to 3 Custom SOPs + 2 LORs", "Full Student Visa Filing & Checklist", "1-on-1 Mock Visa Interview", "Education Loan Paperwork Support"].map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <CheckCircle className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[hsl(220,13%,91%)]">
                    <Link
                      href="/book-consultation?pkg=Standard"
                      className="w-full block text-center rounded-xl bg-[hsl(166,72%,40%)] py-3.5 text-sm font-semibold text-white shadow-md shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,46%)] active:scale-[0.98]"
                    >
                      Select Standard (₹13,999)
                    </Link>
                  </div>
                </div>
              </StaggerItem>

              {/* Premium */}
              <StaggerItem>
                <div className="group rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1">
                  <div>
                    <h3 className="text-xl font-bold text-[hsl(222,47%,11%)]">Premium Package</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <AnimatedCounter
                        target={24999}
                        prefix="₹"
                        className="text-3xl font-extrabold text-[hsl(222,47%,11%)]"
                      />
                      <span className="text-xs text-[hsl(220,13%,46%)]">/ package</span>
                    </div>
                    <p className="text-sm text-[hsl(220,13%,46%)] mt-2 mb-6">
                      Founder-led strategic counseling with unlimited submissions & 3 mock sessions.
                    </p>
                    <ul className="space-y-3 text-sm text-[hsl(222,47%,20%)] border-t border-[hsl(220,13%,91%)] pt-6">
                      {["Founder-Led Advisory (Up to 10 Unis)", "All Custom SOPs, Essays & 3 LORs", "3 Extensive 1-on-1 Mock Visa Sessions", "Priority Scholarship Discovery & Essays", "Accommodation Support & Direct WhatsApp Access"].map((f) => (
                        <li key={f} className="flex items-center gap-2.5">
                          <CheckCircle className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8 pt-6 border-t border-[hsl(220,13%,91%)]">
                    <Link
                      href="/book-consultation?pkg=Premium"
                      className="w-full block text-center rounded-xl bg-[hsl(222,47%,11%)] py-3.5 text-sm font-semibold text-white transition-all hover:bg-[hsl(222,47%,18%)] active:scale-[0.98]"
                    >
                      Select Premium (₹24,999)
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <FadeIn delay={0.3}>
              <div className="mt-10 text-center">
                <Link
                  href="/pricing"
                  className="text-sm font-semibold text-[hsl(220,13%,46%)] hover:text-[hsl(166,72%,40%)] underline underline-offset-4 transition-colors"
                >
                  See detailed package comparison and 14 standalone add-on services →
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* ═══════════════ FAQ SECTION ═══════════════ */}
        <section className="bg-[hsl(220,14%,96%)] px-6 py-24 lg:px-8 border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-4xl">
            <FadeIn className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                Got Questions?
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)]">
                Frequently Asked Questions
              </h2>
            </FadeIn>

            <StaggerContainer className="space-y-4">
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
                <StaggerItem key={index}>
                  <FAQItem question={faq.q} answer={faq.a} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-24 px-6 lg:px-8 text-center text-white">
          {/* Animated dots */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-0 left-1/4 h-80 w-80 rounded-full bg-[hsl(166,72%,40%)] opacity-[0.06] blur-[100px]" />
            <div className="mesh-orb-delayed absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-[hsl(45,93%,58%)] opacity-[0.04] blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready for an Honest Conversation About Your Future?
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-5 text-lg text-white/60 max-w-xl mx-auto">
                Book a no-obligation session with our advisors. We will review your profile and give you straight answers.
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className="relative rounded-xl bg-[hsl(166,72%,40%)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:shadow-xl hover:shadow-[hsl(166,72%,40%)]/30 active:scale-[0.98] pulse-ring"
                >
                  Schedule Free Profile Assessment
                </Link>
                <Link
                  href="/contact"
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-white transition-all hover:bg-white/[0.08] hover:border-white/25"
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

/* ─── FAQ Accordion Item ─── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white overflow-hidden transition-all hover:border-[hsl(220,13%,85%)]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-6 text-left"
      >
        <h3 className="text-base font-bold text-[hsl(222,47%,11%)] pr-4">
          {question}
        </h3>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-[hsl(220,13%,46%)]" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="px-6 pb-6 text-sm text-[hsl(220,13%,46%)] leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
