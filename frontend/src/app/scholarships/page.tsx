"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
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
                <Sparkles className="h-3.5 w-3.5" />
                <span>Funding Your Education</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                International Scholarships Guidance
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Strategic discovery, eligibility matching, and expert review of your scholarship essays
                to maximize your opportunities for tuition waivers and stipends.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="bg-white py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Types */}
            <div>
              <FadeIn className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                  Funding Avenues
                </span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)]">
                  Major Scholarship Categories We Assist With
                </h2>
              </FadeIn>

              <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {SCHOLARSHIP_TYPES.map((type, idx) => (
                  <StaggerItem key={idx} className="flex">
                    <div className="group w-full rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[hsl(166,72%,40%)]/30">
                      <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] mb-5">
                          <Award className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-bold text-[hsl(222,47%,11%)] mb-2">{type.title}</h3>
                        <p className="text-sm text-[hsl(220,13%,46%)] mb-5 leading-relaxed">{type.desc}</p>
                      </div>

                      <div className="border-t border-[hsl(220,13%,91%)] pt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(220,13%,46%)] mb-2.5">
                          Key Examples
                        </p>
                        <ul className="space-y-1.5">
                          {type.examples.map((ex, i) => (
                            <li key={i} className="text-xs text-[hsl(222,47%,20%)] flex items-center gap-2">
                              <span className="text-[hsl(160,84%,39%)] font-bold">•</span>
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
              <div className="bg-[hsl(220,14%,96%)] border border-[hsl(220,13%,91%)] rounded-2xl p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(166,72%,40%)]">
                    The Lugie Difference
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[hsl(222,47%,11%)] mt-2 mb-5">
                    How We Maximize Your Scholarship Odds
                  </h2>
                  <div className="space-y-4 text-sm text-[hsl(220,13%,46%)]">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-[hsl(222,47%,11%)]">Timeline Management:</strong> Most prestigious scholarships close 8-12 months before program start. We ensure you never miss an early deadline.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-[hsl(222,47%,11%)]">Essay Review:</strong> Scholarship committees look for leadership, community impact, and clear alignment with national development goals.
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
                      <p>
                        <strong className="text-[hsl(222,47%,11%)]">Departmental Bursaries:</strong> Many universities have unadvertised lab or department bursaries which our research team tracks.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="rounded-2xl border border-[hsl(45,93%,58%)]/40 bg-[hsl(45,93%,58%)]/10 p-6 text-xs text-[hsl(222,47%,20%)] space-y-3">
                  <div className="flex items-center gap-2 font-semibold text-[hsl(222,47%,11%)] text-sm">
                    <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0" />
                    <span>Important Scholarship Disclaimer</span>
                  </div>
                  <p className="leading-relaxed text-[hsl(220,13%,46%)]">
                    Scholarships are awarded solely at the discretion of respective universities, government departments, and funding bodies based on their internal merit criteria.
                  </p>
                  <p className="leading-relaxed font-medium text-[hsl(222,47%,11%)]">
                    Lugie Global Consultancy assists in discovery, documentation, and essay refinement, but cannot and does not guarantee scholarship grants or monetary awards.
                  </p>
                </div>
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn>
              <div className="text-center pt-4">
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 rounded-xl bg-[hsl(166,72%,40%)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,50%)] hover:shadow-xl active:scale-[0.98]"
                >
                  Evaluate Your Scholarship Eligibility <ArrowRight className="h-4 w-4" />
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
