"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, FileCheck2, Plane } from "lucide-react";

const STORAGE_KEY = "lugie_splash_seen";

export function IntroSplash() {
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Check if splash has been shown before
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(STORAGE_KEY);

    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (seen || prefersReduced) {
      setShow(false);
      return;
    }

    setShow(true);

    // Phase progression
    const timers = [
      setTimeout(() => setPhase(1), 300), // Brand name
      setTimeout(() => setPhase(2), 1200), // Subtitle
      setTimeout(() => setPhase(3), 1800), // Tagline
      setTimeout(() => setPhase(4), 2500), // Service icons
      setTimeout(() => setPhase(5), 3600), // Fade out
      setTimeout(() => {
        setShow(false);
        localStorage.setItem(STORAGE_KEY, "true");
      }, 4200),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  const handleSkip = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          onClick={handleSkip}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[hsl(222,47%,11%)]">
            {/* Gradient orbs */}
            <motion.div
              className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-[hsl(166,72%,40%)] opacity-[0.08] blur-[100px]"
              animate={{
                x: [0, 50, -30, 0],
                y: [0, -40, 30, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-[hsl(45,93%,58%)] opacity-[0.06] blur-[80px]"
              animate={{
                x: [0, -40, 30, 0],
                y: [0, 30, -40, 0],
                scale: [1, 0.9, 1.1, 1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
            {/* LUGIE */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-baseline gap-0"
                >
                  {"LUGIE".split("").map((letter, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: i * 0.08,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="text-5xl font-black tracking-wider text-white sm:text-7xl lg:text-8xl"
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* GLOBAL CONSULTANCY */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-lg font-semibold tracking-[0.3em] text-white/70 sm:text-xl"
                >
                  GLOBAL CONSULTANCY
                </motion.p>
              )}
            </AnimatePresence>

            {/* Dream Beyond Borders */}
            <AnimatePresence>
              {phase >= 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-2 flex flex-col items-center gap-2"
                >
                  <motion.p
                    className="text-base font-light italic text-[hsl(45,93%,68%)] sm:text-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.1,
                      duration: 0.5,
                      ease: "easeOut",
                    }}
                  >
                    Dream Beyond Borders
                  </motion.p>
                  <motion.div
                    className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-[hsl(45,93%,58%)] to-transparent"
                    initial={{ width: 0 }}
                    animate={{ width: 180 }}
                    transition={{
                      delay: 0.2,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Service Icons */}
            <AnimatePresence>
              {phase >= 4 && (
                <motion.div
                  className="mt-8 flex items-center gap-8 sm:gap-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {[
                    {
                      icon: GraduationCap,
                      label: "University Admissions",
                      from: { x: -60, y: -20 },
                    },
                    {
                      icon: FileCheck2,
                      label: "Visa & SOP Filing",
                      from: { x: 0, y: 30 },
                    },
                    {
                      icon: Plane,
                      label: "Global Destinations",
                      from: { x: 60, y: -20 },
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0, x: item.from.x, y: item.from.y }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      transition={{
                        delay: i * 0.15,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
                        <item.icon className="h-6 w-6 text-[hsl(166,72%,50%)] sm:h-7 sm:w-7" />
                      </div>
                      <span className="text-[10px] font-medium text-white/60 sm:text-xs">
                        {item.label}
                      </span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Skip hint */}
          <motion.p
            className="absolute bottom-8 text-xs text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            Tap anywhere to skip
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
