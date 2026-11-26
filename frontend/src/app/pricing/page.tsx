"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api-client";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { SkeletonCard } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { Check, ShieldAlert, ArrowRight, Sparkles } from "lucide-react";

interface Inclusion {
  id: string;
  description: string;
  category: string | null;
  limit_value: string | null;
  sort_order: number | null;
}

interface Package {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  is_recommended: boolean;
  sort_order: number | null;
  inclusions: Inclusion[];
}

interface AdditionalService {
  id: string;
  name: string;
  slug: string;
  price_min: number;
  price_max: number;
  currency: string;
  description: string | null;
}

// Fallback seed packages matching non-negotiable prices
const FALLBACK_PACKAGES: Package[] = [
  {
    id: "pkg-1",
    name: "Basic Package",
    slug: "basic",
    price: 7999,
    currency: "INR",
    is_recommended: false,
    sort_order: 1,
    inclusions: [
      { id: "inc-1", description: "Profile & Transcript Evaluation", category: "Evaluation", limit_value: "1 Candidate", sort_order: 1 },
      { id: "inc-2", description: "Targeted University Shortlisting (Up to 3 Universities)", category: "Admissions", limit_value: "3 Universities", sort_order: 2 },
      { id: "inc-3", description: "1 Master SOP Review & Editorial Feedback", category: "Documentation", limit_value: "1 Master SOP", sort_order: 3 },
      { id: "inc-4", description: "Application Portal Guidance & Portal Setup", category: "Admissions", limit_value: "Up to 3 Apps", sort_order: 4 },
      { id: "inc-5", description: "Standard Email & Portal Advisory Support", category: "Support", limit_value: "Email Support", sort_order: 5 },
    ],
  },
  {
    id: "pkg-2",
    name: "Standard Package",
    slug: "standard",
    price: 13999,
    currency: "INR",
    is_recommended: true,
    sort_order: 2,
    inclusions: [
      { id: "inc-6", description: "Full Profile Evaluation + Career Path Mapping", category: "Evaluation", limit_value: "1 Candidate", sort_order: 1 },
      { id: "inc-7", description: "Categorized Shortlisting (Up to 6 Universities: Dream, Target, Safe)", category: "Admissions", limit_value: "6 Universities", sort_order: 2 },
      { id: "inc-8", description: "Comprehensive SOP & Essay Editing (Up to 3 Custom SOPs)", category: "Documentation", limit_value: "3 Custom SOPs", sort_order: 3 },
      { id: "inc-9", description: "2 Letters of Recommendation (LOR) Drafting Framework", category: "Documentation", limit_value: "2 LORs", sort_order: 4 },
      { id: "inc-10", description: "Application Submission & Tracking across Portals", category: "Admissions", limit_value: "Up to 6 Apps", sort_order: 5 },
      { id: "inc-11", description: "Full Student Visa Filing Support & Checklist", category: "Visa", limit_value: "1 Visa Filing", sort_order: 6 },
      { id: "inc-12", description: "1-on-1 Mock Visa Interview Session", category: "Visa", limit_value: "1 Mock Interview", sort_order: 7 },
      { id: "inc-13", description: "Education Loan & Financial Documentation Guidance", category: "Finance", limit_value: "Included", sort_order: 8 },
    ],
  },
  {
    id: "pkg-3",
    name: "Premium Package",
    slug: "premium",
    price: 24999,
    currency: "INR",
    is_recommended: false,
    sort_order: 3,
    inclusions: [
      { id: "inc-14", description: "Founder-Led End-to-End Strategic Counseling", category: "Advisory", limit_value: "Direct Founder Attention", sort_order: 1 },
      { id: "inc-15", description: "Unlimited / Up to 10 University Applications", category: "Admissions", limit_value: "Up to 10 Universities", sort_order: 2 },
      { id: "inc-16", description: "Tailored SOPs, Diversity Statements & Supplemental Essays", category: "Documentation", limit_value: "All Applications", sort_order: 3 },
      { id: "inc-17", description: "Up to 3 LORs + Academic CV/Resume Formatting", category: "Documentation", limit_value: "3 LORs + Resume", sort_order: 4 },
      { id: "inc-18", description: "Full Visa Dossier Compilation + Financial Audit", category: "Visa", limit_value: "Complete Audit", sort_order: 5 },
      { id: "inc-19", description: "3 Extensive 1-on-1 Mock Visa & Credibility Interviews", category: "Visa", limit_value: "3 Mock Sessions", sort_order: 6 },
      { id: "inc-20", description: "Priority Scholarship Discovery & Motivation Letter Editing", category: "Scholarships", limit_value: "Included", sort_order: 7 },
      { id: "inc-21", description: "Accommodation Booking Support & Pre-Departure Briefing", category: "Transition", limit_value: "Full Assistance", sort_order: 8 },
      { id: "inc-22", description: "Direct WhatsApp Line with Senior Consultants", category: "Support", limit_value: "Priority Access", sort_order: 9 },
    ],
  },
];

