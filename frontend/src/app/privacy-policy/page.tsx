"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME } from "@/lib/constants";
import { FadeIn } from "@/components/ui/fade-in";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-16 sm:py-20 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <ShieldCheck className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Legal &amp; Compliance</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl text-[#394B49]">
                Privacy Policy
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
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">1. Introduction</h2>
                  <p>
                    At {APP_NAME} (&quot;Lugie&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), we are committed to safeguarding the privacy and security of the personal and academic data entrusted to us by students, prospective applicants, and parents. This Privacy Policy details our practices concerning data collection, storage, processing, and disclosure.
                  </p>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">2. Information We Collect</h2>
                  <p className="mb-2">In order to provide overseas education consultancy and admissions guidance, we may collect:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong className="font-semibold text-[#394B49]">Contact Information:</strong> Full name, email address, telephone/WhatsApp number, current residential city and state.</li>
                    <li><strong className="font-semibold text-[#394B49]">Academic Records:</strong> Transcripts, mark sheets, diplomas, degree certificates, backlogs history, GPA, and curriculum vitae.</li>
                    <li><strong className="font-semibold text-[#394B49]">Standardized Test Scores:</strong> IELTS, TOEFL, PTE, Duolingo, GRE, GMAT, or SAT score reports.</li>
                    <li><strong className="font-semibold text-[#394B49]">Identification &amp; Travel Documents:</strong> Passport copies, nationality information, and date of birth.</li>
                    <li><strong className="font-semibold text-[#394B49]">Financial Overview:</strong> Sponsorship affidavits, bank solvency summaries, or education loan sanctions as strictly necessary for visa document verification.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">3. How We Use Your Data</h2>
                  <p className="mb-2">Your personal information is utilized exclusively for:</p>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li>Evaluating academic eligibility for international programs.</li>
                    <li>Submitting university applications with your explicit prior consent.</li>
                    <li>Assisting with student visa appointment filings and checklist validation.</li>
                    <li>Communicating status updates, admissions offers, and counseling sessions.</li>
                    <li>Complying with applicable legal, regulatory, and audit obligations.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">4. Absolute Anti-Spam &amp; Zero Data Sale Commitment</h2>
                  <p>
                    <strong className="font-semibold text-[#263331]">
                      We do not sell, rent, lease, or monetize your personal information to third-party telemarketers, commercial advertisers, or lead brokers under any circumstances.
                    </strong>
                  </p>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">5. Document Security &amp; Storage</h2>
                  <p>
                    Uploaded academic records and identity proofs are stored in isolated, access-controlled cloud infrastructure with encryption in transit (TLS 1.3) and encryption at rest. Access is restricted strictly to your assigned counsellor and supervising administrators.
                  </p>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">6. Your Rights</h2>
                  <p>
                    You have the right to request access to the data we hold concerning your profile, request corrections to erroneous records, or request complete deletion of your profile and documents upon conclusion of your service engagement, subject to statutory record-retention laws.
                  </p>
                </section>

                <section>
                  <h2 className="font-editorial text-2xl text-[#394B49] mb-2">7. Contact the Data Protection Officer</h2>
                  <p>
                    For any questions or privacy concerns, please contact our administrative desk at{" "}
                    <a
                      href="mailto:privacy@lugie.com"
                      className="font-semibold text-[#8E572C] underline underline-offset-2 hover:text-[#394B49] transition-colors"
                    >
                      privacy@lugie.com
                    </a>
                    .
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
