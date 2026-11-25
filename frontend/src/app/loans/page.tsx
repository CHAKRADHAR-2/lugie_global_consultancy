import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Landmark, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, FileSpreadsheet } from "lucide-react";

export const metadata = {
  title: "Education Loan Assistance",
  description: "Navigate secured and unsecured education loans with top national and international lenders.",
};

export default function LoansPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Financial Planning
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Education Loan Assistance
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Unbiased guidance on secured (collateral) and unsecured (non-collateral) overseas education
              loans from leading public banks, private banks, and NBFCs.
            </p>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Secured vs Unsecured Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                  Lowest Interest Rates
                </span>
                <h3 className="text-xl font-bold text-[hsl(215,50%,12%)] mt-2 mb-4">
                  Secured Education Loans (With Collateral)
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Backed by tangible property, fixed deposits, or government bonds. Typically offered by
                  nationalized banks (SBI, Bank of Baroda, Canara Bank, Union Bank).
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Interest rates typically between 8.5% – 10.5% p.a.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Loan amounts up to ₹1.5 Crore+ for premier institutes</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Moratorium period: Course duration + 6 to 12 months</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Tax deductions available under Section 80E</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                  Fast Processing
                </span>
                <h3 className="text-xl font-bold text-[hsl(215,50%,12%)] mt-2 mb-4">
                  Unsecured Education Loans (Without Collateral)
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Evaluated on student academic pedigree, target university ranking, and co-applicant
                  financial profile (ITR and CIBIL score). Offered by private banks and NBFCs.
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Interest rates typically between 10.5% – 13.5% p.a.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Loan amounts up to ₹50 Lakhs – ₹75 Lakhs without asset pledge</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Faster turnaround: Sanction letter within 5 to 10 working days</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Accepted for student visa financial proof in UK, US, Germany, etc.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Lugie Role and Disclaimer */}
            <div className="rounded-3xl border border-gray-100 bg-gray-50/70 p-8 sm:p-12 space-y-6">
              <h3 className="text-xl font-bold text-[hsl(215,50%,12%)]">
                Our Educational Role & Disclosure
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Lugie Global Consultancy acts as a guidance and document facilitation advisor. We help
                students format university conditional/unconditional offers, calculate exact I-20 or CAS
                funds required, and coordinate with banking representatives for timely sanction letters.
              </p>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-amber-950">
                  <AlertTriangle className="h-4 w-4 text-amber-700" />
                  <span>Important Financial Disclaimer</span>
                </div>
                <p>
                  Loan sanctions, loan amounts, margins, and interest rates are subject to the independent
                  underwriting policies, credit checks, and final approval of the lending institutions.
                  Lugie Global Consultancy is not a bank or NBFC and cannot guarantee loan approvals or interest rates.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(174,85%,32%)] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition"
              >
                Get Loan Guidance for Your Program <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
