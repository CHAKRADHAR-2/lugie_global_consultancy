"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadForm } from "@/components/forms/lead-form";
import { FadeIn } from "@/components/ui/fade-in";
import { UserCheck, ShieldAlert, Sparkles } from "lucide-react";

export default function BookConsultationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-[hsl(166,72%,40%)] opacity-[0.07] blur-[120px]" />
            <div className="mesh-orb-delayed absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[hsl(45,93%,58%)] opacity-[0.05] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <FadeIn delay={0.1} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 text-xs font-semibold tracking-widest uppercase text-[hsl(166,72%,50%)] mb-6 backdrop-blur-sm border border-white/[0.08]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Personalized Guidance</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Book Your Free Profile Assessment
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Get an honest, data-backed assessment of your academic profile, target universities, and
                visa feasibility directly from experienced counsellors.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Form and Benefits */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: What to Expect */}
            <FadeIn className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
                <h2 className="text-xl font-bold text-[hsl(222,47%,11%)] mb-6">
                  What Happens in Your Session?
                </h2>
                <div className="space-y-5">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] font-bold text-xs mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)]">Transcript & Score Evaluation</h3>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-1 leading-relaxed">
                        We review your GPA, backlogs (if any), English proficiency scores (IELTS/TOEFL/PTE), and standardized tests.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] font-bold text-xs mt-0.5">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)]">Country & Budget Matching</h3>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-1 leading-relaxed">
                        We compare tuition, cost of living, post-study work visa policies, and part-time work regulations across your target countries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] font-bold text-xs mt-0.5">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)]">Dream / Reach / Safe University List</h3>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-1 leading-relaxed">
                        A realistic categorization so you maximize admission probability without sacrificing your aspirations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] font-bold text-xs mt-0.5">
                      4
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[hsl(222,47%,11%)]">Timeline & Document Roadmap</h3>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-1 leading-relaxed">
                        Clear milestones for SOP drafting, recommendation letters, intake deadlines, and visa filing windows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder-Led Callout */}
              <div className="rounded-2xl border border-[hsl(166,72%,40%)]/25 bg-[hsl(166,72%,40%)]/5 p-6 text-sm text-[hsl(222,47%,11%)]">
                <div className="flex items-center gap-2 font-semibold text-[hsl(222,47%,11%)] mb-2">
                  <UserCheck className="h-5 w-5 text-[hsl(166,72%,40%)]" />
                  <span>No Sales Pressure Guarantee</span>
                </div>
                <p className="text-xs text-[hsl(220,13%,46%)] leading-relaxed">
                  Our initial session is 100% advisory. We do not badger you with repeated telemarketing
                  or pressure you to sign up. You take your time, review your options, and decide if our
                  transparent packages fit your plans.
                </p>
              </div>

              {/* Mandatory Regulatory Disclaimer */}
              <div className="rounded-2xl border border-[hsl(45,93%,58%)]/40 bg-[hsl(45,93%,58%)]/10 p-5 text-xs text-[hsl(222,47%,20%)]">
                <div className="flex items-center gap-2 font-semibold text-[hsl(222,47%,11%)] mb-1">
                  <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>Regulatory Notice & Integrity Policy</span>
                </div>
                <p className="leading-relaxed text-[hsl(220,13%,46%)]">
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
