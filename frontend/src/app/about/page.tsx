import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import {
  Compass,
  Award,
  ShieldCheck,
  Users2,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
} from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Learn about Lugie Global Consultancy, our mission, founders, and commitment to transparent overseas education guidance.",
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-[hsl(215,50%,12%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Our Story & Philosophy
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              About Lugie Global Consultancy
            </h1>
            <p className="mt-4 text-xl font-light italic text-white/80">
              {APP_TAGLINE}
            </p>
            <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
              We started Lugie with a straightforward conviction: Indian students deserve honest,
              uncompromised, and founder-driven overseas education guidance without fabricated claims or hidden commissions.
            </p>
          </div>
        </section>

        {/* The Founders & Lean Model */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[hsl(174,85%,32%)]">
                Who We Are
              </span>
              <h2 className="text-3xl font-bold text-[hsl(215,50%,12%)] leading-tight">
                Two Founders. One Obsession: Your Genuine Academic Fit.
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Lugie was founded by two international education specialists who spent years inside the overseas
                education industry witnessing a troubling trend: high-pressure sales centers pushing students
                into tie-up institutions purely for university commissions, while making unrealistic promises
                about guaranteed visas and admissions.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We intentionally run Lugie as a <strong>lean, focused consultancy</strong>. You aren’t handed off
                to untrained junior call-center telemarketers. When you work with Lugie, your profile is
                reviewed directly by experienced advisors who look at your long-term return on investment,
                career prospects, and financial readiness.
              </p>
              <div className="pt-2">
                <Link
                  href="/book-consultation"
                  className="inline-flex items-center gap-2 rounded-lg bg-[hsl(174,85%,32%)] px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition"
                >
                  Talk Directly With Us <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 bg-gray-50 border border-gray-100 rounded-3xl p-8 sm:p-10 space-y-8">
              <h3 className="text-xl font-bold text-[hsl(215,50%,12%)]">
                Our Non-Negotiable Pillars
              </h3>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Zero Fabricated Claims</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    We will never display fake student success percentages, fictitious testimonials, or
                    make up admission numbers to sway your decision.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Transparent Fixed Pricing</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Our service packages (Basic ₹7,999, Standard ₹13,999, Premium ₹24,999) are published
                    openly. No hidden charges or surprise invoices.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Official University Sources Only</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Every deadline, entry criterion, and fee structure we quote is verified directly against
                    official university websites and faculty catalogs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* What We Don't Do (Honest Disclosure) */}
        <section className="bg-gray-50 py-16 px-6 lg:px-8 border-y border-gray-100">
          <div className="mx-auto max-w-4xl text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
              Honest Clarification
            </span>
            <h2 className="mt-2 text-3xl font-bold text-[hsl(215,50%,12%)]">
              What We Do NOT Promise
            </h2>
            <p className="mt-3 text-gray-600">
              Clear expectations build great partnerships. Here is our ethical boundary:
            </p>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-rose-700 font-semibold mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No Guaranteed Admissions</span>
                </div>
                <p className="text-sm text-gray-600">
                  Universities make their own decisions. We strengthen your profile and narrative, but no consultancy legally controls admissions committees.
                </p>
              </div>

              <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-rose-700 font-semibold mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No Guaranteed Visas</span>
                </div>
                <p className="text-sm text-gray-600">
                  Embassies and visa officers are sovereign government bodies. We ensure meticulous documentation and mock interviews, but cannot guarantee a visa stamp.
                </p>
              </div>

              <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-rose-700 font-semibold mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>No Automatic Scholarships</span>
                </div>
                <p className="text-sm text-gray-600">
                  We discover, verify, and assist with scholarship applications; scholarships are awarded strictly on merit or financial need by funding bodies.
                </p>
              </div>

              <div className="rounded-xl border border-rose-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-rose-700 font-semibold mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Third-Party Charges Are Separate</span>
                </div>
                <p className="text-sm text-gray-600">
                  Government visa application fees, university application charges, English test fees, and SEVIS fees are paid directly to those respective authorities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Banner */}
        <section className="py-20 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-[hsl(215,50%,12%)]">
              Dream Beyond Borders with Lugie
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Ready to explore your genuine study options with honest advisors?
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/book-consultation"
                className="rounded-lg bg-[hsl(174,85%,32%)] px-8 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[hsl(174,85%,38%)] transition"
              >
                Schedule Free Profile Evaluation
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-gray-300 px-6 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                View Packages & Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
