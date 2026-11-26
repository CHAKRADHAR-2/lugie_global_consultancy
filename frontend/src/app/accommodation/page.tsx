"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { buttonVariants } from "@/components/ui/button";
import { Home, CheckCircle2, ArrowRight, Building, ShieldCheck } from "lucide-react";

const HOUSING_OPTIONS = [
  {
    title: "University Halls of Residence (On-Campus)",
    desc: "Managed directly by the university. Ideal for first-year undergraduate and postgraduate students seeking an immersive campus community.",
    perks: [
      "All bills included (heat, water, high-speed internet)",
      "24/7 campus security and resident wardens",
      "Walking distance to lecture theatres and libraries",
    ],
  },
  {
    title: "Purpose-Built Student Accommodation (PBSA)",
    desc: "Modern private student apartments equipped with gyms, study lounges, cinema rooms, and organized social events.",
    perks: [
      "Individual ensuite rooms or private studios",
      "Flexible tenancy lengths matching semester dates",
      "Reputable global student housing operators",
    ],
  },
  {
    title: "Private Shared Apartments / Homestays",
    desc: "Renting a house or flat with fellow students or staying with a local host family for cultural immersion.",
    perks: [
      "Cost-effective for groups of friends",
      "Living in local residential neighborhoods",
      "Cooking independence and spacious living areas",
    ],
  },
];

export default function AccommodationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Home className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Living Abroad</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Student Accommodation Support
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Secure a safe, comfortable, and verified place to stay before you arrive at your destination.
                We guide you through tenancy agreements, deposits, and location scouting.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        <section className="bg-white py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Housing Options */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOUSING_OPTIONS.map((opt, idx) => (
                <StaggerItem key={idx} className="flex">
                  <div className="group w-full rounded-2xl border border-[#DCE5E8] bg-[#F3F0E8]/55 p-7 flex flex-col justify-between transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:border-[#B7CBC2] hover:shadow-md">
                    <div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] mb-5 transition-colors group-hover:bg-[#394B49] group-hover:text-white group-hover:border-[#394B49]">
                        <Building className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <h2 className="text-lg font-semibold text-[#394B49] mb-2">{opt.title}</h2>
                      <p className="text-xs text-[#546866] mb-5 leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="border-t border-[#DCE5E8] pt-4">
                      <p className="text-xs font-semibold text-[#546866] uppercase tracking-wider mb-2.5">
                        Key Advantages
                      </p>
                      <ul className="space-y-2">
                        {opt.perks.map((p, i) => (
                          <li key={i} className="text-xs text-[#394B49] flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[#2F6B55] shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Safety Tips */}
            <FadeIn>
              <div className="rounded-2xl border border-[#B7CBC2] bg-[#EDF5F1] p-8 sm:p-10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[#2F6B55] shrink-0" aria-hidden="true" />
                  <h2 className="font-editorial text-2xl text-[#263331]">
                    Safety First: Avoiding Housing Scams Abroad
                  </h2>
                </div>
                <p className="text-sm text-[#394B49] leading-relaxed">
                  International students often fall prey to unverified online rental listings, wire fraud,
                  or unauthorized subleases. Lugie advisors help verify tenancy contracts, check landlord accreditation
                  (such as Unipol in the UK or Tenancy Deposit Schemes), and ensure your tenancy agreement meets local legal standards.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Bottom Editorial CTA */}
        <section className="bg-[#394B49] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-3xl">
            <FadeIn>
              <h2 className="font-editorial text-3xl sm:text-4xl text-white">
                Arrive With Your Housing Sorted
              </h2>
              <p className="mt-4 text-[#F3F0E8]/80">
                Discuss campus residence deadlines, neighborhood safety, and rental budgets before you book flights.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/book-consultation"
                  className={buttonVariants({ variant: "warm", size: "lg" })}
                >
                  <span>Discuss Housing Options With a Counsellor</span>
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
