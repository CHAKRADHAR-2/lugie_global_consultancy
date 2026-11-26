"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BEYOND_COLORS, BEYOND_EASE } from "@/lib/design-tokens";

interface HorizonPathProps {
  variant?: "hero" | "divider" | "vertical" | "compact";
  className?: string;
  animate?: boolean;
  delay?: number;
  waypoints?: number;
}

/**
 * The Horizon Path — Lugie's signature continuous visual motif.
 * Represents a student's guided international journey from local roots to global campuses.
 */
export function HorizonPath({
  variant = "divider",
  className = "",
  animate = true,
  delay = 0.15,
  waypoints = 3,
}: HorizonPathProps) {
  const prefersReduced = useReducedMotion();
  const shouldAnimate = animate && !prefersReduced;

  if (variant === "vertical") {
    return (
      <svg
        viewBox="0 0 24 240"
        fill="none"
        aria-hidden="true"
        className={`w-6 h-full pointer-events-none ${className}`}
        preserveAspectRatio="none"
      >
        <motion.path
          d="M12 4 C 18 60, 6 120, 12 180 C 16 205, 12 225, 12 236"
          stroke={BEYOND_COLORS.horizonSage}
          strokeWidth="2"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0.4 } : false}
          whileInView={shouldAnimate ? { pathLength: 1, opacity: 1 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay, ease: BEYOND_EASE.editorial }}
        />
        <circle cx="12" cy="12" r="3.5" fill={BEYOND_COLORS.forestSlate} />
        <circle cx="12" cy="228" r="4" fill={BEYOND_COLORS.softTerracotta} />
      </svg>
    );
  }

  if (variant === "compact") {
    return (
      <svg
        viewBox="0 0 240 32"
        fill="none"
        aria-hidden="true"
        className={`w-full h-8 pointer-events-none ${className}`}
      >
        <motion.path
          d="M 8 22 C 68 8, 130 28, 232 10"
          stroke={BEYOND_COLORS.horizonSage}
          strokeWidth="2"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0 } : false}
          whileInView={shouldAnimate ? { pathLength: 1 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 1, delay, ease: BEYOND_EASE.editorial }}
        />
        <circle cx="8" cy="22" r="3.5" fill={BEYOND_COLORS.forestSlate} />
        <circle cx="122" cy="18" r="3" fill={BEYOND_COLORS.horizonSage} />
        <circle cx="232" cy="10" r="4" fill={BEYOND_COLORS.softTerracotta} />
      </svg>
    );
  }

  if (variant === "hero") {
    const nodePositions = [
      { cx: 60, cy: 112, fill: BEYOND_COLORS.forestSlate },
      { cx: 290, cy: 76, fill: BEYOND_COLORS.horizonSage },
      { cx: 560, cy: 96, fill: BEYOND_COLORS.horizonSage },
      { cx: 840, cy: 48, fill: BEYOND_COLORS.softTerracotta },
      { cx: 1120, cy: 26, fill: BEYOND_COLORS.softTerracotta },
    ].slice(0, Math.max(2, waypoints));

    return (
      <svg
        viewBox="0 0 1200 140"
        fill="none"
        aria-hidden="true"
        className={`w-full h-auto pointer-events-none ${className}`}
      >
        {/* Subtle secondary horizon arc */}
        <path
          d="M 20 124 C 310 132, 620 42, 1180 34"
          stroke={BEYOND_COLORS.mistyBlue}
          strokeWidth="1.5"
          strokeDasharray="5 6"
        />
        {/* Primary Horizon Path curve */}
        <motion.path
          d="M 60 112 C 260 66, 440 116, 620 82 C 790 50, 960 36, 1120 26"
          stroke="url(#beyondHorizonGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0, opacity: 0 } : false}
          animate={shouldAnimate ? { pathLength: 1, opacity: 1 } : undefined}
          transition={{ duration: 1.5, delay, ease: BEYOND_EASE.editorial }}
        />
        {nodePositions.map((pt, idx) => (
          <motion.g
            key={idx}
            initial={shouldAnimate ? { scale: 0, opacity: 0 } : false}
            animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
            transition={{
              delay: delay + 0.25 + idx * 0.14,
              duration: 0.45,
              ease: BEYOND_EASE.editorial,
            }}
          >
            <circle cx={pt.cx} cy={pt.cy} r="7" fill="#FFFFFF" stroke={pt.fill} strokeWidth="2.2" />
            <circle cx={pt.cx} cy={pt.cy} r="2.8" fill={pt.fill} />
          </motion.g>
        ))}
        <defs>
          <linearGradient id="beyondHorizonGrad" x1="60" y1="112" x2="1120" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={BEYOND_COLORS.forestSlate} />
            <stop offset="55%" stopColor={BEYOND_COLORS.horizonSage} />
            <stop offset="100%" stopColor={BEYOND_COLORS.softTerracotta} />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Default: section divider
  return (
    <div className={`mx-auto max-w-6xl px-6 lg:px-8 ${className}`} aria-hidden="true">
      <svg viewBox="0 0 1100 36" fill="none" className="w-full h-7">
        <line x1="0" y1="18" x2="1100" y2="18" stroke={BEYOND_COLORS.mistyBlue} strokeWidth="1" />
        <motion.path
          d="M 280 18 C 390 6, 480 30, 550 18 C 620 6, 710 30, 820 18"
          stroke={BEYOND_COLORS.horizonSage}
          strokeWidth="2"
          strokeLinecap="round"
          initial={shouldAnimate ? { pathLength: 0 } : false}
          whileInView={shouldAnimate ? { pathLength: 1 } : undefined}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, delay: 0.1, ease: BEYOND_EASE.editorial }}
        />
        <circle cx="550" cy="18" r="4" fill={BEYOND_COLORS.softTerracotta} />
      </svg>
    </div>
  );
}
