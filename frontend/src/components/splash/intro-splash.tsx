"use client";

import React, { useEffect, useState, useCallback, Component, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BEYOND_COLORS,
  BEYOND_EASE,
  BEYOND_SERVICES_LIST,
  SPLASH_STORAGE_KEY,
} from "@/lib/design-tokens";
import { getAccessToken, getRefreshToken } from "@/lib/auth-tokens";
import { useAuth } from "@/hooks/use-auth";
import {
  Compass,
  Globe2,
  FileCheck2,
  PenTool,
  Award,
  Landmark,
  Stamp,
  Home,
  ArrowRight,
} from "lucide-react";

const SERVICE_ICONS = [
  Compass,
  Globe2,
  FileCheck2,
  PenTool,
  Award,
  Landmark,
  Stamp,
  Home,
];

class SplashErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("lugie-intro-active");
    }
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function IntroSplashContent() {
  const pathname = usePathname();
  const { user } = useAuth();
  const prefersReduced = useReducedMotion();

  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase] = useState(0);
  const [initialized, setInitialized] = useState(false);

  const finishIntro = useCallback(() => {
    try {
      window.localStorage.setItem(SPLASH_STORAGE_KEY, "true");
    } catch {
      // Ignore private browsing quota errors
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("lugie-intro-active");
    }
    setExiting(true);
    window.setTimeout(() => {
      setVisible(false);
    }, prefersReduced ? 180 : 750);
  }, [prefersReduced]);

  const handleSkip = useCallback(() => {
    try {
      window.localStorage.setItem(SPLASH_STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("lugie-intro-active");
    }
    setExiting(true);
    window.setTimeout(() => {
      setVisible(false);
    }, 180);
  }, []);

  // Determine eligibility once on client mount
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    if (typeof document !== "undefined") {
      document.documentElement.classList.remove("lugie-intro-active");
    }

    const isHomePage = pathname === "/" || pathname === "";
    if (!isHomePage) return;

    // Never replay for authenticated users or stored sessions
    if (user || getAccessToken() || getRefreshToken()) {
      return;
    }

    try {
      if (window.localStorage.getItem(SPLASH_STORAGE_KEY) === "true") {
        return;
      }
    } catch {
      // If storage is blocked, proceed safely once per load
    }

    // Respect prefers-reduced-motion with an immediate/short fade transition
    const reduced =
      prefersReduced ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    if (reduced) {
      setVisible(true);
      setPhase(6);
      const t = window.setTimeout(() => {
        finishIntro();
      }, 350);
      return () => window.clearTimeout(t);
    }

    setVisible(true);
    setPhase(1);
  }, [initialized, pathname, user, prefersReduced, finishIntro]);

  // Dismiss immediately if user navigates away from home or signs in
  useEffect(() => {
    if (!visible) return;
    if ((pathname !== "/" && pathname !== "") || user) {
      try {
        window.localStorage.setItem(SPLASH_STORAGE_KEY, "true");
      } catch {
        // Ignore
      }
      setVisible(false);
    }
  }, [pathname, user, visible]);

  // 9.5-second choreographed editorial sequence
  useEffect(() => {
    if (!visible || prefersReduced) return;

    const timers = [
      window.setTimeout(() => setPhase(2), 1400), // GLOBAL CONSULTANCY
      window.setTimeout(() => setPhase(3), 2400), // Dream Beyond Borders.
      window.setTimeout(() => setPhase(4), 3500), // Horizon Path visual motif
      window.setTimeout(() => setPhase(5), 4500), // 8 Services along the Horizon Path
      window.setTimeout(() => setPhase(6), 8300), // Settle & prepare seamless transition
      window.setTimeout(() => finishIntro(), 8900), // Cross-dissolve into preloaded homepage (~9.65s total)
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [visible, prefersReduced, finishIntro]);

  // Keyboard Escape skip support
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleSkip();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [visible, handleSkip]);

  if (!visible) return null;

  const letters = ["L", "U", "G", "I", "E"];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          id="lugie-beyond-splash"
          role="dialog"
          aria-modal="true"
          aria-label="Lugie Global Consultancy introduction"
          className="fixed inset-0 z-[100] flex flex-col justify-between overflow-hidden bg-[#F3F0E8] text-[#394B49] px-6 py-8 sm:px-10 sm:py-10"
          initial={{ opacity: 1 }}
          animate={{ opacity: exiting ? 0 : 1 }}
          transition={{ duration: exiting ? (prefersReduced ? 0.18 : 0.75) : 0.2, ease: BEYOND_EASE.editorial }}
        >
          {/* Quiet warm horizon tint — matches real homepage background */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 25%, rgba(183,203,194,0.22) 0%, rgba(220,229,232,0.14) 45%, rgba(243,240,232,0) 80%)",
            }}
            aria-hidden="true"
          />

          {/* Top Bar: Step Progress + Accessible Skip */}
          <div className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-block h-2 w-2 rounded-full bg-[#D9A879]" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#546866]">
                The Beyond Experience
              </span>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              className="group inline-flex items-center gap-1.5 rounded-full border border-[#DCE5E8] bg-white px-4 py-1.5 text-xs font-semibold text-[#394B49] shadow-2xs transition hover:border-[#B7CBC2] hover:bg-[#EAE5D9] focus-visible:outline-2 focus-visible:outline-[#394B49] cursor-pointer"
              aria-label="Skip introduction and view homepage"
            >
              <span>Skip</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#8E572C] transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Center Editorial Stage */}
          <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-4">
            {/* Step 1, 2, 3: Brand Mark, Name, Tagline — glides smoothly upward when Phase 4 begins */}
            <motion.div
              className="flex flex-col items-center text-center"
              animate={
                phase >= 4 && !prefersReduced
                  ? { y: -12, scale: 0.92 }
                  : { y: 0, scale: 1 }
              }
              transition={{ duration: 0.8, ease: BEYOND_EASE.editorial }}
            >
              {/* 1. LUGIE Brand Mark */}
              <div className="flex items-baseline justify-center gap-1 sm:gap-2">
                {letters.map((char, idx) => (
                  <motion.span
                    key={char}
                    className="font-editorial text-5xl sm:text-7xl tracking-tight text-[#394B49] select-none"
                    initial={prefersReduced ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: prefersReduced ? 0 : idx * 0.14 + 0.1,
                      duration: 0.65,
                      ease: BEYOND_EASE.editorial,
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
                <motion.span
                  className="ml-1 inline-block h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-[#D9A879]"
                  initial={prefersReduced ? false : { scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: prefersReduced ? 0 : 0.9,
                    duration: 0.45,
                    ease: BEYOND_EASE.editorial,
                  }}
                  aria-hidden="true"
                />
              </div>

              {/* 2. GLOBAL CONSULTANCY */}
              <motion.div
                className="mt-3 flex flex-col items-center"
                initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                animate={phase >= 2 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.7, ease: BEYOND_EASE.editorial }}
              >
                <div className="flex items-center gap-3">
                  <motion.span
                    className="h-[1px] bg-[#B7CBC2]"
                    initial={{ width: 0 }}
                    animate={phase >= 2 ? { width: 32 } : { width: 0 }}
                    transition={{ duration: 0.6, ease: BEYOND_EASE.editorial }}
                  />
                  <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.34em] text-[#546866]">
                    Global Consultancy
                  </span>
                  <motion.span
                    className="h-[1px] bg-[#B7CBC2]"
                    initial={{ width: 0 }}
                    animate={phase >= 2 ? { width: 32 } : { width: 0 }}
                    transition={{ duration: 0.6, ease: BEYOND_EASE.editorial }}
                  />
                </div>
              </motion.div>

              {/* 3. Tagline: Dream Beyond Borders. */}
              <motion.p
                className="mt-4 font-editorial italic text-2xl sm:text-3xl text-[#8E572C]"
                initial={prefersReduced ? false : { opacity: 0, y: 10 }}
                animate={phase >= 3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                transition={{ duration: 0.75, ease: BEYOND_EASE.editorial }}
              >
                Dream Beyond Borders.
              </motion.p>
            </motion.div>

            {/* Step 4: The Horizon Path Visual Motif */}
            <motion.div
              className="mt-4 w-full max-w-3xl"
              initial={{ opacity: 0 }}
              animate={phase >= 4 ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <svg
                viewBox="0 0 800 58"
                fill="none"
                aria-hidden="true"
                className="w-full h-auto"
              >
                <path
                  d="M 24 44 C 220 52, 540 16, 776 14"
                  stroke={BEYOND_COLORS.mistyBlue}
                  strokeWidth="1.5"
                  strokeDasharray="4 5"
                />
                <motion.path
                  d="M 24 38 C 190 12, 340 48, 490 26 C 610 10, 700 22, 776 14"
                  stroke="url(#splashHorizonGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={phase >= 4 ? { pathLength: 1 } : { pathLength: 0 }}
                  transition={{ duration: 1.0, ease: BEYOND_EASE.editorial }}
                />
                <motion.circle
                  cx="24"
                  cy="38"
                  r="4.5"
                  fill={BEYOND_COLORS.forestSlate}
                  initial={{ scale: 0 }}
                  animate={phase >= 4 ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.15 }}
                />
                <motion.circle
                  cx="402"
                  cy="35"
                  r="4"
                  fill={BEYOND_COLORS.horizonSage}
                  initial={{ scale: 0 }}
                  animate={phase >= 4 ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.5 }}
                />
                <motion.circle
                  cx="776"
                  cy="14"
                  r="5"
                  fill={BEYOND_COLORS.softTerracotta}
                  initial={{ scale: 0 }}
                  animate={phase >= 4 ? { scale: 1 } : { scale: 0 }}
                  transition={{ delay: 0.85 }}
                />
                <defs>
                  <linearGradient id="splashHorizonGrad" x1="24" y1="38" x2="776" y2="14" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor={BEYOND_COLORS.forestSlate} />
                    <stop offset="55%" stopColor={BEYOND_COLORS.horizonSage} />
                    <stop offset="100%" stopColor={BEYOND_COLORS.softTerracotta} />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* Step 5: All 8 Core Services Along the Horizon Path */}
            <AnimatePresence>
              {phase >= 5 && (
                <motion.div
                  className="mt-4 w-full max-w-4xl"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{
                    opacity: phase >= 6 ? 0.35 : 1,
                    y: phase >= 6 ? -6 : 0,
                  }}
                  transition={{ duration: 0.65, ease: BEYOND_EASE.editorial }}
                >
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                    {BEYOND_SERVICES_LIST.map((srv, idx) => {
                      const IconComp = SERVICE_ICONS[idx % SERVICE_ICONS.length];
                      return (
                        <motion.div
                          key={srv.id}
                          className="flex items-center gap-2.5 rounded-xl border border-[#DCE5E8] bg-white px-3.5 py-2.5 shadow-[0_1px_2px_rgba(57,75,73,0.04)]"
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: idx * 0.32,
                            duration: 0.45,
                            ease: BEYOND_EASE.editorial,
                          }}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E6EFEA] text-[#3F6258]">
                            <IconComp className="h-3.5 w-3.5" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-[#8E572C]">
                              {srv.step}
                            </span>
                            <p className="text-[11px] font-semibold leading-snug text-[#394B49]">
                              {srv.shortTitle}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Horizon Timeline Meter */}
          <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center gap-2">
            <div className="h-1 w-full overflow-hidden rounded-full bg-[#DCE5E8]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#394B49] via-[#B7CBC2] to-[#D9A879]"
                initial={{ width: "0%" }}
                animate={{ width: prefersReduced ? "100%" : "100%" }}
                transition={{
                  duration: prefersReduced ? 0.2 : 8.9,
                  ease: "linear",
                }}
              />
            </div>
            <p className="text-[11px] font-medium text-[#546866]">
              Preparing your clarity-first study abroad journey…
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function IntroSplash() {
  return (
    <SplashErrorBoundary>
      <IntroSplashContent />
    </SplashErrorBoundary>
  );
}
