"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { api } from "@/lib/api-client";
import {
  Building2,
  Search,
  MapPin,
  ExternalLink,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
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
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Accredited Institutions
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Explore Partner & Verified Universities
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Browse world-class universities across UK, US, Canada, Australia, Germany, and Ireland.
              All admissions criteria and course lists are sourced directly from verified university records.
            </p>
          </div>
        </section>

        {/* Filters & Directory */}
        <section className="py-12 px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Controls */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search university or city..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(174,85%,32%)] focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Filter by Country:</label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full md:w-56 py-2 px-3 text-sm rounded-lg border border-gray-200 focus:outline-none focus:border-[hsl(174,85%,32%)] focus:ring-1 focus:ring-[hsl(174,85%,32%)]"
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

          {/* Results State */}
          {loading ? (
            <div className="py-24 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[hsl(174,85%,32%)] mx-auto mb-3" />
              <p className="text-sm text-gray-500">Loading university catalog from database...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-8 text-center max-w-lg mx-auto">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-rose-900">Database Connection Notice</h3>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center max-w-lg mx-auto">
              <Building2 className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900">No Universities Found</h3>
              <p className="text-sm text-gray-500 mt-1">
                Try clearing your search query or switching country filters.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCountry("");
                }}
                className="mt-4 text-xs font-semibold text-[hsl(174,85%,32%)] hover:underline"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((uni) => {
                const countryName = countryMap.get(uni.country_id) || "International";
                return (
                  <div
                    key={uni.id}
                    className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition hover:border-gray-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]">
                          <Building2 className="h-5 w-5" />
                        </div>
                        {uni.ranking && (
                          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Rank #{uni.ranking}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-[hsl(215,50%,12%)] leading-snug mb-2">
                        {uni.name}
                      </h3>

                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{uni.city ? `${uni.city}, ` : ""}{countryName}</span>
                      </div>

                      {uni.type && (
                        <span className="inline-block text-[11px] font-medium text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded mb-4">
                          {uni.type}
                        </span>
                      )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                      {uni.website ? (
                        <a
                          href={uni.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-gray-600 hover:text-[hsl(174,85%,32%)] flex items-center gap-1 transition"
                        >
                          Official Site <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span className="text-gray-400">Website available on request</span>
                      )}

                      <Link
                        href={`/book-consultation?uni=${encodeURIComponent(uni.name)}`}
                        className="font-semibold text-[hsl(174,85%,32%)] hover:underline inline-flex items-center gap-1"
                      >
                        Apply Here <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