const DEFAULT_INCLUSIONS_BY_SLUG: Record<string, Inclusion[]> = {
  basic: FALLBACK_PACKAGES[0].inclusions,
  standard: FALLBACK_PACKAGES[1].inclusions,
  premium: FALLBACK_PACKAGES[2].inclusions,
};

export default function PricingPage() {
  const [packages, setPackages] = useState<Package[]>(FALLBACK_PACKAGES);
  const [services, setServices] = useState<AdditionalService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPricing() {
      try {
        const [pkgData, srvData] = await Promise.all([
          api.get<Package[]>("packages"),
          api.get<AdditionalService[]>("packages/services"),
        ]);
        if (pkgData && pkgData.length > 0) {
          const merged = pkgData.map((pkg) => {
            const fallback = DEFAULT_INCLUSIONS_BY_SLUG[pkg.slug?.toLowerCase()] || [];
            const inclusions = pkg.inclusions && pkg.inclusions.length > 0 ? pkg.inclusions : fallback;
            return { ...pkg, inclusions };
          });
          setPackages(merged);
        }
        if (srvData && srvData.length > 0) {
          setServices(srvData);
        }
      } catch (err) {
        console.warn("Using fallback pricing data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPricing();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Transparent &amp; Non-Negotiable</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Honest Consultancy Packages
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Flat, published rates for Indian students. No hidden percentages, no surprise fees, and
                no secret university tie-up markups.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        {/* Pricing Cards */}
        <section className="bg-white py-20 sm:py-24 px-6 lg:px-8 border-b border-[#DCE5E8]">
          <div className="mx-auto max-w-7xl">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch" aria-label="Loading packages">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <SkeletonCard key={idx} className="h-[520px]" />
                ))}
              </div>
            ) : (
              <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {packages.map((pkg) => {
                  const isRec = pkg.is_recommended;
                  const inclusions =
                    pkg.inclusions && pkg.inclusions.length > 0
                      ? pkg.inclusions
                      : DEFAULT_INCLUSIONS_BY_SLUG[pkg.slug?.toLowerCase()] || [];

                  return (
                    <StaggerItem key={pkg.id} className="flex">
                      <div
                        className={`relative w-full rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 ${
                          isRec
                            ? "border-2 border-[#B7CBC2] bg-[#F3F0E8]/45 shadow-md hover:-translate-y-0.5 hover:shadow-lg"
                            : "beyond-card beyond-card-interactive"
                        }`}
                      >
                        {isRec && (
                          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#D9A879] border border-[#C49263] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[#263331] shadow-xs whitespace-nowrap">
                            Most Popular Choice
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="font-editorial text-2xl text-[#394B49]">
                              {pkg.name}
                            </h2>
                          </div>

                          <div className="mb-6 flex items-baseline gap-1.5">
                            <span className="text-4xl font-bold text-[#394B49]">
                              ₹{Number(pkg.price || 0).toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs text-[#546866] font-medium">/ complete package</span>
                          </div>

                          <p className="text-xs text-[#546866] pb-6 border-b border-[#DCE5E8]">
                            {pkg.slug === "basic" && "Ideal for self-directed students who only need shortlisting & SOP review."}
                            {pkg.slug === "standard" && "Our flagship package with full admissions, LORs, and visa mock preparation."}
                            {pkg.slug === "premium" && "Founder-led, high-touch support for top-tier global admissions & scholarships."}
                          </p>

                          <div className="pt-6 space-y-3.5 mb-8">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#546866]">
                              Package Inclusions:
                            </p>
                            {inclusions.map((inc) => (
                              <div key={inc.id || inc.description} className="flex items-start gap-2.5 text-xs text-[#394B49]">
                                <Check className="h-4 w-4 shrink-0 text-[#2F6B55] mt-0.5" aria-hidden="true" />
                                <span>{inc.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-[#DCE5E8] space-y-2.5">
                          <Link
                            href={`/student/payments?package=${pkg.slug}&enroll=true`}
                            className={buttonVariants({
                              variant: isRec ? "warm" : "primary",
                              size: "lg",
                              className: "w-full",
                            })}
                          >
                            <span>Enroll Online (Instant)</span>
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                          <Link
                            href={`/book-consultation?package=${encodeURIComponent(pkg.name)}`}
                            className={buttonVariants({
                              variant: "secondary",
                              size: "md",
                              className: "w-full text-xs",
                            })}
                          >
                            Or Book Free Consultation
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>
                  );
                })}
              </StaggerContainer>
            )}
          </div>
        </section>

        {/* Additional Services */}
        {loading ? (
          <section className="bg-[#EEF3F5]/60 py-20 px-6 lg:px-8 border-b border-[#DCE5E8]">
            <div className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <SkeletonCard key={idx} className="h-28" />
                ))}
              </div>
            </div>
          </section>
        ) : (
          services.length > 0 && (
            <section className="bg-[#EEF3F5]/60 py-20 px-6 lg:px-8 border-b border-[#DCE5E8]">
              <div className="mx-auto max-w-6xl">
                <FadeIn className="text-center mb-12">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8E572C]">
                    Modular Flexibility
                  </span>
                  <h2 className="font-editorial text-3xl sm:text-4xl text-[#394B49] mt-2">
                    Standalone Services &amp; Add-Ons
                  </h2>
                  <p className="text-sm text-[#546866] mt-2 max-w-2xl mx-auto">
                    Only need a single document reviewed or an emergency mock visa interview?
                    You can purchase individual services as needed.
                  </p>
                </FadeIn>

                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((srv) => (
                    <StaggerItem key={srv.id} className="flex">
                      <div className="beyond-card beyond-card-interactive w-full p-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#394B49]">{srv.name}</h3>
                          {srv.description && (
                            <p className="text-xs text-[#546866] mt-0.5">{srv.description}</p>
                          )}
                        </div>
                        <div className="text-right pl-4 shrink-0">
                          <span className="text-sm font-bold text-[#394B49]">
                            ₹{srv.price_min.toLocaleString("en-IN")}
                            {srv.price_max > srv.price_min ? ` – ₹${srv.price_max.toLocaleString("en-IN")}` : ""}
                          </span>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </div>
            </section>
          )
        )}

        {/* Third-Party Fee Notice */}
        <section className="py-16 px-6 lg:px-8">
          <FadeIn>
            <div className="mx-auto max-w-4xl rounded-2xl border border-[#D9A879] bg-[#FCF6EC] p-8 sm:p-10 space-y-4">
              <div className="flex items-center gap-2.5 font-semibold text-[#263331] text-base">
                <ShieldAlert className="h-5 w-5 text-[#8A5A1E] shrink-0" aria-hidden="true" />
                <span>Notice Concerning Third-Party Government &amp; University Fees</span>
              </div>
              <p className="text-xs sm:text-sm text-[#263331] leading-relaxed">
                All package fees listed above are strictly for{" "}
                <strong>Lugie Global Consultancy advisory and preparation services</strong>.
              </p>
              <p className="text-xs sm:text-sm text-[#546866] leading-relaxed font-medium">
                Third-party institutional and government fees — including university application fees,
                credential evaluation fees (e.g. WES, Uni-Assist), English proficiency exam fees (IELTS/TOEFL/PTE),
                embassy visa application fees, SEVIS fees, health surcharges (NHS/OSHC), blocked accounts, and courier costs —
                are paid directly by the student to the respective authorized authorities and are not included in our consultancy fees.
              </p>
            </div>
          </FadeIn>
        </section>
      </main>

      <Footer />
    </div>
  );
}
