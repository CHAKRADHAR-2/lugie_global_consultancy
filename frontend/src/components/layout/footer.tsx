import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[hsl(215,50%,10%)] text-white/70">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <span className="text-xl font-bold text-white">
              Lugie<span className="text-[hsl(174,85%,42%)]">.</span>
            </span>
            <p className="mt-2 text-sm italic text-white/50">{APP_TAGLINE}</p>
            <p className="mt-4 text-sm">
              Expert overseas education consultancy guiding students to their dream universities worldwide.
            </p>
            <div className="mt-4 space-y-1 text-xs text-white/60">
              <p>Direct Advisors: <a href="mailto:luckysomisetty17427@gmail.com" className="text-emerald-400 hover:underline">luckysomisetty17427@gmail.com</a></p>
              <p>Hotline: <a href="tel:+919392734699" className="text-emerald-400 hover:underline">+91 93927 34699</a> / <a href="tel:+918610506587" className="text-emerald-400 hover:underline">+91 86105 06587</a></p>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Company</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/about" className="text-sm hover:text-white transition">About Us</Link></li>
              <li><Link href="/services" className="text-sm hover:text-white transition">Our Services</Link></li>
              <li><Link href="/pricing" className="text-sm hover:text-white transition">Pricing & Packages</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Resources</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/destinations" className="text-sm hover:text-white transition">Study Destinations</Link></li>
              <li><Link href="/universities" className="text-sm hover:text-white transition">Universities</Link></li>
              <li><Link href="/scholarships" className="text-sm hover:text-white transition">Scholarships</Link></li>
              <li><Link href="/loans" className="text-sm hover:text-white transition">Education Loans</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li><Link href="/privacy-policy" className="text-sm hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm hover:text-white transition">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
          <p className="mt-1 text-xs text-white/40">
            Lugie is an education consultancy facilitator. We do not guarantee admission, visas, scholarships, or loans.
          </p>
        </div>
      </div>
    </footer>
  );
}
