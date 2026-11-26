"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { buttonVariants } from "@/components/ui/button";
import { Landmark, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function LoansPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Landmark className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Financial Planning</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Education Loan Assistance
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Unbiased guidance on secured (collateral) and unsecured (non-collateral) overseas education
                loans from leading public banks, private banks, and NBFCs.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        <section className="bg-white py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Secured vs Unsecured Grid */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <StaggerItem className="flex">
                <div className="w-full rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/55 p-8 transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:border-[#B7CBC2] hover:shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                    Lowest Interest Rates
                  </span>
                  <h2 className="font-editorial text-2xl text-[#394B49] mt-2 mb-4">
                    Secured Education Loans (With Collateral)
                  </h2>
                  <p className="text-sm text-[#546866] mb-6 leading-relaxed">
                    Backed by tangible property, fixed deposits, or government bonds. Typically offered by
                    nationalized banks (SBI, Bank of Baroda, Canara Bank, Union Bank).
                  </p>
                  <ul className="space-y-3 text-sm text-[#394B49] border-t border-[#DCE5E8] pt-5">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Interest rates typically between 8.5% – 10.5% p.a.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Loan amounts up to ₹1.5 Crore+ for premier institutes</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Moratorium period: Course duration + 6 to 12 months</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Tax deductions available under Section 80E</span>
                    </li>
                  </ul>
                </div>
              </StaggerItem>

              <StaggerItem className="flex">
                <div className="w-full rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/55 p-8 transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:border-[#B7CBC2] hover:shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3F6258]">
                    Fast Processing
                  </span>
                  <h2 className="font-editorial text-2xl text-[#394B49] mt-2 mb-4">
                    Unsecured Education Loans (Without Collateral)
                  </h2>
                  <p className="text-sm text-[#546866] mb-6 leading-relaxed">
                    Evaluated on student academic pedigree, target university ranking, and co-applicant
                    financial profile (ITR and CIBIL score). Offered by private banks and NBFCs.
                  </p>
                  <ul className="space-y-3 text-sm text-[#394B49] border-t border-[#DCE5E8] pt-5">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Interest rates typically between 10.5% – 13.5% p.a.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Loan amounts up to ₹50 Lakhs – ₹75 Lakhs without asset pledge</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Faster turnaround: Sanction letter within 5 to 10 working days</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <span>Accepted for student visa financial proof in UK, US, Germany, etc.</span>
                    </li>
                  </ul>
                </div>
              </StaggerItem>
            </StaggerContainer>

            {/* Lugie Role and Disclaimer */}
            <FadeIn>
              <div className="rounded-2xl border border-[#DCE5E8] bg-[#EEF3F5]/65 p-8 sm:p-12 space-y-6">
                <h2 className="font-editorial text-2xl text-[#394B49]">
                  Our Educational Role &amp; Disclosure
                </h2>
                <p className="text-sm text-[#546866] leading-relaxed">
                  Lugie Global Consultancy acts as a guidance and document facilitation advisor. We help
                  students format university conditional/unconditional offers, calculate exact I-20 or CAS
                  funds required, and coordinate with banking representatives for timely sanction letters.
                </p>

                <div className="rounded-2xl border border-[#D9A879] bg-[#FCF6EC] p-5 text-xs text-[#263331] space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-[#263331]">
                    <AlertTriangle className="h-4 w-4 text-[#8A5A1E] shrink-0" aria-hidden="true" />
                    <span>Important Financial Disclaimer</span>
                  </div>
                  <p className="text-[#546866] leading-relaxed">
                    Loan sanctions, loan amounts, margins, and interest rates are subject to the independent
                    underwriting policies, credit checks, and final approval of the lending institutions.
                    Lugie Global Consultancy is not a bank or NBFC and cannot guarantee loan approvals or interest rates.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Bottom Editorial CTA */}
        <section className="bg-[#394B49] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                Plan Your Funding Timeline Early
              </h2>
              <p className="mt-4 text-[#F3F0E8]/80">
                Get clarity on required bank balances, sanction timelines, and repayment structures before you apply.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  <span>Get Loan Guidance for Your Program</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
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
