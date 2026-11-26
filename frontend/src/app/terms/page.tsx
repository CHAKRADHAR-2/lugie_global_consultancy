"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME } from "@/lib/constants";
import { FadeIn } from "@/components/ui/fade-in";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-16 sm:py-20 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <FileText className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Terms of Service</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl text-[#394B49]">
                Terms &amp; Conditions
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="mt-4 text-sm text-[#546866]">
                Last Updated: November 2026 · {APP_NAME}
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6 lg:px-8">
          <FadeIn>
            <div className="beyond-card mx-auto max-w-4xl p-8 sm:p-12">
              <div className="prose prose-sm text-[#546866] max-w-none space-y-8 leading-relaxed">
                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">1. Nature of Consultancy Services</h2>
                  <p>
                    {APP_NAME} (&quot;Lugie&quot;) operates strictly as an educational advisory, career mapping, and application facilitation service. Our professional staff provides guidance regarding university eligibility, document review, and procedural visa checklist preparation.
                  </p>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-3">2. Explicit No-Guarantee Disclaimer</h2>
                  <div className="rounded-2xl border border-[#E7BABA] bg-[#FDF2F2] p-6 text-[#263331] text-xs sm:text-sm font-medium space-y-2.5">
                    <p>
                      <strong className="text-[#A63A3A]">Admissions Disclaimer:</strong> University admissions decisions are made exclusively by the independent admissions boards and academic faculties of respective institutions. Lugie does not guarantee admission or interview invitations to any university or college.
                    </p>
                    <p>
                      <strong className="text-[#A63A3A]">Visa Disclaimer:</strong> Visa adjudications, issuance, processing times, and refusal decisions are sovereign acts of respective foreign government diplomatic missions (embassies, consulates, and border control agencies). Lugie does not guarantee visa issuance or grant under any circumstances.
                    </p>
                    <p>
                      <strong className="text-[#A63A3A]">Financial Disclaimer:</strong> Scholarships and loan sanctions are granted solely at the discretion of external granting organizations and financial institutions. Lugie does not guarantee scholarship awards or loan approvals.
                    </p>
                  </div>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">3. Student Responsibilities &amp; Document Authenticity</h2>
                  <p className="mb-2">
                    The student expressly warrants and guarantees that all academic certificates, marks cards, letters of recommendation, bank balance certificates, and identity documents provided to Lugie are 100% genuine, authentic, and unaltered.
                  </p>
                  <p className="text-[#A63A3A] font-medium">
                    Lugie maintains zero tolerance for forged or counterfeit documentation. Any attempt to submit falsified documents will result in immediate termination of services without refund, and notification to relevant academic or visa bodies where legally mandated.
                  </p>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">4. Consultancy Fees &amp; Third-Party Charges</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Our package prices (Basic ₹7,999, Standard ₹13,999, Premium ₹24,999) cover only professional advisory, editing, and guidance fees by Lugie consultants.</li>
                    <li>All third-party charges — including but not limited to university application fees, credential evaluation fees (WES/Uni-Assist), standardized test fees (IELTS/TOEFL/GRE), embassy visa fees, biometrics fees, SEVIS fees, health insurance (NHS/OSHC), and courier services — are strictly the direct financial responsibility of the student.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">5. Jurisdiction &amp; Dispute Resolution</h2>
                  <p>
                    These Terms &amp; Conditions shall be governed by and construed in accordance with the laws of India. Any legal dispute, claim, or controversy arising out of or in connection with services rendered by {APP_NAME} shall be subject to the exclusive jurisdiction of the competent courts in Bangalore, Karnataka, India.
                  </p>
                </section>
              </div>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </div>
  );
}
