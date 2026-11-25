import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Home, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, MapPin, Building } from "lucide-react";

export const metadata = {
  title: "Student Accommodation Assistance",
  description: "Find safe, student-friendly, and verified accommodation near your university abroad.",
};

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
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Living Abroad
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Student Accommodation Support
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Secure a safe, comfortable, and verified place to stay before you arrive at your destination.
              We guide you through tenancy agreements, deposits, and location scouting.
            </p>
          </div>
        </section>

        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl space-y-16">
            {/* Housing Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {HOUSING_OPTIONS.map((opt, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] mb-4">
                      <Building className="h-5 w-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[hsl(215,50%,12%)] mb-2">{opt.title}</h3>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">{opt.desc}</p>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Key Advantages</p>
                    <ul className="space-y-1.5">
                      {opt.perks.map((p, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Safety Tips */}
            <div className="rounded-3xl border border-blue-100 bg-blue-50/60 p-8 sm:p-10 space-y-4">
              <h3 className="text-xl font-bold text-blue-950">
                Safety First: Avoiding Housing Scams Abroad
              </h3>
              <p className="text-sm text-blue-900 leading-relaxed">
                International students often fall prey to unverified online rental listings, wire fraud,
                or unauthorized subleases. Lugie advisors help verify tenancy contracts, check landlord accreditation
                (such as Unipol in the UK or Tenancy Deposit Schemes), and ensure your tenancy agreement meets local legal standards.
              </p>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center gap-2 rounded-lg bg-[hsl(174,85%,32%)] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition"
              >
                Discuss Housing Options With a Counsellor <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
