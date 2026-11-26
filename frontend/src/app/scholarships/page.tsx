"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { buttonVariants } from "@/components/ui/button";
import { Award, CheckCircle2, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";

const SCHOLARSHIP_TYPES = [
  {
    title: "Government-Funded Scholarships",
    desc: "Prestigious national initiatives covering full tuition, living stipends, and travel allowance.",
    examples: ["Chevening (UK)", "Fulbright-Nehru (USA)", "DAAD (Germany)", "Australia Awards"],
  },
  {
    title: "University Merit Bursaries",
    desc: "Direct tuition fee waivers awarded automatically or via application based on stellar academic transcripts.",
    examples: ["Vice-Chancellor's Awards", "Dean's Excellence Scholarships", "Departmental Fellowships"],
  },
  {
    title: "Private Trusts & Foundations",
    desc: "Indian and international philanthropic organizations supporting meritorious students in specialized disciplines.",
    examples: ["Tata Trusts", "Inlaks Shivdasani", "KC Mahindra Education Trust", "Aga Khan Foundation"],
  },
];

export default function ScholarshipsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Funding Your Education</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                International Scholarships Guidance
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Strategic discovery, eligibility matching, and expert review of your scholarship essays
                to maximize your opportunities for tuition waivers and stipends.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        <section className="bg-white py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Types */}
            <div>
              <FadeIn className="text-center mb-12">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                  Funding Avenues
                </span>
                <h2 className="mt-3 font-editorial text-3xl sm:text-4xl text-[#394B49]">
                  Major Scholarship Categories We Assist With
                </h2>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {SCHOLARSHIP_TYPES.map((type, idx) => (
                  <StaggerItem key={idx} className="flex">
                    <div className="group w-full rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/55 p-7 flex flex-col justify-between transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:border-[#B7CBC2] hover:shadow-md">
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] mb-5 transition-colors group-hover:bg-[#394B49] group-hover:text-white group-hover:border-[#394B49]">
                          <Award className="h-5 w-5" aria-hidden="true" />
                        </div>
                        <h3 className="text-lg font-semibold text-[#394B49] mb-2">{type.title}</h3>
                        <p className="text-sm text-[#546866] mb-5 leading-relaxed">{type.desc}</p>
                      </div>

                      <div className="border-t border-[#DCE5E8] pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#546866] mb-2.5">
                          Key Examples
                        </p>
                        <ul className="space-y-1.5">
                          {type.examples.map((ex, i) => (
                            <li key={i} className="text-xs text-[#394B49] flex items-center gap-2">
                              <span className="text-[#2F6B55] font-bold">•</span>
                              <span>{ex}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>

            {/* How Lugie Helps */}
            <FadeIn>
              <div className="bg-[#EEF3F5]/65 border border-[#DCE5E8] rounded-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                    The Lugie Difference
                  </span>
                  <h2 className="font-editorial text-2xl sm:text-3xl text-[#394B49] mt-2 mb-5">
                    How We Maximize Your Scholarship Odds
                  </h2>
                  <div className="space-y-4 text-sm text-[#546866]">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <p>
                        <strong className="font-semibold text-[#394B49]">Timeline Management:</strong> Most prestigious scholarships close 8-12 months before program start. We ensure you never miss an early deadline.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <p>
                        <strong className="font-semibold text-[#394B49]">Essay Review:</strong> Scholarship committees look for leadership, community impact, and clear alignment with national development goals.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                      <p>
                        <strong className="font-semibold text-[#394B49]">Departmental Bursaries:</strong> Many universities have unadvertised lab or department bursaries which our research team tracks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="rounded-2xl border border-[#D9A879] bg-[#FCF6EC] p-6 text-xs text-[#263331] space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-[#263331] text-sm">
                    <AlertTriangle className="h-5 w-5 text-[#8A5A1E] shrink-0" aria-hidden="true" />
                    <span>Important Scholarship Disclaimer</span>
                  </div>
                  <p className="leading-relaxed text-[#546866]">
                    Scholarships are awarded solely at the discretion of respective universities, government departments, and funding bodies based on their internal merit criteria.
                  </p>
                  <p className="leading-relaxed font-medium text-[#263331]">
                    Lugie Global Consultancy assists in discovery, documentation, and essay refinement, but cannot and does not guarantee scholarship grants or monetary awards.
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
                Explore Funding Matched to Your Profile
              </h2>
              <p className="mt-4 text-[#F3F0E8]/80">
                Let us review your academic credentials and shortlist scholarships with realistic eligibility.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  <span>Evaluate Your Scholarship Eligibility</span>
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
