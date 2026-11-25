import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Award, CheckCircle2, AlertTriangle, ArrowRight, BookOpen, DollarSign } from "lucide-react";

export const metadata = {
  title: "Scholarship Guidance",
  description: "Discover merit and need-based international scholarships for overseas education.",
};

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
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Funding Your Education
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              International Scholarships Guidance
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Strategic discovery, eligibility matching, and expert review of your scholarship essays
              to maximize your opportunities for tuition waivers and stipends.
            </p>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Types */}
            <div>
              <h2 className="text-2xl font-bold text-[hsl(215,50%,12%)] mb-8 text-center">
                Major Scholarship Categories We Assist With
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {SCHOLARSHIP_TYPES.map((type, idx) => (
                  <div key={idx} className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] mb-4">
                        <Award className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h3>
                      <p className="text-sm text-gray-600 mb-4">{type.desc}</p>
                    </div>

                    <div className="border-t border-gray-200/60 pt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key Examples</p>
                      <ul className="space-y-1">
                        {type.examples.map((ex, i) => (
                          <li key={i} className="text-xs text-gray-700 flex items-center gap-1.5">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* How Lugie Helps */}
            <div className="bg-white border border-gray-100 rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                  The Lugie Difference
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(215,50%,12%)] mt-2 mb-4">
                  How We Maximize Your Scholarship Odds
                </h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p><strong>Timeline Management:</strong> Most prestigious scholarships close 8-12 months before program start. We ensure you never miss an early deadline.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p><strong>Essay Review:</strong> Scholarship committees look for leadership, community impact, and clear alignment with national development goals.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p><strong>Departmental Bursaries:</strong> Many universities have unadvertised lab or department bursaries which our research team tracks.</p>
                  </div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 text-xs text-amber-900 space-y-3">
                <div className="flex items-center gap-2 font-semibold text-amber-950 text-sm">
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                  <span>Important Scholarship Disclaimer</span>
                </div>
                <p className="leading-relaxed">
                  Scholarships are awarded solely at the discretion of respective universities, government departments, and funding bodies based on their internal merit criteria.
                </p>
                <p className="leading-relaxed font-medium">
                  Lugie Global Consultancy assists in discovery, documentation, and essay refinement, but cannot and does not guarantee scholarship grants or monetary awards.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-8">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(174,85%,32%)] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition"
              >
                Evaluate Your Scholarship Eligibility <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
