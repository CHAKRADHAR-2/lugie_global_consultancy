"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { ArrowRight, Globe2 } from "lucide-react";

const DESTINATIONS = [
  {
    name: "United Kingdom",
    badge: "1-Year Master's Degrees",
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
                <Globe2 className="h-3.5 w-3.5" />
                <span>Global Horizons</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Top Study Abroad Destinations
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Compare costs, post-study work rights, typical intakes, and program structures
                across the world&apos;s leading education destinations.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="bg-[hsl(220,14%,96%)] py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {DESTINATIONS.map((dest, idx) => (
                <StaggerItem key={idx} className="flex">
                  <div className="group w-full rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[hsl(166,72%,40%)]/30">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-2xl font-bold text-[hsl(222,47%,11%)]">
                          {dest.name}
                        </h2>
                      </div>

                      <span className="inline-block rounded-full bg-[hsl(166,72%,40%)]/10 px-3 py-1 text-xs font-semibold text-[hsl(166,72%,40%)] mb-4">
                        {dest.badge}
                      </span>

                      <p className="text-xs text-[hsl(220,13%,46%)] mb-6 leading-relaxed">
                        {dest.overview}
                      </p>

                      <div className="space-y-3 border-t border-[hsl(220,13%,91%)] pt-4 text-xs text-[hsl(222,47%,20%)]">
                        <div>
                          <span className="font-semibold text-[hsl(222,47%,11%)] block">Est. Tuition Fee:</span>
                          <span className="text-[hsl(220,13%,46%)]">{dest.tuition}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[hsl(222,47%,11%)] block">Living Cost / Proof of Funds:</span>
                          <span className="text-[hsl(220,13%,46%)]">{dest.living}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[hsl(222,47%,11%)] block">Key Intake Seasons:</span>
                          <span className="text-[hsl(220,13%,46%)]">{dest.intakes}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[hsl(222,47%,11%)] block">Work Rights & Post-Study Visa:</span>
                          <span className="text-[hsl(220,13%,46%)]">{dest.workRights}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-[hsl(222,47%,11%)] block">High Demand Fields:</span>
                          <span className="text-[hsl(220,13%,46%)]">{dest.popularCourses}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[hsl(220,13%,91%)] mt-6">
                      <Link
                        href={`/book-consultation?country=${encodeURIComponent(dest.name)}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[hsl(222,47%,11%)] px-4 py-3 text-xs font-semibold text-white transition-all hover:bg-[hsl(166,72%,40%)] active:scale-[0.98]"
                      >
                        Plan Your {dest.name} Application <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
