"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { Landmark, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function LoansPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-24 px-6 lg:px-8 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-[hsl(166,72%,40%)] opacity-[0.07] blur-[120px]" />
            <div className="mesh-orb-delayed absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[hsl(45,93%,58%)] opacity-[0.05] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <FadeIn delay={0.1} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 text-xs font-semibold tracking-widest uppercase text-[hsl(166,72%,50%)] mb-6 backdrop-blur-sm border border-white/[0.08]">
                <Landmark className="h-3.5 w-3.5" />
                <span>Financial Planning</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Education Loan Assistance
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Unbiased guidance on secured (collateral) and unsecured (non-collateral) overseas education
                loans from leading public banks, private banks, and NBFCs.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="bg-white py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Secured vs Unsecured Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StaggerItem className="flex">
                <div className="w-full rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[hsl(166,72%,40%)]/30">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                    Lowest Interest Rates
                  </span>
                  <h3 className="text-xl font-bold text-[hsl(222,47%,11%)] mt-2 mb-4">
                    Secured Education Loans (With Collateral)
                  </h3>
                  <p className="text-sm text-[hsl(220,13%,46%)] mb-6 leading-relaxed">
                    Backed by tangible property, fixed deposits, or government bonds. Typically offered by
                    nationalized banks (SBI, Bank of Baroda, Canara Bank, Union Bank).
                  </p>
                  <ul className="space-y-3 text-sm text-[hsl(222,47%,20%)] border-t border-[hsl(220,13%,91%)] pt-5">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Interest rates typically between 8.5% – 10.5% p.a.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Loan amounts up to ₹1.5 Crore+ for premier institutes</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Moratorium period: Course duration + 6 to 12 months</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Tax deductions available under Section 80E</span>
                    </li>
                  </ul>
                </div>
              </StaggerItem>

              <StaggerItem className="flex">
                <div className="w-full rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[hsl(166,72%,40%)]/30">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                    Fast Processing
                  </span>
                  <h3 className="text-xl font-bold text-[hsl(222,47%,11%)] mt-2 mb-4">
                    Unsecured Education Loans (Without Collateral)
                  </h3>
                  <p className="text-sm text-[hsl(220,13%,46%)] mb-6 leading-relaxed">
                    Evaluated on student academic pedigree, target university ranking, and co-applicant
                    financial profile (ITR and CIBIL score). Offered by private banks and NBFCs.
                  </p>
                  <ul className="space-y-3 text-sm text-[hsl(222,47%,20%)] border-t border-[hsl(220,13%,91%)] pt-5">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Interest rates typically between 10.5% – 13.5% p.a.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Loan amounts up to ₹50 Lakhs – ₹75 Lakhs without asset pledge</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Faster turnaround: Sanction letter within 5 to 10 working days</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <span>Accepted for student visa financial proof in UK, US, Germany, etc.</span>
                    </li>
                  </ul>
                </div>
              </StaggerItem>
            </StaggerContainer>

            {/* Lugie Role and Disclaimer */}
            <FadeIn>
              <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(220,14%,96%)] p-8 sm:p-12 space-y-6">
                <h3 className="text-xl font-bold text-[hsl(222,47%,11%)]">
                  Our Educational Role & Disclosure
                </h3>
                <p className="text-sm text-[hsl(220,13%,46%)] leading-relaxed">
                  Lugie Global Consultancy acts as a guidance and document facilitation advisor. We help
                  students format university conditional/unconditional offers, calculate exact I-20 or CAS
                  funds required, and coordinate with banking representatives for timely sanction letters.
                </p>

                <div className="rounded-2xl border border-[hsl(45,93%,58%)]/40 bg-[hsl(45,93%,58%)]/10 p-5 text-xs text-[hsl(222,47%,20%)] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[hsl(222,47%,11%)]">
                    <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Important Financial Disclaimer</span>
                  </div>
                  <p className="text-[hsl(220,13%,46%)] leading-relaxed">
                    Loan sanctions, loan amounts, margins, and interest rates are subject to the independent
                    underwriting policies, credit checks, and final approval of the lending institutions.
                    Lugie Global Consultancy is not a bank or NBFC and cannot guarantee loan approvals or interest rates.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn>
              <div className="text-center pt-4">
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 rounded-xl bg-[hsl(166,72%,40%)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,50%)] hover:shadow-xl active:scale-[0.98]"
                >
                  Get Loan Guidance for Your Program <ArrowRight className="h-4 w-4" />
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
