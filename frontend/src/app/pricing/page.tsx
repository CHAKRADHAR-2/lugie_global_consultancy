"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api-client";
import { Check, ShieldAlert, Sparkles, HelpCircle, ArrowRight, Loader2 } from "lucide-react";

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
            const inclusions = (pkg.inclusions && pkg.inclusions.length > 0) ? pkg.inclusions : fallback;
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
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Transparent & Non-Negotiable
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Honest Consultancy Packages
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Flat, published rates for Indian students. No hidden percentages, no surprise fees, and
              no secret university tie-up markups.
            </p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {packages.map((pkg) => {
                const isRec = pkg.is_recommended;
                return (
                  <div
                    key={pkg.id}
                    className={`relative rounded-3xl p-8 flex flex-col justify-between transition ${
                      isRec
                        ? "border-2 border-[hsl(174,85%,32%)] bg-white shadow-xl ring-4 ring-[hsl(174,85%,32%)]/10"
                        : "border border-gray-200 bg-white shadow-sm hover:shadow-md"
                    }`}
                  >
                    {isRec && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(174,85%,32%)] px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                        Most Popular Choice
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-[hsl(215,50%,12%)]">
                          {pkg.name}
                        </h2>
                      </div>

                      <div className="mb-6 flex items-baseline gap-1">
                        <span className="text-4xl font-extrabold text-[hsl(215,50%,12%)]">
                          ₹{pkg.price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">/ complete package</span>
                      </div>

                      <p className="text-xs text-gray-500 pb-6 border-b border-gray-100">
                        {pkg.slug === "basic" && "Ideal for self-directed students who only need shortlisting & SOP review."}
                        {pkg.slug === "standard" && "Our flagship package with full admissions, LORs, and visa mock preparation."}
                        {pkg.slug === "premium" && "Founder-led, high-touch support for top-tier global admissions & scholarships."}
                      </p>

                      {(() => {
                        const inclusions = (pkg.inclusions && pkg.inclusions.length > 0)
                          ? pkg.inclusions
                          : (DEFAULT_INCLUSIONS_BY_SLUG[pkg.slug?.toLowerCase()] || []);
                        return (
                          <div className="pt-6 space-y-3.5 mb-8">
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                              Package Inclusions:
                            </p>
                            {inclusions.map((inc) => (
                              <div key={inc.id || inc.description} className="flex items-start gap-2.5 text-xs text-gray-700">
                                <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                                <span>{inc.description}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <Link
                        href={`/student/payments?package=${pkg.slug}&enroll=true`}
                        className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                          isRec
                            ? "bg-[hsl(174,85%,32%)] text-white hover:bg-[hsl(174,85%,38%)] shadow-md"
                            : "bg-[hsl(215,50%,12%)] text-white hover:bg-[hsl(215,50%,18%)]"
                        }`}
                      >
                        Enroll Online (Instant) <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/book-consultation?package=${encodeURIComponent(pkg.name)}`}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 transition"
                      >
                        Or Book Free Consultation
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Additional Services */}
        {services.length > 0 && (
          <section className="bg-gray-50 py-20 px-6 lg:px-8 border-t border-gray-100">
            <div className="mx-auto max-w-6xl">
              <div className="text-center mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                  Modular Flexibility
                </span>
                <h2 className="text-3xl font-bold text-[hsl(215,50%,12%)] mt-2">
                  Standalone Services & Add-Ons
                </h2>
                <p className="text-sm text-gray-600 mt-2 max-w-2xl mx-auto">
                  Only need a single document reviewed or an emergency mock visa interview?
                  You can purchase individual services as needed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="rounded-2xl border border-gray-200 bg-white p-5 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-[hsl(215,50%,12%)]">{srv.name}</h4>
                      {srv.description && (
                        <p className="text-xs text-gray-500 mt-0.5">{srv.description}</p>
                      )}
                    </div>
                    <div className="text-right pl-4 shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        ₹{srv.price_min.toLocaleString("en-IN")}
                        {srv.price_max > srv.price_min ? ` – ₹${srv.price_max.toLocaleString("en-IN")}` : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Third-Party Fee Notice */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-4xl rounded-3xl border border-amber-200 bg-amber-50/70 p-8 sm:p-10 space-y-4">
            <div className="flex items-center gap-2 font-bold text-amber-950 text-base">
              <ShieldAlert className="h-5 w-5 text-amber-700" />
              <span>Notice Concerning Third-Party Government & University Fees</span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              All package fees listed above are strictly for <strong>Lugie Global Consultancy advisory and preparation services</strong>.
            </p>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
              Third-party institutional and government fees — including university application fees,
              credential evaluation fees (e.g. WES, Uni-Assist), English proficiency exam fees (IELTS/TOEFL/PTE),
              embassy visa application fees, SEVIS fees, health surcharges (NHS/OSHC), blocked accounts, and courier costs —
              are paid directly by the student to the respective authorized authorities and are not included in our consultancy fees.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
