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
    <footer className="relative bg-[hsl(222,47%,8%)] text-white/70 overflow-hidden">
      {/* Decorative gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 h-64 w-64 rounded-full bg-[hsl(166,72%,40%)] opacity-[0.03] blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-[hsl(45,93%,58%)] opacity-[0.03] blur-[60px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8">
        <StaggerContainer className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <StaggerItem>
            <div>
              <span className="text-2xl font-black tracking-tight text-white">
                LUGIE
                <span className="inline-block h-2 w-2 rounded-full bg-[hsl(166,72%,40%)] ml-1 align-middle" />
              </span>
              <p className="mt-2 text-sm font-light italic text-[hsl(45,93%,68%)]">{APP_TAGLINE}</p>
              <p className="mt-4 text-sm leading-relaxed">
                Expert overseas education consultancy guiding students to their dream universities worldwide.
              </p>
              <div className="mt-5 space-y-2">
                <a
                  href="mailto:luckysomisetty17427@gmail.com"
                  className="flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-[hsl(166,72%,50%)]"
                >
                  <Mail className="h-3.5 w-3.5" />
                  luckysomisetty17427@gmail.com
                </a>
                <a
                  href="tel:+919392734699"
                  className="flex items-center gap-2 text-xs text-white/50 transition-colors hover:text-[hsl(166,72%,50%)]"
                >
                  <Phone className="h-3.5 w-3.5" />
                  +91 93927 34699 / +91 86105 06587
                </a>
              </div>
            </div>
          </StaggerItem>

          {/* Company */}
          <StaggerItem>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">
                Company
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "About Us", href: "/about" },
                  { label: "Our Services", href: "/services" },
                  { label: "Pricing & Packages", href: "/pricing" },
                  { label: "Contact", href: "/contact" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Resources */}
          <StaggerItem>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">
                Resources
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Study Destinations", href: "/destinations" },
                  { label: "Universities", href: "/universities" },
                  { label: "Scholarships", href: "/scholarships" },
                  { label: "Education Loans", href: "/loans" },
                  { label: "Visa Assistance", href: "/visa-assistance" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>

          {/* Legal */}
          <StaggerItem>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-white/90">
                Legal
              </h3>
              <ul className="mt-4 space-y-3">
                {[
                  { label: "Privacy Policy", href: "/privacy-policy" },
                  { label: "Terms & Conditions", href: "/terms" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Bottom bar */}
        <FadeIn delay={0.3}>
          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
            </p>
            <p className="text-[10px] text-white/30 max-w-md text-center sm:text-right">
              Lugie is an education consultancy facilitator. We do not guarantee admission, visas, scholarships, or loans.
            </p>
            <button
              onClick={scrollToTop}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-[hsl(166,72%,40%)] hover:text-[hsl(166,72%,40%)] hover:bg-[hsl(166,72%,40%)]/10"
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
