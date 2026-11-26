"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_TAGLINE } from "@/lib/constants";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Our Story &amp; Philosophy</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                About Lugie Global Consultancy
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-4 font-editorial italic text-xl sm:text-2xl text-[#8E572C]">
                {APP_TAGLINE}.
              </p>
            </FadeIn>
            <FadeIn delay={0.28}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                We started Lugie with a straightforward conviction: Indian students deserve honest,
                uncompromised, and founder-driven overseas education guidance without fabricated claims or hidden commissions.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        {/* The Founders & Lean Model */}
        <section className="bg-white py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <FadeIn className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                Who We Are
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl leading-tight text-[#394B49]">
                Two Founders. One Obsession: Your Genuine Academic Fit.
              </h2>
              <p className="text-[#546866] leading-relaxed">
                Lugie was founded by two international education specialists who spent years inside the overseas
                education industry witnessing a troubling trend: high-pressure sales centers pushing students
                into tie-up institutions purely for university commissions, while making unrealistic promises
                about guaranteed visas and admissions.
              </p>
              <p className="text-[#546866] leading-relaxed">
                We intentionally run Lugie as a{" "}
                <strong className="font-semibold text-[#263331]">lean, focused consultancy</strong>. You aren&apos;t handed off
                to untrained junior call-center telemarketers. When you work with Lugie, your profile is
                reviewed directly by experienced advisors who look at your long-term return on investment,
                career prospects, and financial readiness.
              </p>
              <div className="pt-2">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  <span>Talk Directly With Us</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={0.15} className="lg:col-span-6">
              <div className="rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/65 p-8 sm:p-10 space-y-8">
                <h3 className="font-editorial text-2xl text-[#394B49]">
                  Our Non-Negotiable Pillars
                </h3>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#EDF5F1] text-[#2F6B55]">
                    <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#394B49]">Zero Fabricated Claims</h4>
                    <p className="text-sm text-[#546866] mt-1 leading-relaxed">
                      We will never display fake student success percentages, fictitious testimonials, or
                      make up admission numbers to sway your decision.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258]">
                    <Compass className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#394B49]">Transparent Fixed Pricing</h4>
                    <p className="text-sm text-[#546866] mt-1 leading-relaxed">
                      Our service packages (Basic ₹7,999, Standard ₹13,999, Premium ₹24,999) are published
                      openly. No hidden charges or surprise invoices.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D9A879]/60 bg-[#F6EDE4] text-[#8E572C]">
                    <BookOpen className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#394B49]">Official University Sources Only</h4>
                    <p className="text-sm text-[#546866] mt-1 leading-relaxed">
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
        <section className="bg-[#F3F0E8] py-20 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-4xl text-center">
            <FadeIn>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A63A3A]">
                Honest Clarification
              </span>
              <h2 className="mt-3 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                What We Do NOT Promise
              </h2>
              <p className="mt-3 text-[#546866]">
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
                  <div className="beyond-card beyond-card-interactive w-full border-[#E7BABA] p-6">
                    <div className="flex items-center gap-2.5 text-[#A63A3A] font-semibold mb-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#E7BABA] bg-[#FDF2F2] text-[#A63A3A]">
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <span>{item.title}</span>
                    </div>
                    <p className="text-sm text-[#546866] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Mission Banner */}
        <section className="bg-[#394B49] py-20 sm:py-24 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <span className="inline-block rounded-full border border-[#B7CBC2]/30 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5BE99] mb-4">
                Start With Clarity
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl text-white">
                Dream Beyond Borders with Lugie
              </h2>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-4 text-base sm:text-lg text-[#F3F0E8]/80">
                Ready to explore your genuine study options with honest advisors?
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  Schedule Free Profile Evaluation
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  View Packages &amp; Pricing
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
