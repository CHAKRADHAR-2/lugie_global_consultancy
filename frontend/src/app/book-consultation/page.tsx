import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadForm } from "@/components/forms/lead-form";
import { CheckCircle2, Calendar, UserCheck, ShieldAlert, FileText } from "lucide-react";

export const metadata = {
  title: "Book Free Consultation",
  description: "Schedule your 1-on-1 personalized study abroad profile assessment with Lugie founders.",
};

export default function BookConsultationPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="bg-[hsl(215,50%,12%)] py-16 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Personalized Guidance
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Book Your Free Profile Assessment
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Get an honest, data-backed assessment of your academic profile, target universities, and
              visa feasibility directly from experienced counsellors.
            </p>
          </div>
        </section>

        {/* Form and Benefits */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: What to Expect */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[hsl(215,50%,12%)] mb-4">
                  What Happens in Your Session?
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] font-bold text-xs mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Transcript & Score Evaluation</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        We review your GPA, backlogs (if any), English proficiency scores (IELTS/TOEFL/PTE), and standardized tests.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] font-bold text-xs mt-0.5">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Country & Budget Matching</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        We compare tuition, cost of living, post-study work visa policies, and part-time work regulations across your target countries.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] font-bold text-xs mt-0.5">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Dream / Reach / Safe University List</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        A realistic categorization so you maximize admission probability without sacrificing your aspirations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)] font-bold text-xs mt-0.5">
                      4
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Timeline & Document Roadmap</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Clear milestones for SOP drafting, recommendation letters, intake deadlines, and visa filing windows.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Founder-Led Callout */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-6 text-sm text-blue-950">
                <div className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                  <UserCheck className="h-5 w-5 text-blue-600" />
                  <span>No Sales Pressure Guarantee</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Our initial session is 100% advisory. We do not badger you with repeated telemarketing
                  or pressure you to sign up. You take your time, review your options, and decide if our
                  transparent packages fit your plans.
                </p>
              </div>

              {/* Mandatory Regulatory Disclaimer */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-semibold text-amber-950 mb-1">
                  <ShieldAlert className="h-4 w-4 text-amber-700" />
                  <span>Regulatory Notice & Integrity Policy</span>
                </div>
                <p className="leading-relaxed">
                  Admission and visa decisions are the sole discretion of respective university admission
                  committees and government immigration authorities. Lugie Global Consultancy does not
                  guarantee admission or visas.
                </p>
              </div>
            </div>

            {/* Right: Consultation Form */}
            <div className="lg:col-span-7">
              <LeadForm
                source="consultation_form"
                title="Schedule Consultation"
                description="Provide your academic overview and preferred destination. Our counseling team will review and confirm your session."
                buttonText="Book Free Assessment"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
