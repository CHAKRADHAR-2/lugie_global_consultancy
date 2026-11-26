"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { BEYOND_EASE } from "@/lib/design-tokens";

/**
 * Animated number counter that smoothly settles when scrolled into view.
 * Renders the final value immediately when prefers-reduced-motion is active,
 * and safely guards non-finite inputs so NaN can never render.
 */
export function AnimatedCounter({
  target,
  suffix = "",
  prefix = "",
  duration = 1.4,
  className = "",
}: {
  target: number | null | undefined;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const safeTarget = Number.isFinite(Number(target)) ? Number(target) : 0;
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: "some" });
  const prefersReduced = useReducedMotion();
  const [count, setCount] = useState(() => (prefersReduced ? safeTarget : 0));

  useEffect(() => {
    if (prefersReduced) {
      setCount(safeTarget);
      return;
    }
    if (!isInView) return;

    let rafId = 0;
    let startVal = -1;
    const startTime = performance.now();

    function update(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * safeTarget);

      if (current !== startVal) {
        setCount(current);
        startVal = current;
      }

      if (progress < 1) {
        rafId = requestAnimationFrame(update);
      }
    }

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, [isInView, safeTarget, duration, prefersReduced]);

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={isInView || prefersReduced ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.35, ease: BEYOND_EASE.editorial }}
    >
      {prefix}
      {count.toLocaleString("en-IN")}
      {suffix}
    </motion.span>
  );
}
