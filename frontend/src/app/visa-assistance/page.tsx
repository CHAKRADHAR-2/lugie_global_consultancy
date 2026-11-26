"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
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
                <FileBadge className="h-3.5 w-3.5" />
                <span>Immigration & Compliance</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Student Visa Assistance & Preparation
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Meticulous dossier compilation, strict financial rule compliance, and intensive mock interviews
                to ensure your application meets international immigration standards.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="bg-white py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Country Cards */}
            <div>
              <FadeIn className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                  Country Checklists
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)]">
                  Destination-Specific Visa Guidance
                </h2>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {VISA_DESTINATIONS.map((dest, idx) => (
                  <StaggerItem key={idx} className="flex">
                    <div className="w-full rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[hsl(166,72%,40%)]/30">
                      <div>
                        <h3 className="text-lg font-bold text-[hsl(222,47%,11%)] mb-4 pb-3 border-b border-[hsl(220,13%,91%)]">
                          {dest.country}
                        </h3>
                        <ul className="space-y-3">
                          {dest.details.map((item, i) => (
                            <li key={i} className="text-xs text-[hsl(220,13%,46%)] flex items-start gap-2.5 leading-relaxed">
                              <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
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
              <div className="rounded-2xl border border-[hsl(45,93%,58%)]/40 bg-[hsl(45,93%,58%)]/10 p-8 sm:p-10 space-y-4">
                <div className="flex items-center gap-2.5 font-bold text-[hsl(222,47%,11%)] text-base">
                  <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
                  <span>Strict Regulatory & Sovereign Authority Notice</span>
                </div>
                <p className="text-sm text-[hsl(220,13%,46%)] leading-relaxed">
                  Visa issuance is the exclusive legal authority of foreign embassies, high commissions,
                  consulates, and border control agencies (e.g. US Department of State, UK Visas & Immigration,
                  IRCC Canada, Australian Department of Home Affairs).
                </p>
                <p className="text-sm text-[hsl(222,47%,11%)] font-medium leading-relaxed">
                  Lugie Global Consultancy provides procedural assistance, document verification, and
                  mock interview preparation. We do NOT and CANNOT guarantee visa issuance, visa turnaround
                  times, or bypass government visa requirements under any circumstances.
                </p>
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn>
              <div className="text-center pt-4">
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 rounded-xl bg-[hsl(166,72%,40%)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,50%)] hover:shadow-xl active:scale-[0.98]"
                >
                  Schedule Visa Advisory Session <ArrowRight className="h-4 w-4" />
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
