"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { APP_NAME, PUBLIC_NAV_ITEMS } from "@/lib/constants";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[hsl(215,50%,12%)]/95 backdrop-blur supports-[backdrop-filter]:bg-[hsl(215,50%,12%)]/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            Lugie<span className="text-[hsl(174,85%,42%)]">.</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-white/80 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Auth & CTA buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-white/80 transition hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Register
          </Link>
          <Link
            href="/book-consultation"
            className="rounded-md bg-[hsl(174,85%,32%)] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[hsl(174,85%,38%)]"
          >
            Book Free Assessment
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[hsl(215,50%,12%)] px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/80 transition hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <hr className="border-white/10" />
            <div className="flex gap-3">
              <Link
                href="/login"
                className="flex-1 rounded-md border border-white/20 py-2 text-center text-sm font-medium text-white/80"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="flex-1 rounded-md border border-white/20 py-2 text-center text-sm font-semibold text-white"
                onClick={() => setMobileOpen(false)}
              >
                Register
              </Link>
            </div>
            <Link
              href="/book-consultation"
              className="rounded-md bg-[hsl(174,85%,32%)] px-4 py-2.5 text-center text-sm font-bold text-white"
              onClick={() => setMobileOpen(false)}
            >
              Book Free Assessment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
