"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { buttonVariants } from "@/components/ui/button";
import { FileBadge, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const VISA_DESTINATIONS = [
  {
    country: "United States (F-1 Visa)",
    details: [
      "I-20 issuance review & SEVIS I-901 fee payment guidance",
      "DS-160 application form filing assistance",
      "Rigorous 1-on-1 mock interviews (academic intent, funding, home ties)",
      "OFC biometrics and consular interview appointment scheduling",
    ],
  },
  {
    country: "United Kingdom (Student Visa)",
    details: [
      "Confirmation of Acceptance for Studies (CAS) verification",
      "Strict 28-day financial fund maintenance check (UKVI rules)",
      "Immigration Health Surcharge (IHS) & biometric enrollment support",
      "Credibility interview preparation (if flagged)",
    ],
  },
  {
    country: "Canada (Study Permit)",
    details: [
      "Provincial Attestation Letter (PAL) guidance",
      "Guaranteed Investment Certificate (GIC) account opening support",
      "Upfront medical examination and police clearance coordination",
      "Comprehensive Statement of Purpose (SOP) tailored for IRCC",
    ],
  },
  {
    country: "Germany (National Student Visa)",
    details: [
      "APS Certificate (Academic Evaluation Centre) documentation",
      "Blocked Account (Sperrkonto) setup & health insurance compliance",
      "VFS / Embassy appointment monitoring & checklist verification",
      "Motivation letter review according to German embassy guidelines",
    ],
  },
  {
    country: "Australia (Subclass 500 Visa)",
    details: [
      "Confirmation of Enrolment (CoE) audit",
      "Genuine Student (GS) requirement narrative crafting",
      "Overseas Student Health Cover (OSHC) arrangement",
      "Financial capacity matrix compilation",
    ],
  },
  {
    country: "Ireland (Study Visa)",
    details: [
      "AVATS online visa application filing",
      "Detailed financial summary sheet and source of funds documentation",
      "Private medical insurance compliance",
      "Educational history gap justification",
    ],
  },
];

export default function VisaAssistancePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <FileBadge className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Immigration &amp; Compliance</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Student Visa Assistance &amp; Preparation
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Meticulous dossier compilation, strict financial rule compliance, and intensive mock interviews
                to ensure your application meets international immigration standards.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        <section className="bg-white py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Country Cards */}
            <div>
              <FadeIn className="text-center mb-12">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                  Country Checklists
                </span>
                <h2 className="mt-3 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                  Destination-Specific Visa Guidance
                </h2>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {VISA_DESTINATIONS.map((dest, idx) => (
                  <StaggerItem key={idx} className="flex">
                    <div className="w-full rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/55 p-6 flex flex-col justify-between transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:border-[#B7CBC2] hover:shadow-md">
                      <div>
                        <h3 className="text-lg font-semibold text-[#394B49] mb-4 pb-3 border-b border-[#DCE5E8]">
                          {dest.country}
                        </h3>
                        <ul className="space-y-3">
                          {dest.details.map((item, i) => (
                            <li key={i} className="text-xs text-[#546866] flex items-start gap-2.5 leading-relaxed">
                              <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            {/* Mandatory Disclaimer */}
            <FadeIn>
              <div className="rounded-2xl border border-[#D9A879] bg-[#FCF6EC] p-8 sm:p-10 space-y-4">
                <div className="flex items-center gap-2.5 font-semibold text-[#263331] text-base">
                  <AlertTriangle className="h-5 w-5 text-[#8A5A1E] shrink-0" aria-hidden="true" />
                  <span>Strict Regulatory &amp; Sovereign Authority Notice</span>
                </div>
                <p className="text-sm text-[#546866] leading-relaxed">
                  Visa issuance is the exclusive legal authority of foreign embassies, high commissions,
                  consulates, and border control agencies (e.g. US Department of State, UK Visas &amp; Immigration,
                  IRCC Canada, Australian Department of Home Affairs).
                </p>
                <p className="text-sm text-[#263331] font-medium leading-relaxed">
                  Lugie Global Consultancy provides procedural assistance, document verification, and
                  mock interview preparation. We do NOT and CANNOT guarantee visa issuance, visa turnaround
                  times, or bypass government visa requirements under any circumstances.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Bottom Editorial CTA */}
        <section className="bg-[#394B49] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                Prepare Your Visa Dossier with Precision
              </h2>
              <p className="mt-4 text-[#F3F0E8]/80">
                Book an advisory session to audit your financial proofs, timelines, and interview readiness.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  <span>Schedule Visa Advisory Session</span>
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
