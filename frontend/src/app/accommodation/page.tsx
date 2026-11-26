"use client";

import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { Home, CheckCircle2, ArrowRight, Building, ShieldCheck } from "lucide-react";

const HOUSING_OPTIONS = [
  {
    title: "University Halls of Residence (On-Campus)",
    desc: "Managed directly by the university. Ideal for first-year undergraduate and postgraduate students seeking an immersive campus community.",
    perks: ["All bills included (heat, water, high-speed internet)", "24/7 campus security and resident wardens", "Walking distance to lecture theatres and libraries"],
  },
  {
    title: "Purpose-Built Student Accommodation (PBSA)",
    desc: "Modern private student apartments equipped with gyms, study lounges, cinema rooms, and organized social events.",
    perks: ["Individual ensuite rooms or private studios", "Flexible tenancy lengths matching semester dates", "Reputable global student housing operators"],
  },
  {
    title: "Private Shared Apartments / Homestays",
    desc: "Renting a house or flat with fellow students or staying with a local host family for cultural immersion.",
    perks: ["Cost-effective for groups of friends", "Living in local residential neighborhoods", "Cooking independence and spacious living areas"],
  },
];

export default function AccommodationPage() {
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
                <Home className="h-3.5 w-3.5" />
                <span>Living Abroad</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Student Accommodation Support
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Secure a safe, comfortable, and verified place to stay before you arrive at your destination.
                We guide you through tenancy agreements, deposits, and location scouting.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="bg-white py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Housing Options */}
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOUSING_OPTIONS.map((opt, idx) => (
                <StaggerItem key={idx} className="flex">
                  <div className="w-full rounded-2xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[hsl(166,72%,40%)]/30">
                    <div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)] mb-5">
                        <Building className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-[hsl(222,47%,11%)] mb-2">{opt.title}</h3>
                      <p className="text-xs text-[hsl(220,13%,46%)] mb-5 leading-relaxed">{opt.desc}</p>
                    </div>

                    <div className="border-t border-[hsl(220,13%,91%)] pt-4">
                      <p className="text-xs font-semibold text-[hsl(220,13%,46%)] uppercase tracking-wider mb-2.5">
                        Key Advantages
                      </p>
                      <ul className="space-y-2">
                        {opt.perks.map((p, i) => (
                          <li key={i} className="text-xs text-[hsl(222,47%,20%)] flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[hsl(160,84%,39%)] shrink-0 mt-0.5" />
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
              <div className="rounded-2xl border border-[hsl(166,72%,40%)]/25 bg-[hsl(166,72%,40%)]/5 p-8 sm:p-10 space-y-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[hsl(166,72%,40%)] shrink-0" />
                  <h3 className="text-xl font-bold text-[hsl(222,47%,11%)]">
                    Safety First: Avoiding Housing Scams Abroad
                  </h3>
                </div>
                <p className="text-sm text-[hsl(220,13%,46%)] leading-relaxed">
                  International students often fall prey to unverified online rental listings, wire fraud,
                  or unauthorized subleases. Lugie advisors help verify tenancy contracts, check landlord accreditation
                  (such as Unipol in the UK or Tenancy Deposit Schemes), and ensure your tenancy agreement meets local legal standards.
                </p>
              </div>
            </FadeIn>

            {/* CTA */}
            <FadeIn>
              <div className="text-center pt-4">
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 rounded-xl bg-[hsl(166,72%,40%)] px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-[hsl(166,72%,40%)]/20 transition-all hover:bg-[hsl(166,72%,50%)] hover:shadow-xl active:scale-[0.98]"
                >
                  Discuss Housing Options With a Counsellor <ArrowRight className="h-4 w-4" />
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
