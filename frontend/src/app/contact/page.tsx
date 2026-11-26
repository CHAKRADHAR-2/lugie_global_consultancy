"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadForm } from "@/components/forms/lead-form";
import { FadeIn } from "@/components/ui/fade-in";
import { HorizonPath } from "@/components/ui/horizon-path";
import { Mail, Phone, MapPin, Clock, ShieldCheck, Sparkles } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F3F0E8] text-[#394B49]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="beyond-surface border-b border-[#DCE5E8] py-16 sm:py-20 px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-4xl">
            <FadeIn delay={0.05} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B7CBC2] bg-[#E6EFEA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#3F6258] mb-6">
                <Sparkles className="h-3.5 w-3.5 text-[#8E572C]" aria-hidden="true" />
                <span>Get In Touch</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.12}>
              <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl leading-[1.1] text-[#394B49]">
                We&apos;re Here to Guide You
              </h1>
            </FadeIn>
            <FadeIn delay={0.22}>
              <p className="mt-5 text-base sm:text-lg text-[#546866] max-w-2xl mx-auto leading-relaxed">
                Have questions about university eligibility, country options, or application procedures?
                Reach out directly to our founders and senior advisors.
              </p>
            </FadeIn>
          </div>
          <HorizonPath variant="divider" className="mt-10" />
        </section>

        {/* Content */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Contact Info & Value Props */}
            <FadeIn className="lg:col-span-5 space-y-8">
              <div className="beyond-card p-8">
                <h2 className="font-editorial text-2xl text-[#394B49] mb-6">
                  Direct Contact Channels
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258]">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#546866]">
                        Email Us (Direct Advisors)
                      </p>
                      <div className="mt-1 space-y-1">
                        <div>
                          <a
                            href="mailto:luckysomisetty17427@gmail.com"
                            className="text-sm font-semibold text-[#394B49] hover:text-[#8E572C] transition-colors block"
                          >
                            luckysomisetty17427@gmail.com
                          </a>
                        </div>
                        <div>
                          <a
                            href="mailto:machanisiri180505@gmail.com"
                            className="text-sm font-semibold text-[#394B49] hover:text-[#8E572C] transition-colors block"
                          >
                            machanisiri180505@gmail.com
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-[#546866] mt-1">Real-time alerts sent directly to senior advisors</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258]">
                      <Phone className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#546866]">
                        Call / WhatsApp Hotlines
                      </p>
                      <div className="mt-1 space-y-1">
                        <div>
                          <a
                            href="tel:+919392734699"
                            className="text-sm font-semibold text-[#394B49] hover:text-[#8E572C] transition-colors block"
                          >
                            +91 93927 34699
                          </a>
                        </div>
                        <div>
                          <a
                            href="tel:+918610506587"
                            className="text-sm font-semibold text-[#394B49] hover:text-[#8E572C] transition-colors block"
                          >
                            +91 86105 06587
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-[#546866] mt-1">Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258]">
                      <MapPin className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#546866]">
                        Headquarters
                      </p>
                      <p className="text-base font-semibold text-[#394B49]">
                        Lugie Global Consultancy
                      </p>
                      <p className="text-xs text-[#546866] mt-0.5">
                        Bangalore &amp; Hyderabad, India (Virtual counseling pan-India &amp; globally)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] text-[#3F6258]">
                      <Clock className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#546866]">
                        Consulting Hours
                      </p>
                      <p className="text-sm font-medium text-[#394B49]">
                        Monday – Saturday: 10:00 AM – 7:00 PM
                      </p>
                      <p className="text-xs text-[#546866] mt-0.5">Sunday by prior appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lugie Promise Card */}
              <div className="rounded-2xl border border-[#B7CBC2] bg-[#EDF5F1] p-6">
                <div className="flex items-center gap-3 text-[#263331] font-semibold mb-2">
                  <ShieldCheck className="h-5 w-5 text-[#2F6B55]" aria-hidden="true" />
                  <span>The Lugie Transparency Commitment</span>
                </div>
                <ul className="text-xs text-[#394B49] space-y-2 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[#2F6B55] font-bold">•</span>
                    <span>No fake admission guarantees or exaggerated visa success numbers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2F6B55] font-bold">•</span>
                    <span>Fixed, transparent pricing with no hidden commissions or surprises.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#2F6B55] font-bold">•</span>
                    <span>Direct founder-guided attention from experienced academic advisors.</span>
                  </li>
                </ul>
              </div>
            </FadeIn>

            {/* Right Column: Lead Form */}
            <FadeIn delay={0.15} className="lg:col-span-7">
              <LeadForm
                source="website_contact"
                title="Send Us an Enquiry"
                description="Share your profile details and goals. We will analyze your options and reach out."
                buttonText="Send Enquiry"
              />
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
