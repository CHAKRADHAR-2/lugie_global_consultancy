"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { BEYOND_EASE } from "@/lib/design-tokens";

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
  once?: boolean;
}

const directionOffset = {
  up: { y: 18 },
  down: { y: -18 },
  left: { x: 18 },
  right: { x: -18 },
  none: {},
};

/**
 * Quiet editorial reveal when entering the viewport.
 * Honors user prefers-reduced-motion automatically.
 */
export function FadeIn({
  children,
  delay = 0,
  duration = 0.55,
  direction = "up",
  className = "",
  once = true,
}: FadeInProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: "some" }}
      transition={{
        delay,
        duration,
        ease: BEYOND_EASE.editorial,
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Sequential staggered container for editorial cards, steps, and destination rows.
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.06,
  className = "",
}: {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: "some" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 14 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: BEYOND_EASE.editorial },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Restrained top-level route/page entrance.
 */
export function PageTransition({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: BEYOND_EASE.editorial }}
    >
      {children}
    </motion.div>
  );
}
