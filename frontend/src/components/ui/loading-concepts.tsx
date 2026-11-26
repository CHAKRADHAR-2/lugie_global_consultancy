"use client";

import { BEYOND_COLORS } from "@/lib/design-tokens";

interface LoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Branded Concept 1: Growing Horizon
 * Use for page shells, dashboard entry, journey timelines, and onboarding states.
 */
export function GrowingHorizonLoader({
  label = "Preparing your horizon…",
  size = "md",
  className = "",
}: LoaderProps) {
  const widths = { sm: "w-28", md: "w-44", lg: "w-64" };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        viewBox="0 0 180 36"
        fill="none"
        className={`${widths[size]} h-auto`}
        aria-hidden="true"
      >
        <path
          d="M 10 26 C 55 12, 115 30, 170 10"
          stroke={BEYOND_COLORS.mistyBlue}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 10 26 C 55 12, 115 30, 170 10"
          stroke={BEYOND_COLORS.forestSlate}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="horizon-stroke-flow"
        />
        <circle cx="10" cy="26" r="3.5" fill={BEYOND_COLORS.forestSlate} />
        <circle cx="92" cy="20" r="3" fill={BEYOND_COLORS.horizonSage} />
        <circle cx="170" cy="10" r="4" fill={BEYOND_COLORS.softTerracotta} />
      </svg>
      {label && (
        <p className="text-xs font-medium tracking-wide text-[#546866]">{label}</p>
      )}
    </div>
  );
}

/**
 * Branded Concept 2: Global Orbit
 * Use for university/destination discovery, filtering, search, and session verification.
 */
export function GlobalOrbitLoader({
  label = "Syncing global directory…",
  size = "md",
  className = "",
}: LoaderProps) {
  const dims = { sm: "h-9 w-9", md: "h-12 w-12", lg: "h-16 w-16" };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className={`relative flex items-center justify-center ${dims[size]}`} aria-hidden="true">
        {/* Outer orbit ring */}
        <svg viewBox="0 0 64 64" fill="none" className="absolute inset-0 h-full w-full orbit-rotate">
          <circle
            cx="32"
            cy="32"
            r="26"
            stroke={BEYOND_COLORS.mistyBlue}
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />
          <circle cx="32" cy="6" r="3.5" fill={BEYOND_COLORS.softTerracotta} />
        </svg>

        {/* Inner tilted orbit */}
        <svg viewBox="0 0 64 64" fill="none" className="absolute inset-0 h-full w-full orbit-rotate-reverse">
          <ellipse
            cx="32"
            cy="32"
            rx="19"
            ry="11"
            transform="rotate(-24 32 32)"
            stroke={BEYOND_COLORS.horizonSage}
            strokeWidth="1.5"
          />
          <circle cx="50" cy="24" r="2.5" fill={BEYOND_COLORS.forestSlate} />
        </svg>

        {/* Core dot */}
        <span className="h-2.5 w-2.5 rounded-full bg-[#394B49]" />
      </div>
      {label && (
        <p className="text-xs font-medium text-[#546866]">{label}</p>
      )}
    </div>
  );
}

/**
 * Branded Concept 3: Document Reveal
 * Use for transcript uploads, ClamAV scans, SOP/LOR dossier reviews, and file previews.
 */
export function DocumentRevealLoader({
  label = "Reviewing document integrity…",
  size = "md",
  className = "",
}: LoaderProps) {
  const dims = { sm: "h-10 w-8", md: "h-12 w-10", lg: "h-16 w-12" };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`relative rounded-xl border border-[#B7CBC2] bg-white p-2 shadow-xs overflow-hidden ${dims[size]}`}
        aria-hidden="true"
      >
        {/* Document lines */}
        <div className="space-y-1.5 pt-1">
          <div className="h-1 w-3/5 rounded-full bg-[#394B49]/40" />
          <div className="h-1 w-full rounded-full bg-[#DCE5E8]" />
          <div className="h-1 w-4/5 rounded-full bg-[#DCE5E8]" />
          <div className="h-1 w-2/3 rounded-full bg-[#DCE5E8]" />
        </div>
        {/* Sweeping gentle scanner accent */}
        <div className="doc-scan-line absolute left-1 right-1 top-2 h-0.5 rounded-full bg-[#D9A879]" />
      </div>
      {label && (
        <p className="text-xs font-medium text-[#546866]">{label}</p>
      )}
    </div>
  );
}
