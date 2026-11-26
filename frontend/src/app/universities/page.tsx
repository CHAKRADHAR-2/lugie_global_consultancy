"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api-client";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import {
  Building2,
  Search,
  MapPin,
  ExternalLink,
  AlertCircle,
  Loader2,
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
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-24 px-6 lg:px-8 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-[hsl(166,72%,40%)] opacity-[0.07] blur-[120px]" />
            <div className="mesh-orb-delayed absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[hsl(45,93%,58%)] opacity-[0.05] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <FadeIn delay={0.1} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 text-xs font-semibold tracking-widest uppercase text-[hsl(166,72%,50%)] mb-6 backdrop-blur-sm border border-white/[0.08]">
                <GraduationCap className="h-3.5 w-3.5" />
                <span>Accredited Institutions</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                Explore Partner & Verified Universities
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Browse world-class universities across UK, US, Canada, Australia, Germany, and Ireland.
                All admissions criteria and course lists are sourced directly from verified university records.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Filters & Directory */}
        <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Controls */}
          <FadeIn>
            <div className="bg-white p-6 rounded-2xl border border-[hsl(220,13%,91%)] shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-[hsl(220,13%,46%)]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search university or city..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] text-[hsl(222,47%,11%)] focus:outline-none focus:border-[hsl(166,72%,40%)] focus:ring-1 focus:ring-[hsl(166,72%,40%)] transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <label className="text-xs font-semibold text-[hsl(220,13%,46%)] whitespace-nowrap">
                  Filter by Country:
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full md:w-56 py-2.5 px-3 text-sm rounded-xl border border-[hsl(220,13%,91%)] bg-[hsl(210,20%,98%)] text-[hsl(222,47%,11%)] focus:outline-none focus:border-[hsl(166,72%,40%)] focus:ring-1 focus:ring-[hsl(166,72%,40%)] transition-colors"
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
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(166,72%,40%)] mx-auto mb-3" />
              <p className="text-sm text-[hsl(220,13%,46%)]">Loading university catalog from database...</p>
            </div>
          ) : error ? (
            <FadeIn>
              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center max-w-lg mx-auto">
                <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-rose-900">Database Connection Notice</h3>
                <p className="text-xs text-rose-700 mt-1">{error}</p>
              </div>
            </FadeIn>
          ) : filtered.length === 0 ? (
            <FadeIn>
              <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-12 text-center max-w-lg mx-auto">
                <Building2 className="h-10 w-10 text-[hsl(220,13%,46%)] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[hsl(222,47%,11%)]">No Universities Found</h3>
                <p className="text-sm text-[hsl(220,13%,46%)] mt-1">
                  Try clearing your search query or switching country filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCountry("");
                  }}
                  className="mt-4 text-xs font-semibold text-[hsl(166,72%,40%)] hover:text-[hsl(166,72%,50%)] hover:underline"
                >
                  Reset Filters
                </button>
              </div>
            </FadeIn>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((uni) => {
                const countryName = countryMap.get(uni.country_id) || "International";
                return (
                  <StaggerItem key={uni.id} className="flex">
                    <div className="group w-full rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:border-[hsl(166,72%,40%)]/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
                            <Building2 className="h-5 w-5" />
                          </div>
                          {uni.ranking && (
                            <span className="text-xs font-bold text-amber-700 bg-[hsl(45,93%,58%)]/15 px-3 py-1 rounded-full border border-[hsl(45,93%,58%)]/30">
                              Rank #{uni.ranking}
                            </span>
                          )}
                        </div>

                        <h3 className="text-lg font-bold text-[hsl(222,47%,11%)] leading-snug mb-2">
                          {uni.name}
                        </h3>

                        <div className="flex items-center gap-2 text-xs text-[hsl(220,13%,46%)] mb-4">
                          <MapPin className="h-3.5 w-3.5 text-[hsl(166,72%,40%)] shrink-0" />
                          <span>{uni.city ? `${uni.city}, ` : ""}{countryName}</span>
                        </div>

                        {uni.type && (
                          <span className="inline-block text-[11px] font-medium text-[hsl(220,13%,46%)] bg-[hsl(220,14%,96%)] px-2.5 py-1 rounded-lg mb-4">
                            {uni.type}
                          </span>
                        )}
                      </div>

                      <div className="pt-4 border-t border-[hsl(220,13%,91%)] flex items-center justify-between text-xs">
                        {uni.website ? (
                          <a
                            href={uni.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-[hsl(220,13%,46%)] hover:text-[hsl(166,72%,40%)] flex items-center gap-1 transition-colors"
                          >
                            Official Site <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[hsl(220,13%,46%)]/70">Website available on request</span>
                        )}

                        <Link
                          href={`/book-consultation?uni=${encodeURIComponent(uni.name)}`}
                          className="font-semibold text-[hsl(166,72%,40%)] hover:text-[hsl(166,72%,50%)] inline-flex items-center gap-1 transition-colors"
                        >
                          Apply Here <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
