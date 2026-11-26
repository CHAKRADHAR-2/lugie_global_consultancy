"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { StatusBadge } from "@/components/ui/feedback";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Globe2 } from "lucide-react";

const DESTINATIONS = [
  {
    name: "United Kingdom",
    badge: "1-Year Master's Degrees",
    tint: "border-t-[#394B49]",
    overview:
      "World-class Russell Group universities, intensive 1-year postgraduate programs, and a 2-year Graduate Route post-study work visa.",
    tuition: "£14,000 – £28,000 / year",
    living: "£9,207 – £12,006 / year",
    intakes: "September (Major), January (Secondary)",
    workRights: "20 hrs/week during term, 2-year Graduate Route visa",
    popularCourses: "Computer Science, Data Analytics, MBA, Finance, Law",
  },
  {
    name: "United States",
    badge: "STEM OPT (Up to 3 Years)",
    tint: "border-t-[#D9A879]",
    overview:
      "Global benchmark for research innovation, massive alumni networks, and 3-year post-study work authorization for STEM-designated programs.",
    tuition: "$22,000 – $55,000 / year",
    living: "$12,000 – $18,000 / year",
    intakes: "Fall (August), Spring (January)",
    workRights: "20 hrs/week on-campus, 1 to 3 years OPT",
    popularCourses: "AI & ML, Computer Science, Biotechnology, Business Analytics, Mechanical",
  },
  {
    name: "Germany",
    badge: "Low / Zero Tuition at Public Unis",
    tint: "border-t-[#B7CBC2]",
    overview:
      "Engineering powerhouse of Europe. Most public universities charge nominal administrative fees (~€250-€350/semester) even for international students.",
    tuition: "€0 – €3,000 / year (Public Unis)",
    living: "€11,208 / year (Blocked Account)",
    intakes: "Winter (October), Summer (April)",
    workRights: "140 full days or 280 half days/year, 18-month job search visa",
    popularCourses: "Automotive, Electrical, Mechanical, Renewable Energy, Computer Science",
  },
  {
    name: "Canada",
    badge: "Post-Graduation Work Permit (PGWP)",
    tint: "border-t-[#8E572C]",
    overview:
      "Welcoming, multicultural society with high standard of living, practical co-op work terms, and high-quality publicly funded institutions.",
    tuition: "CAD $18,000 – $38,000 / year",
    living: "CAD $20,635 / year (Cost of Living)",
    intakes: "Fall (September), Winter (January), Spring (May)",
    workRights: "20-24 hrs/week during term, up to 3 years PGWP",
    popularCourses: "Cloud Computing, Project Management, Healthcare, Supply Chain, Business",
  },
  {
    name: "Australia",
    badge: "High Minimum Wages & Quality of Life",
    tint: "border-t-[#394B49]",
    overview:
      "Renowned Group of Eight (Go8) research universities, laid-back coastal lifestyle, strong student protections, and regional visa incentives.",
    tuition: "AUD $25,000 – $45,000 / year",
    living: "AUD $24,505 / year (Govt standard)",
    intakes: "Semester 1 (February), Semester 2 (July)",
    workRights: "48 hrs per fortnight, 2 to 4 years post-study work rights",
    popularCourses: "IT, Data Science, Public Health, Nursing, Mining Engineering, Architecture",
  },
  {
    name: "Ireland",
    badge: "Silicon Valley of Europe",
    tint: "border-t-[#B7CBC2]",
    overview:
      "European headquarters for Google, Meta, Apple, Pfizer, and Stripe. English-speaking, progressive nation offering 2-year third-level graduate scheme.",
    tuition: "€11,000 – €24,000 / year",
    living: "€10,000 – €14,000 / year",
    intakes: "September (Major), January (Selected)",
    workRights: "20 hrs/week during term, 2-year Post-Study Work Visa",
    popularCourses: "Software Engineering, Cloud Computing, Pharmaceutical Science, FinTech",
  },
];

export default function DestinationsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Globe2 className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Global Horizons</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Top Study Abroad Destinations
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Compare costs, post-study work rights, typical intakes, and program structures
                across the world&apos;s leading education destinations.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        <section className="bg-[#EEF3F5]/60 py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-7xl">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {DESTINATIONS.map((dest, idx) => (
                <StaggerItem key={idx} className="flex">
                  <div
                    className={`beyond-card beyond-card-interactive group w-full border-t-4 ${dest.tint} p-7 flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="font-editorial text-2xl text-[#394B49]">
                          {dest.name}
                        </h2>
                      </div>

                      <div className="mb-4">
                        <StatusBadge tone="sage">{dest.badge}</StatusBadge>
                      </div>

                      <p className="text-xs text-[#546866] mb-6 leading-relaxed">
                        {dest.overview}
                      </p>

                      <div className="space-y-3 border-t border-[#DCE5E8] pt-4 text-xs">
                        <div>
                          <span className="font-semibold text-[#394B49] block">Est. Tuition Fee:</span>
                          <span className="text-[#546866]">{dest.tuition}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#394B49] block">Living Cost / Proof of Funds:</span>
                          <span className="text-[#546866]">{dest.living}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#394B49] block">Key Intake Seasons:</span>
                          <span className="text-[#546866]">{dest.intakes}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#394B49] block">Work Rights &amp; Post-Study Visa:</span>
                          <span className="text-[#546866]">{dest.workRights}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[#394B49] block">High Demand Fields:</span>
                          <span className="text-[#546866]">{dest.popularCourses}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#DCE5E8] mt-6">
                      <Link
                        href={`/book-consultation?country=${encodeURIComponent(dest.name)}`}
                        className={buttonVariants({ variant: "primary", size: "md", className: "w-full" })}
                      >
                        <span>Plan Your {dest.name} Application</span>
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Bottom Editorial CTA */}
        <section className="bg-[#394B49] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <span className="inline-block rounded-full border border-[#B7CBC2]/30 bg-white/10 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#E5BE99] mb-4">
                Compare Universities
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                Not Sure Which Country Fits Your Profile Best?
              </h2>
            </FadeIn>
            <FadeIn delay={0.12}>
              <p className="mt-4 text-[#F3F0E8]/80 leading-relaxed">
                Explore our verified university catalog or speak directly with an advisor to map tuition, scholarships, and post-study options.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  <span>Book Free Profile Assessment</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/universities"
                  className="rounded-xl border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Browse Universities
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
