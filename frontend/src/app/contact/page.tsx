import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadForm } from "@/components/forms/lead-form";
import { Mail, Phone, MapPin, Clock, ShieldCheck, HeartHandshake } from "lucide-react";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Lugie Global Consultancy for overseas education counseling.",
};

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="bg-[hsl(215,50%,12%)] py-16 px-6 lg:px-8 text-center text-white">
          <div className="mx-auto max-w-4xl">
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(174,85%,42%)]">
              Get In Touch
            </span>
            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              We&apos;re Here to Guide You
            </h1>
            <p className="mt-4 text-lg text-white/70 max-w-2xl mx-auto">
              Have questions about university eligibility, country options, or application procedures?
              Reach out directly to our founders and senior advisors.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Contact Info & Value Props */}
            <div className="lg:col-span-5 space-y-8">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="text-xl font-bold text-[hsl(215,50%,12%)] mb-6">
                  Direct Contact Channels
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Email Us (Direct Advisors)
                      </p>
                      <div className="mt-1 space-y-1">
                        <div>
                          <a
                            href="mailto:luckysomisetty17427@gmail.com"
                            className="text-sm font-semibold text-[hsl(215,50%,12%)] hover:text-[hsl(174,85%,32%)] transition block"
                          >
                            luckysomisetty17427@gmail.com
                          </a>
                        </div>
                        <div>
                          <a
                            href="mailto:machanisiri180505@gmail.com"
                            className="text-sm font-semibold text-[hsl(215,50%,12%)] hover:text-[hsl(174,85%,32%)] transition block"
                          >
                            machanisiri180505@gmail.com
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Real-time alerts sent directly to senior advisors</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Call / WhatsApp Hotlines
                      </p>
                      <div className="mt-1 space-y-1">
                        <div>
                          <a
                            href="tel:+919392734699"
                            className="text-sm font-semibold text-[hsl(215,50%,12%)] hover:text-[hsl(174,85%,32%)] transition block"
                          >
                            +91 93927 34699
                          </a>
                        </div>
                        <div>
                          <a
                            href="tel:+918610506587"
                            className="text-sm font-semibold text-[hsl(215,50%,12%)] hover:text-[hsl(174,85%,32%)] transition block"
                          >
                            +91 86105 06587
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Headquarters
                      </p>
                      <p className="text-base font-semibold text-[hsl(215,50%,12%)]">
                        Lugie Global Consultancy
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Bangalore & Hyderabad, India (Virtual counseling pan-India & globally)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(174,85%,32%)]/10 text-[hsl(174,85%,32%)]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Consulting Hours
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        Monday – Saturday: 10:00 AM – 7:00 PM
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Sunday by prior appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lugie Promise Card */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-6">
                <div className="flex items-center gap-3 text-emerald-800 font-semibold mb-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <span>The Lugie Transparency Commitment</span>
                </div>
                <ul className="text-xs text-emerald-950 space-y-2 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>No fake admission guarantees or exaggerated visa success numbers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Fixed, transparent pricing with no hidden commissions or surprises.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>Direct founder-guided attention from experienced academic advisors.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column: Lead Form */}
            <div className="lg:col-span-7">
              <LeadForm
                source="website_contact"
                title="Send Us an Enquiry"
                description="Share your profile details and goals. We will analyze your options and reach out."
                buttonText="Send Enquiry"
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
