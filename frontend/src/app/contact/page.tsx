"use client";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LeadForm } from "@/components/forms/lead-form";
import { FadeIn } from "@/components/ui/fade-in";
import { Mail, Phone, MapPin, Clock, ShieldCheck, Sparkles } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[hsl(210,20%,98%)]">
      <Header />

      <main className="flex-1">
        {/* Banner */}
        <section className="relative overflow-hidden bg-[hsl(222,47%,11%)] py-20 px-6 lg:px-8 text-center text-white">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="mesh-orb absolute top-1/4 left-1/3 h-[420px] w-[420px] rounded-full bg-[hsl(166,72%,40%)] opacity-[0.07] blur-[120px]" />
            <div className="mesh-orb-delayed absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-[hsl(45,93%,58%)] opacity-[0.05] blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-4xl">
            <FadeIn delay={0.1} direction="none">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-5 py-2 text-xs font-semibold tracking-widest uppercase text-[hsl(166,72%,50%)] mb-6 backdrop-blur-sm border border-white/[0.08]">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Get In Touch</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
                We&apos;re Here to Guide You
              </h1>
            </FadeIn>
            <FadeIn delay={0.35}>
              <p className="mt-5 text-base sm:text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
                Have questions about university eligibility, country options, or application procedures?
                Reach out directly to our founders and senior advisors.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Contact Info & Value Props */}
            <FadeIn className="lg:col-span-5 space-y-8">
              <div className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
                <h2 className="text-xl font-bold text-[hsl(222,47%,11%)] mb-6">
                  Direct Contact Channels
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(220,13%,46%)]">
                        Email Us (Direct Advisors)
                      </p>
                      <div className="mt-1 space-y-1">
                        <div>
                          <a
                            href="mailto:luckysomisetty17427@gmail.com"
                            className="text-sm font-semibold text-[hsl(222,47%,11%)] hover:text-[hsl(166,72%,40%)] transition-colors block"
                          >
                            luckysomisetty17427@gmail.com
                          </a>
                        </div>
                        <div>
                          <a
                            href="mailto:machanisiri180505@gmail.com"
                            className="text-sm font-semibold text-[hsl(222,47%,11%)] hover:text-[hsl(166,72%,40%)] transition-colors block"
                          >
                            machanisiri180505@gmail.com
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-1">Real-time alerts sent directly to senior advisors</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(220,13%,46%)]">
                        Call / WhatsApp Hotlines
                      </p>
                      <div className="mt-1 space-y-1">
                        <div>
                          <a
                            href="tel:+919392734699"
                            className="text-sm font-semibold text-[hsl(222,47%,11%)] hover:text-[hsl(166,72%,40%)] transition-colors block"
                          >
                            +91 93927 34699
                          </a>
                        </div>
                        <div>
                          <a
                            href="tel:+918610506587"
                            className="text-sm font-semibold text-[hsl(222,47%,11%)] hover:text-[hsl(166,72%,40%)] transition-colors block"
                          >
                            +91 86105 06587
                          </a>
                        </div>
                      </div>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-1">Mon – Sat, 10:00 AM – 7:00 PM IST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(220,13%,46%)]">
                        Headquarters
                      </p>
                      <p className="text-base font-semibold text-[hsl(222,47%,11%)]">
                        Lugie Global Consultancy
                      </p>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-0.5">
                        Bangalore & Hyderabad, India (Virtual counseling pan-India & globally)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(166,72%,40%)]/10 text-[hsl(166,72%,40%)]">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[hsl(220,13%,46%)]">
                        Consulting Hours
                      </p>
                      <p className="text-sm font-medium text-[hsl(222,47%,11%)]">
                        Monday – Saturday: 10:00 AM – 7:00 PM
                      </p>
                      <p className="text-xs text-[hsl(220,13%,46%)] mt-0.5">Sunday by prior appointment</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lugie Promise Card */}
              <div className="rounded-2xl border border-[hsl(160,84%,39%)]/25 bg-[hsl(160,84%,39%)]/5 p-6">
                <div className="flex items-center gap-3 text-[hsl(222,47%,11%)] font-semibold mb-2">
                  <ShieldCheck className="h-5 w-5 text-[hsl(160,84%,39%)]" />
                  <span>The Lugie Transparency Commitment</span>
                </div>
                <ul className="text-xs text-[hsl(222,47%,20%)] space-y-2 mt-3">
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(160,84%,39%)] font-bold">•</span>
                    <span>No fake admission guarantees or exaggerated visa success numbers.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(160,84%,39%)] font-bold">•</span>
                    <span>Fixed, transparent pricing with no hidden commissions or surprises.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[hsl(160,84%,39%)] font-bold">•</span>
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
