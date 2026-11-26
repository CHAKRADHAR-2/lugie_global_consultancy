"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadForm } from "@/components/forms/lead-form";
import { FadeIn } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { UserCheck, ShieldAlert, Sparkles } from "lucide-react";

export default function BookConsultationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-16 sm:py-20 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Personalized Guidance</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Book Your Free Profile Assessment
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Get an honest, data-backed assessment of your academic profile, target universities, and
                visa feasibility directly from experienced counsellors.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-10" />
        </section>

        {/* Form and Benefits */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: What to Expect */}
            <FadeIn className="lg:col-span-5 space-y-6">
              <div className="beyond-card p-8">
                <h2 className="font-editorial text-2xl text-[#394B49] mb-6">
                  What Happens in Your Session?
                </h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] font-bold text-xs mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#394B49]">Transcript &amp; Score Evaluation</h3>
                      <p className="text-xs text-[#546866] mt-1 leading-relaxed">
                        We review your GPA, backlogs (if any), English proficiency scores (IELTS/TOEFL/PTE), and standardized tests.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] font-bold text-xs mt-0.5">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#394B49]">Country &amp; Budget Matching</h3>
                      <p className="text-xs text-[#546866] mt-1 leading-relaxed">
                        We compare tuition, cost of living, post-study work visa policies, and part-time work regulations across your target countries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] font-bold text-xs mt-0.5">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#394B49]">Dream / Reach / Safe University List</h3>
                      <p className="text-xs text-[#546866] mt-1 leading-relaxed">
                        A realistic categorization so you maximize admission probability without sacrificing your aspirations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] font-bold text-xs mt-0.5">
                      4
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#394B49]">Timeline &amp; Document Roadmap</h3>
                      <p className="text-xs text-[#546866] mt-1 leading-relaxed">
                        Clear milestones for SOP drafting, recommendation letters, intake deadlines, and visa filing windows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder-Led Callout */}
              <div className="rounded-2xl border border-[#B7CBC2] bg-[#EDF5F1] p-6 text-sm text-[#394B49]">
                <div className="flex items-center gap-2 font-semibold text-[#263331] mb-2">
                  <UserCheck className="h-5 w-5 text-[#2F6B55]" aria-hidden="true" />
                  <span>No Sales Pressure Guarantee</span>
                </div>
                <p className="text-xs text-[#394B49] leading-relaxed">
                  Our initial session is 100% advisory. We do not badger you with repeated telemarketing
                  or pressure you to sign up. You take your time, review your options, and decide if our
                  transparent packages fit your plans.
                </p>
              </div>

              {/* Mandatory Regulatory Disclaimer */}
              <div className="rounded-2xl border border-[#D9A879] bg-[#FCF6EC] p-5 text-xs text-[#263331]">
                <div className="flex items-center gap-2 font-semibold text-[#263331] mb-1">
                  <ShieldAlert className="h-4 w-4 text-[#8A5A1E] shrink-0" aria-hidden="true" />
                  <span>Regulatory Notice &amp; Integrity Policy</span>
                </div>
                <p className="leading-relaxed text-[#546866]">
                  Admission and visa decisions are the sole discretion of respective university admission
                  committees and government immigration authorities. Lugie Global Consultancy does not
                  guarantee admission or visas.
                </p>
              </div>
            </FadeIn>

            {/* Right: Consultation Form */}
            <FadeIn delay={0.15} className="lg:col-span-7">
              <LeadForm
                source="consultation_form"
                title="Schedule Consultation"
                description="Provide your academic overview and preferred destination. Our counseling team will review and confirm your session."
                buttonText="Book Free Assessment"
              />
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
