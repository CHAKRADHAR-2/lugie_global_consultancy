import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FileBadge, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, FileCheck } from "lucide-react";

export const metadata = {
  title: "Visa Assistance & Guidance",
  description: "Expert student visa guidance, dossier compilation, financial compliance, and mock interviews.",
};

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
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Immigration & Compliance
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Student Visa Assistance & Preparation
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Meticulous dossier compilation, strict financial rule compliance, and intensive mock interviews
              to ensure your application meets international immigration standards.
            </p>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Country Cards */}
            <div>
              <h2 className="text-2xl font-bold text-[hsl(215,50%,12%)] mb-8 text-center">
                Destination-Specific Visa Guidance
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {VISA_DESTINATIONS.map((dest, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-bold text-[hsl(215,50%,12%)] mb-4">
                        {dest.country}
                      </h3>
                      <ul className="space-y-2.5">
                        {dest.details.map((item, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Disclaimer */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50/70 p-8 sm:p-10 space-y-4">
              <div className="flex items-center gap-2 font-bold text-amber-950 text-base">
                <AlertTriangle className="h-5 w-5 text-amber-700" />
                <span>Strict Regulatory & Sovereign Authority Notice</span>
              </div>
              <p className="text-sm text-amber-900 leading-relaxed">
                Visa issuance is the exclusive legal authority of foreign embassies, high commissions,
                consulates, and border control agencies (e.g. US Department of State, UK Visas & Immigration,
                IRCC Canada, Australian Department of Home Affairs).
              </p>
              <p className="text-sm text-amber-900 font-medium leading-relaxed">
                Lugie Global Consultancy provides procedural assistance, document verification, and
                mock interview preparation. We do NOT and CANNOT guarantee visa issuance, visa turnaround
                times, or bypass government visa requirements under any circumstances.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(174,85%,32%)] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition"
              >
                Schedule Visa Advisory Session <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
