"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { PUBLIC_NAV_ITEMS } from "@/lib/constants";
import { BEYOND_EASE } from "@/lib/design-tokens";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

function getPortalDashboardHref(roles: string[] = []): string {
  if (roles.includes("super_admin") || roles.includes("admin")) {
    return "/admin/dashboard";
  }
  if (roles.includes("counsellor")) {
    return "/counsellor/dashboard";
  }
  return "/student/dashboard";
}

function getPortalLabel(roles: string[] = []): string {
  if (roles.includes("super_admin") || roles.includes("admin")) {
    return "Admin Portal";
  }
  if (roles.includes("counsellor")) {
    return "Counsellor Portal";
  }
  return "Student Portal";
}

export function Header() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const { user, loading: authLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  const dashboardHref = user ? getPortalDashboardHref(user.roles) : "/student/dashboard";
  const portalLabel = user ? getPortalLabel(user.roles) : "Portal";
  const displayFirstName = user?.first_name?.trim() || "Account";
  const initialLetter = displayFirstName[0]?.toUpperCase() || "L";

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "border-[#DCE5E8] bg-[#F3F0E8]/95 backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(57,75,73,0.12)]"
            : "border-[#DCE5E8]/80 bg-[#F3F0E8]"
        }`}
      >
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        >
          {/* Editorial Brand Mark */}
          <Link
            href="/"
            className="group flex items-baseline gap-1.5 rounded-lg py-0.5 focus-visible:outline-2 focus-visible:outline-[#394B49]"
          >
            <span className="font-editorial text-2xl tracking-tight text-[#394B49]">
              LUGIE
            </span>
            <span
              className="inline-block h-2 w-2 rounded-full bg-[#D9A879] transition-transform duration-300 group-hover:scale-125"
              aria-hidden="true"
            />
            <span className="hidden sm:inline-block lg:hidden xl:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#546866]">
              Global Consultancy
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden items-center gap-1 lg:flex">
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative px-3.5 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isActive
                      ? "text-[#263331] font-semibold"
                      : "text-[#546866] hover:text-[#394B49]"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-[#B7CBC2] transition-all duration-300 ${
                      isActive ? "w-2/3 bg-[#D9A879]" : "w-0 group-hover:w-2/3"
                    }`}
                  />
                </Link>
              );
            })}
          </div>

          {/* Auth & CTA */}
          <div className="hidden items-center gap-2.5 lg:flex">
            {authLoading ? (
              <div
                aria-hidden="true"
                className="skeleton-shimmer h-9 w-36 rounded-xl border border-[#DCE5E8]"
              />
            ) : user ? (
              <>
                <Link
                  href={dashboardHref}
                  title={`Open ${portalLabel}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-[#B7CBC2] bg-[#E6EFEA] px-3 py-1.5 text-xs font-semibold text-[#263331] shadow-2xs transition hover:bg-[#B7CBC2]/55 focus-visible:outline-2 focus-visible:outline-[#394B49]"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#394B49] text-[11px] font-bold text-white">
                    {initialLetter}
                  </span>
                  <span className="max-w-[120px] truncate">{displayFirstName}</span>
                  <LayoutDashboard className="h-3.5 w-3.5 text-[#3F6258]" aria-hidden="true" />
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Sign out"
                  title="Sign out"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                    className: "px-2.5 text-[#546866] hover:text-[#A63A3A]",
                  })}
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className={buttonVariants({ variant: "secondary", size: "sm" })}
                >
                  Register
                </Link>
              </>
            )}

            <Link
              href="/book-consultation"
              className={buttonVariants({ variant: "warm", size: "sm" })}
            >
              Book Free Assessment
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            className="relative z-50 rounded-xl border border-[#DCE5E8] bg-white p-2 text-[#394B49] shadow-xs transition hover:bg-[#EAE5D9] lg:hidden cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              className="absolute inset-0 bg-[#263331]/35 backdrop-blur-[2px]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-0 h-full w-[300px] border-l border-[#DCE5E8] bg-[#F3F0E8] shadow-2xl overflow-y-auto"
              initial={prefersReduced ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={prefersReduced ? { duration: 0.1 } : { duration: 0.3, ease: BEYOND_EASE.editorial }}
            >
              <div className="flex flex-col gap-1 px-6 pt-20 pb-8">
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#546866]">
                  Explore Lugie
                </p>
                {PUBLIC_NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[#E6EFEA] border border-[#B7CBC2] text-[#263331] font-semibold"
                          : "text-[#394B49] hover:bg-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <hr className="my-4 border-[#DCE5E8]" />

                <div className="flex flex-col gap-2.5">
                  {authLoading ? (
                    <div
                      aria-hidden="true"
                      className="skeleton-shimmer h-10 w-full rounded-xl border border-[#DCE5E8]"
                    />
                  ) : user ? (
                    <>
                      <div className="flex items-center gap-3 rounded-2xl border border-[#B7CBC2] bg-[#E6EFEA] px-3.5 py-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#394B49] text-xs font-bold text-white">
                          {initialLetter}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#263331]">
                            {displayFirstName}
                          </p>
                          <p className="truncate text-[11px] text-[#3F6258]">{portalLabel}</p>
                        </div>
                      </div>
                      <Link
                        href={dashboardHref}
                        className={buttonVariants({ variant: "primary", size: "md", className: "w-full" })}
                        onClick={() => setMobileOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                        <span>Go to {portalLabel}</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileOpen(false);
                          logout();
                        }}
                        className={buttonVariants({
                          variant: "secondary",
                          size: "md",
                          className: "w-full text-[#A63A3A]",
                        })}
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        <span>Sign out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className={buttonVariants({ variant: "secondary", size: "md", className: "w-full" })}
                        onClick={() => setMobileOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link
                        href="/register"
                        className={buttonVariants({ variant: "primary", size: "md", className: "w-full" })}
                        onClick={() => setMobileOpen(false)}
                      >
                        Create Student Account
                      </Link>
                    </>
                  )}
                  <Link
                    href="/book-consultation"
                    className={buttonVariants({ variant: "warm", size: "md", className: "w-full" })}
                    onClick={() => setMobileOpen(false)}
                  >
                    Book Free Assessment
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
