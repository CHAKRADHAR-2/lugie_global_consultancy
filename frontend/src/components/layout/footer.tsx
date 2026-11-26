"use client";

import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";
import { ArrowUp, Mail, Phone } from "lucide-react";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#394B49] text-[#F3F0E8]/85 border-t border-[#263331]">
      {/* Subtle Horizon accent hairline */}
      <div
        className="h-1 w-full bg-gradient-to-r from-[#B7CBC2] via-[#D9A879] to-[#DCE5E8]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-10 lg:px-8">
        <StaggerContainer className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <StaggerItem>
            <div>
              <Link href="/" className="inline-flex items-baseline gap-1.5">
                <span className="font-editorial text-2xl text-white">LUGIE</span>
                <span className="inline-block h-2 w-2 rounded-full bg-[#D9A879]" aria-hidden="true" />
              </Link>
              <p className="mt-1.5 font-editorial italic text-base text-[#E5BE99]">
                {APP_TAGLINE}.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-[#F3F0E8]/75">
                Honest, founder-led overseas education consultancy guiding students toward global classrooms with clarity.
              </p>
              <div className="mt-5 space-y-2.5">
                <a
                  href="mailto:luckysomisetty17427@gmail.com"
                  className="flex items-center gap-2 text-xs text-[#F3F0E8]/80 transition-colors hover:text-[#E5BE99]"
                >
                  <Mail className="h-3.5 w-3.5 text-[#B7CBC2]" aria-hidden="true" />
                  luckysomisetty17427@gmail.com
                </a>
                <a
                  href="tel:+919392734699"
                  className="flex items-center gap-2 text-xs text-[#F3F0E8]/80 transition-colors hover:text-[#E5BE99]"
                >
                  <Phone className="h-3.5 w-3.5 text-[#B7CBC2]" aria-hidden="true" />
                  +91 93927 34699 / +91 86105 06587
                </a>
              </div>
            </div>
          </StaggerItem>

          {/* Company Links */}
          <StaggerItem>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7CBC2]">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Our Services", href: "/services" },
                  { label: "Pricing & Packages", href: "/pricing" },
                  { label: "Book Assessment", href: "/book-consultation" },
                  { label: "Contact", href: "/contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F3F0E8]/80 transition-colors hover:text-white hover:underline underline-offset-4 decoration-[#D9A879]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Student Resources */}
          <StaggerItem>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7CBC2]">
                Student Resources
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Study Destinations", href: "/destinations" },
                  { label: "Universities", href: "/universities" },
                  { label: "Scholarships", href: "/scholarships" },
                  { label: "Education Loans", href: "/loans" },
                  { label: "Visa Assistance", href: "/visa-assistance" },
                  { label: "Accommodation", href: "/accommodation" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F3F0E8]/80 transition-colors hover:text-white hover:underline underline-offset-4 decoration-[#D9A879]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Legal & Ethics */}
          <StaggerItem>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-[#B7CBC2]">
                Governance & Legal
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms & Conditions", href: "/terms" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#F3F0E8]/80 transition-colors hover:text-white hover:underline underline-offset-4 decoration-[#D9A879]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-white/10 bg-[#263331]/40 p-4 text-xs leading-relaxed text-[#F3F0E8]/75">
                Transparent advisory only. Zero hidden university markups or guaranteed visa claims.
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Bottom Legal Bar */}
        <FadeIn delay={0.15}>
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/15 pt-8 sm:flex-row">
            <p className="text-xs text-[#F3F0E8]/70">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="text-[11px] text-[#F3F0E8]/65 max-w-md text-center sm:text-right">
              Lugie is an education consultancy facilitator. Admissions committees and embassies retain sole final decision authority.
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#263331]/40 text-[#F3F0E8]/80 transition-all hover:border-[#D9A879] hover:text-[#E5BE99] cursor-pointer"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            </button>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
