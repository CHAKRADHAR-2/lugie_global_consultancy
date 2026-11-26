"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_TAGLINE } from "@/lib/constants";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import {
  Compass,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-24 px-6 lg:px-8 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-[hsl(166,72%,40%)] opacity-[0.07] blur-[120px]" />
            <div className="mesh-orb-delayed absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[hsl(45,93%,58%)] opacity-[0.05] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <FadeIn delay={0.1} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 text-xs font-semibold tracking-widest uppercase text-[hsl(166,72%,50%)] mb-6 backdrop-blur-sm border border-white/[0.08]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Our Story & Philosophy</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                About Lugie Global Consultancy
              </h1>
            </FadeIn>
            <FadeIn delay={0.3}>
              <p className="mt-4 text-xl sm:text-2xl font-light italic text-[hsl(45,93%,68%)]">
                {APP_TAGLINE}
              </p>
            </FadeIn>
            <FadeIn delay={0.45}>
              <p className="mt-6 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                We started Lugie with a straightforward conviction: Indian students deserve honest,
                uncompromised, and founder-driven overseas education guidance without fabricated claims or hidden commissions.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* The Founders & Lean Model */}
        <section className="bg-white py-24 px-6 lg:px-8 border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <FadeIn className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                Who We Are
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)] sm:text-4xl leading-tight">
                Two Founders. One Obsession: Your Genuine Academic Fit.
              </h2>
              <p className="text-[hsl(220,13%,46%)] leading-relaxed">
                Lugie was founded by two international education specialists who spent years inside the overseas
                education industry witnessing a troubling trend: high-pressure sales centers pushing students
                into tie-up institutions purely for university commissions, while making unrealistic promises
                about guaranteed visas and admissions.
              </p>
              <p className="text-[hsl(220,13%,46%)] leading-relaxed">
                We intentionally run Lugie as a <strong className="text-[hsl(222,47%,11%)]">lean, focused consultancy</strong>. You aren’t handed off
                to untrained junior call-center telemarketers. When you work with Lugie, your profile is
                reviewed directly by experienced advisors who look at your long-term return on investment,
                career prospects, and financial readiness.
              </p>
              <div className="pt-2">
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 rounded-xl bg-[hsl(166,72%,40%)] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,50%)] hover:shadow-xl hover:shadow-[hsl(166,72%,40%)]/30 active:scale-[0.98]"
                >
                  Talk Directly With Us <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.15} className="lg:col-span-6">
              <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-8 sm:p-10 space-y-8 shadow-sm">
                <h3 className="text-xl font-bold text-[hsl(222,47%,11%)]">
                  Our Non-Negotiable Pillars
                </h3>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(160,84%,39%)]/10 text-[hsl(160,84%,39%)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[hsl(222,47%,11%)]">Zero Fabricated Claims</h4>
                    <p className="text-sm text-[hsl(220,13%,46%)] mt-1 leading-relaxed">
                      We will never display fake student success percentages, fictitious testimonials, or
                      make up admission numbers to sway your decision.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[hsl(222,47%,11%)]">Transparent Fixed Pricing</h4>
                    <p className="text-sm text-[hsl(220,13%,46%)] mt-1 leading-relaxed">
                      Our service packages (Basic ₹7,999, Standard ₹13,999, Premium ₹24,999) are published
                      openly. No hidden charges or surprise invoices.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(45,93%,58%)]/15 text-amber-700">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[hsl(222,47%,11%)]">Official University Sources Only</h4>
                    <p className="text-sm text-[hsl(220,13%,46%)] mt-1 leading-relaxed">
                      Every deadline, entry criterion, and fee structure we quote is verified directly against
                      official university websites and faculty catalogs.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* What We Don't Do (Honest Disclosure) */}
        <section className="bg-[hsl(220,14%,96%)] py-20 px-6 lg:px-8 border-b border-[hsl(220,13%,91%)]">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">
                Honest Clarification
              </span>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)] sm:text-4xl">
                What We Do NOT Promise
              </h2>
              <p className="mt-3 text-[hsl(220,13%,46%)]">
                Clear expectations build great partnerships. Here is our ethical boundary:
              </p>
            </FadeIn>

            <StaggerContainer className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {[
                {
                  title: "No Guaranteed Admissions",
                  desc: "Universities make their own decisions. We strengthen your profile and narrative, but no consultancy legally controls admissions committees.",
                },
                {
                  title: "No Guaranteed Visas",
                  desc: "Embassies and visa officers are sovereign government bodies. We ensure meticulous documentation and mock interviews, but cannot guarantee a visa stamp.",
                },
                {
                  title: "No Automatic Scholarships",
                  desc: "We discover, verify, and assist with scholarship applications; scholarships are awarded strictly on merit or financial need by funding bodies.",
                },
                {
                  title: "Third-Party Charges Are Separate",
                  desc: "Government visa application fees, university application charges, English test fees, and SEVIS fees are paid directly to those respective authorities.",
                },
              ].map((item) => (
                <StaggerItem key={item.title} className="flex">
                  <div className="w-full rounded-2xl border border-rose-200/70 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-500/5">
                    <div className="flex items-center gap-2.5 text-rose-700 font-semibold mb-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-sm text-[hsl(220,13%,46%)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Mission Banner */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-24 px-6 lg:px-8 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-0 left-1/4 h-80 w-80 rounded-full bg-[hsl(166,72%,40%)] opacity-[0.06] blur-[100px]" />
            <div className="mesh-orb-delayed absolute bottom-0 right-1/4 h-60 w-60 rounded-full bg-[hsl(45,93%,58%)] opacity-[0.04] blur-[80px]" />
          </div>

          <div className="relative mx-auto max-w-3xl">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Dream Beyond Borders with Lugie
              </h2>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p className="mt-4 text-lg text-white/60">
                Ready to explore your genuine study options with honest advisors?
              </p>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className="rounded-xl bg-[hsl(166,72%,40%)] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,50%)] hover:shadow-xl active:scale-[0.98]"
                >
                  Schedule Free Profile Evaluation
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.08] hover:border-white/25"
                >
                  View Packages & Pricing
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
