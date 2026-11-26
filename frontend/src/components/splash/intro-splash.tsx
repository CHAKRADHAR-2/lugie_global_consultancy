"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  FileCheck2,
  Plane,
  Shield,
  BookOpen,
  Globe2,
} from "lucide-react";

const STORAGE_KEY = "lugie_splash_seen";

/* ───── Sparkle Particle ───── */
function Sparkle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)`,
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.6, 1, 0],
        scale: [0, 1.2, 0.8, 1, 0],
      }}
      transition={{
        delay,
        duration: 2.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 1,
        ease: "easeInOut",
      }}
    />
  );
}

/* ───── Gold Glitter Particle ───── */
function GoldGlitter({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 3,
        height: 3,
        background: "hsl(45, 93%, 58%)",
        borderRadius: "50%",
        boxShadow: "0 0 6px 2px hsla(45, 93%, 58%, 0.6), 0 0 12px 4px hsla(45, 93%, 58%, 0.3)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 1, 0.4, 1, 0],
        scale: [0, 1.5, 0.6, 1.2, 0],
        y: [0, -20, -10, -30],
      }}
      transition={{
        delay,
        duration: 2,
        repeat: Infinity,
        repeatDelay: Math.random() * 4 + 2,
        ease: "easeOut",
      }}
    />
  );
}

/* ───── Teal Glitter ───── */
function TealGlitter({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 2,
        height: 2,
        background: "hsl(166, 72%, 50%)",
        borderRadius: "50%",
        boxShadow: "0 0 8px 3px hsla(166, 72%, 50%, 0.5), 0 0 16px 6px hsla(166, 72%, 50%, 0.2)",
      }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0.3, 0.9, 0],
        scale: [0, 1, 0.5, 1.3, 0],
        y: [0, -15, -5, -25],
      }}
      transition={{
        delay,
        duration: 2.2,
        repeat: Infinity,
        repeatDelay: Math.random() * 3 + 1.5,
        ease: "easeOut",
      }}
    />
  );
}

/* ═══════════════════════════════════════════ */
/*           MAIN SPLASH COMPONENT            */
/* ═══════════════════════════════════════════ */

export function IntroSplash() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0);

  // Generate random particle positions (stable across renders)
  const sparkles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 4,
      })),
    []
  );

  const goldGlitters = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5 + 1,
      })),
    []
  );

  const tealGlitters = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 5 + 0.5,
      })),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (seen || prefersReduced) {
      setShow(false);
      return;
    }

    setShow(true);

    // Phase timeline (10 seconds total)
    const timers = [
      setTimeout(() => setPhase(1), 400),    // 0.4s — Letters start
      setTimeout(() => setPhase(2), 2200),    // 2.2s — "GLOBAL CONSULTANCY"
      setTimeout(() => setPhase(3), 3200),    // 3.2s — Tagline "Dream Beyond Borders"
      setTimeout(() => setPhase(4), 4200),    // 4.2s — Service showcase
      setTimeout(() => setPhase(5), 6500),    // 6.5s — Destination ring
      setTimeout(() => setPhase(6), 8200),    // 8.2s — Stats flash
      setTimeout(() => setPhase(7), 9400),    // 9.4s — Begin exit
      setTimeout(() => {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, "true");
      }, 10200),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSkip = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!show) return null;

  const letters = "LUGIE".split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* ── Deep Background ── */}
          <div className="absolute inset-0 bg-[hsl(222,47%,6%)]" />

          {/* ── Animated Gradient Orbs ── */}
          <motion.div
            className="absolute top-1/3 left-1/3 h-[600px] w-[600px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(166, 72%, 40%, 0.12) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, 80, -60, 30, 0],
              y: [0, -60, 40, -20, 0],
              scale: [1, 1.3, 0.8, 1.1, 1],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(45, 93%, 58%, 0.08) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, -50, 70, -30, 0],
              y: [0, 50, -30, 60, 0],
              scale: [1, 0.9, 1.2, 0.95, 1],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsla(199, 89%, 48%, 0.06) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.4, 0.9, 1.2, 1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Sparkle Particles ── */}
          <div className="absolute inset-0 pointer-events-none">
            {sparkles.map((s) => (
              <Sparkle key={s.id} delay={s.delay} x={s.x} y={s.y} size={s.size} />
            ))}
            {phase >= 3 &&
              goldGlitters.map((g) => (
                <GoldGlitter key={`g${g.id}`} delay={g.delay} x={g.x} y={g.y} />
              ))}
            {phase >= 4 &&
              tealGlitters.map((t) => (
                <TealGlitter key={`t${t.id}`} delay={t.delay} x={t.x} y={t.y} />
              ))}
          </div>

          {/* ── Horizontal Light Sweep ── */}
          {phase >= 1 && (
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 h-[2px] pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent 0%, hsla(166, 72%, 50%, 0.6) 50%, transparent 100%)",
                width: "120%",
                left: "-10%",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              transition={{ delay: 0.2, duration: 1.5, ease: "easeInOut" }}
            />
          )}

          {/* ═════════ CONTENT ═════════ */}
          <div className="relative z-10 flex flex-col items-center gap-3 px-6 text-center">
            {/* ── Phase 1: LUGIE Letters ── */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div className="flex items-center justify-center gap-1 sm:gap-2">
                  {letters.map((letter, i) => (
                    <motion.span
                      key={i}
                      className="relative text-6xl font-black tracking-wide text-white sm:text-8xl lg:text-9xl"
                      style={{
                        textShadow:
                          "0 0 40px hsla(166, 72%, 50%, 0.3), 0 0 80px hsla(166, 72%, 50%, 0.15), 0 0 120px hsla(166, 72%, 50%, 0.05)",
                      }}
                      initial={{
                        opacity: 0,
                        y: 60,
                        rotateX: -90,
                        scale: 0.5,
                        filter: "blur(10px)",
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        scale: 1,
                        filter: "blur(0px)",
                      }}
                      transition={{
                        delay: i * 0.2 + 0.1,
                        duration: 0.8,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                    >
                      {letter}
                      {/* Per-letter glow pulse */}
                      <motion.span
                        className="absolute inset-0 text-6xl font-black tracking-wide sm:text-8xl lg:text-9xl"
                        style={{
                          color: "transparent",
                          WebkitTextStroke: "1px hsla(166, 72%, 50%, 0.4)",
                        }}
                        animate={{
                          opacity: [0, 0.6, 0],
                        }}
                        transition={{
                          delay: i * 0.2 + 0.6,
                          duration: 1.2,
                          ease: "easeInOut",
                        }}
                      >
                        {letter}
                      </motion.span>
                    </motion.span>
                  ))}

                  {/* Animated teal dot after E */}
                  <motion.span
                    className="ml-1 self-end mb-3 sm:mb-5"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: 1.4,
                      duration: 0.5,
                      type: "spring",
                      stiffness: 300,
                      damping: 15,
                    }}
                  >
                    <motion.div
                      className="h-3 w-3 rounded-full bg-[hsl(166,72%,50%)] sm:h-4 sm:w-4"
                      style={{
                        boxShadow:
                          "0 0 12px hsla(166, 72%, 50%, 0.8), 0 0 30px hsla(166, 72%, 50%, 0.4), 0 0 60px hsla(166, 72%, 50%, 0.2)",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 12px hsla(166, 72%, 50%, 0.8), 0 0 30px hsla(166, 72%, 50%, 0.4)",
                          "0 0 20px hsla(166, 72%, 50%, 1), 0 0 50px hsla(166, 72%, 50%, 0.6)",
                          "0 0 12px hsla(166, 72%, 50%, 0.8), 0 0 30px hsla(166, 72%, 50%, 0.4)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 2: GLOBAL CONSULTANCY ── */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  className="overflow-hidden"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.p
                    className="text-base font-semibold tracking-[0.4em] text-white/60 sm:text-lg md:text-xl"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {"GLOBAL CONSULTANCY".split("").map((ch, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 + 0.15, duration: 0.3 }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 3: Dream Beyond Borders + Gold Line ── */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  className="mt-3 flex flex-col items-center gap-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.p
                    className="text-lg font-light italic sm:text-xl md:text-2xl"
                    style={{
                      background: "linear-gradient(135deg, hsl(45, 93%, 68%) 0%, hsl(45, 93%, 50%) 50%, hsl(45, 93%, 68%) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundSize: "200% auto",
                    }}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      backgroundPosition: ["0% center", "200% center"],
                    }}
                    transition={{
                      opacity: { delay: 0.1, duration: 0.6 },
                      y: { delay: 0.1, duration: 0.6, ease: "easeOut" },
                      backgroundPosition: { delay: 0.3, duration: 3, ease: "linear", repeat: Infinity },
                    }}
                  >
                    Dream Beyond Borders
                  </motion.p>

                  {/* Gold sweep line */}
                  <motion.div
                    className="h-[2px] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, hsl(45, 93%, 58%) 30%, hsl(166, 72%, 50%) 70%, transparent 100%)",
                    }}
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />

                  {/* Shimmer on the line */}
                  <motion.div
                    className="h-[2px] -mt-[5px] rounded-full"
                    style={{
                      width: 240,
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                      backgroundSize: "60px 2px",
                    }}
                    animate={{ backgroundPosition: ["-60px 0", "300px 0"] }}
                    transition={{ delay: 1, duration: 2, ease: "linear", repeat: Infinity }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 4: Service Showcase ── */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div
                  className="mt-8 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {[
                    {
                      icon: GraduationCap,
                      label: "University\nAdmissions",
                      from: { x: -80, y: -40, rotate: -15 },
                      color: "hsla(166, 72%, 50%, 0.15)",
                      glowColor: "hsla(166, 72%, 50%, 0.3)",
                    },
                    {
                      icon: FileCheck2,
                      label: "SOP, Visa &\nDocumentation",
                      from: { x: 0, y: 50, rotate: 0 },
                      color: "hsla(45, 93%, 58%, 0.12)",
                      glowColor: "hsla(45, 93%, 58%, 0.25)",
                    },
                    {
                      icon: Plane,
                      label: "Global\nDestinations",
                      from: { x: 80, y: -40, rotate: 15 },
                      color: "hsla(199, 89%, 48%, 0.12)",
                      glowColor: "hsla(199, 89%, 48%, 0.25)",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center gap-3"
                      initial={{
                        opacity: 0,
                        x: item.from.x,
                        y: item.from.y,
                        rotate: item.from.rotate,
                        scale: 0.3,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        y: 0,
                        rotate: 0,
                        scale: 1,
                      }}
                      transition={{
                        delay: i * 0.2,
                        duration: 0.8,
                        type: "spring",
                        stiffness: 150,
                        damping: 18,
                      }}
                    >
                      <motion.div
                        className="rounded-2xl p-4 backdrop-blur-md border border-white/10"
                        style={{
                          background: item.color,
                          boxShadow: `0 0 20px ${item.glowColor}`,
                        }}
                        animate={{
                          boxShadow: [
                            `0 0 20px ${item.glowColor}`,
                            `0 0 35px ${item.glowColor}`,
                            `0 0 20px ${item.glowColor}`,
                          ],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.3,
                        }}
                      >
                        <item.icon className="h-7 w-7 text-white/90 sm:h-8 sm:w-8" />
                      </motion.div>
                      <span className="text-[10px] font-medium text-white/50 text-center leading-tight whitespace-pre-line sm:text-xs">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 4 continued: More services row ── */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div
                  className="mt-4 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  {[
                    {
                      icon: BookOpen,
                      label: "Scholarship\nGuidance",
                      from: { x: -60, y: 30 },
                      color: "hsla(270, 70%, 50%, 0.12)",
                      glowColor: "hsla(270, 70%, 50%, 0.2)",
                    },
                    {
                      icon: Shield,
                      label: "Education\nLoans",
                      from: { x: 0, y: -40 },
                      color: "hsla(340, 75%, 50%, 0.10)",
                      glowColor: "hsla(340, 75%, 50%, 0.2)",
                    },
                    {
                      icon: Globe2,
                      label: "Accommodation\nSupport",
                      from: { x: 60, y: 30 },
                      color: "hsla(160, 72%, 45%, 0.12)",
                      glowColor: "hsla(160, 72%, 45%, 0.2)",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center gap-3"
                      initial={{
                        opacity: 0,
                        x: item.from.x,
                        y: item.from.y,
                        scale: 0.3,
                      }}
                      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      transition={{
                        delay: i * 0.15 + 0.7,
                        duration: 0.7,
                        type: "spring",
                        stiffness: 150,
                        damping: 18,
                      }}
                    >
                      <motion.div
                        className="rounded-2xl p-3.5 backdrop-blur-md border border-white/10"
                        style={{
                          background: item.color,
                          boxShadow: `0 0 15px ${item.glowColor}`,
                        }}
                        animate={{
                          boxShadow: [
                            `0 0 15px ${item.glowColor}`,
                            `0 0 28px ${item.glowColor}`,
                            `0 0 15px ${item.glowColor}`,
                          ],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.4 + 1,
                        }}
                      >
                        <item.icon className="h-6 w-6 text-white/85 sm:h-7 sm:w-7" />
                      </motion.div>
                      <span className="text-[10px] font-medium text-white/45 text-center leading-tight whitespace-pre-line sm:text-xs">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 5: Destination Countries Ring ── */}
            <AnimatePresence>
              {phase >= 5 && phase < 7 && (
                <motion.div
                  className="mt-6"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <motion.p
                    className="text-xs font-bold uppercase tracking-[0.3em] text-[hsl(166,72%,50%)] mb-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.5 }}
                  >
                    Your Gateway to 6 Countries
                  </motion.p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {["🇬🇧 UK", "🇺🇸 USA", "🇩🇪 Germany", "🇨🇦 Canada", "🇦🇺 Australia", "🇮🇪 Ireland"].map(
                      (country, i) => (
                        <motion.div
                          key={i}
                          className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm sm:text-sm"
                          initial={{ opacity: 0, scale: 0, rotate: -10 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{
                            delay: i * 0.12 + 0.2,
                            duration: 0.5,
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          }}
                        >
                          {country}
                        </motion.div>
                      )
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Phase 6: Stats Flash ── */}
            <AnimatePresence>
              {phase >= 6 && phase < 7 && (
                <motion.div
                  className="mt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {[
                    { value: "500+", label: "Students Guided" },
                    { value: "95%", label: "Visa Success" },
                    { value: "50+", label: "Partner Universities" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center gap-1"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.15 + 0.1, duration: 0.4 }}
                    >
                      <span
                        className="text-2xl font-black text-white sm:text-3xl"
                        style={{
                          textShadow: "0 0 20px hsla(166, 72%, 50%, 0.4)",
                        }}
                      >
                        {stat.value}
                      </span>
                      <span className="text-[10px] font-medium text-white/40 sm:text-xs">
                        {stat.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Skip hint ── */}
          <motion.div
            className="absolute bottom-6 flex flex-col items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            <motion.div
              className="h-8 w-[1px] bg-gradient-to-b from-transparent to-white/20"
              animate={{ scaleY: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <p className="text-[10px] font-medium tracking-widest text-white/25 uppercase">
              Tap to explore
            </p>
          </motion.div>

          {/* ── Phase 7: Exit vignette ── */}
          {phase >= 7 && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                background: "radial-gradient(ellipse at center, transparent 30%, hsl(222,47%,6%) 100%)",
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
