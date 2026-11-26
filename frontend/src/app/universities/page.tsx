"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api-client";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { GlobalOrbitLoader } from "@/components/ui/loading-concepts";
import { SkeletonCard } from "@/components/ui/skeleton";
import { FeedbackBanner, StatusBadge } from "@/components/ui/feedback";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Search,
  MapPin,
  ExternalLink,
  ArrowRight,
  GraduationCap,
} from "lucide-react";

interface Country {
  id: string;
  name: string;
  code: string | null;
}

interface University {
  id: string;
  name: string;
  country_id: string;
  city: string | null;
  type: string | null;
  website: string | null;
  ranking: number | null;
  is_verified: boolean;
  is_sample_data: boolean;
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [unis, cnts] = await Promise.all([
          api.get<University[]>("universities"),
          api.get<Country[]>("countries"),
        ]);
        setUniversities(unis || []);
        setCountries(cnts || []);
      } catch (err: unknown) {
        console.error("Failed to load universities:", err);
        setError("Unable to load universities right now. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const countryMap = new Map(countries.map((c) => [c.id, c.name]));

  const filtered = universities.filter((u) => {
    const matchesCountry = !selectedCountry || u.country_id === selectedCountry;
    const matchesSearch =
      !searchTerm ||
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.city && u.city.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCountry && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-20 sm:py-24 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <GraduationCap className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Accredited Institutions</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                Explore Partner &amp; Verified Universities
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Browse world-class universities across UK, US, Canada, Australia, Germany, and Ireland.
                All admissions criteria and course lists are sourced directly from verified university records.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-12" />
        </section>

        {/* Filters & Directory */}
        <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Controls */}
          <FadeIn>
            <div className="beyond-card p-6 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <label htmlFor="uni-search" className="sr-only">
                  Search university or city
                </label>
                <Search
                  className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-[#546866]"
                  aria-hidden="true"
                />
                <input
                  id="uni-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search university or city..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 text-[#394B49] placeholder:text-[#546866]/70 focus:bg-white focus:outline-none focus:border-[#394B49] focus:ring-2 focus:ring-[#B7CBC2] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <label
                  htmlFor="uni-country"
                  className="text-xs font-semibold text-[#546866] whitespace-nowrap"
                >
                  Filter by Country:
                </label>
                <select
                  id="uni-country"
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full md:w-56 py-2.5 px-3 text-sm rounded-xl border border-[#DCE5E8] bg-[#EEF3F5]/60 text-[#394B49] focus:bg-white focus:outline-none focus:border-[#394B49] focus:ring-2 focus:ring-[#B7CBC2] transition-colors"
                >
                  <option value="">All Countries ({countries.length})</option>
                  {countries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FadeIn>

          {/* Results State */}
          {loading ? (
            <div className="space-y-8 py-6">
              <GlobalOrbitLoader label="Loading university catalog from database…" size="md" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            </div>
          ) : error ? (
            <FadeIn>
              <FeedbackBanner
                tone="error"
                title="Database Connection Notice"
                message={error}
                className="max-w-lg mx-auto"
              />
            </FadeIn>
          ) : filtered.length === 0 ? (
            <FadeIn>
              <div className="beyond-card p-12 text-center max-w-lg mx-auto">
                <Building2 className="h-10 w-10 text-[#546866] mx-auto mb-3" aria-hidden="true" />
                <h2 className="font-editorial text-2xl text-[#394B49]">No Universities Found</h2>
                <p className="text-sm text-[#546866] mt-1">
                  Try clearing your search query or switching country filters.
                </p>
                <Button
                  type="button"
                  variant="sage"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCountry("");
                  }}
                  className="mt-5"
                >
                  Reset Filters
                </Button>
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((uni) => {
                const countryName = countryMap.get(uni.country_id) || "International";
                return (
                  <StaggerItem key={uni.id} className="flex">
                    <div className="beyond-card beyond-card-interactive group w-full p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258] transition-colors group-hover:bg-[#394B49] group-hover:text-white group-hover:border-[#394B49]">
                            <Building2 className="h-5 w-5" aria-hidden="true" />
                          </div>
                          {uni.ranking && (
                            <StatusBadge tone="warm">Rank #{uni.ranking}</StatusBadge>
                          )}
                        </div>

                        <h2 className="text-lg font-semibold text-[#394B49] leading-snug mb-2">
                          {uni.name}
                        </h2>

                        <div className="flex items-center gap-2 text-xs text-[#546866] mb-4">
                          <MapPin className="h-3.5 w-3.5 text-[#8E572C] shrink-0" aria-hidden="true" />
                          <span>
                            {uni.city ? `${uni.city}, ` : ""}
                            {countryName}
                          </span>
                        </div>

                        {uni.type && (
                          <div className="mb-4">
                            <StatusBadge tone="misty">{uni.type}</StatusBadge>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[#DCE5E8] flex items-center justify-between text-xs">
                        {uni.website ? (
                          <a
                            href={uni.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[#546866] hover:text-[#394B49] flex items-center gap-1 transition-colors"
                          >
                            <span>Official Site</span>
                            <ExternalLink className="h-3 w-3" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-[#546866]/75">Website available on request</span>
                        )}

                        <Link
                          href={`/book-consultation?uni=${encodeURIComponent(uni.name)}`}
                          className="font-semibold text-[#8E572C] hover:text-[#394B49] inline-flex items-center gap-1 transition-colors"
                        >
                          <span>Apply Here</span>
                          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
