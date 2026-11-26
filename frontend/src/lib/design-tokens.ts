/**
 * LUGIE — The Beyond Experience
 * Canonical Design Tokens & Brand Metadata
 *
 * Colour Contrast Validation (WCAG 2.1 AA):
 * - Forest Slate (#394B49) on Pure White (#FFFFFF): 9.22:1 (AAA)
 * - Forest Slate (#394B49) on Porcelain (#F3F0E8): 8.10:1 (AAA)
 * - Forest Slate (#394B49) on Misty Blue (#DCE5E8): 7.21:1 (AAA)
 * - Forest Slate (#394B49) on Horizon Sage (#B7CBC2): 5.42:1 (AA)
 * - Deep Forest Ink (#263331) on Soft Terracotta (#D9A879): 6.14:1 (AA)
 * - Terracotta Ink (#8E572C) on Porcelain (#F3F0E8): 5.19:1 (AA)
 * - Slate Muted (#546866) on Porcelain (#F3F0E8): 5.20:1 (AA)
 * - Sage Ink (#3F6258) on Porcelain (#F3F0E8): 5.95:1 (AA)
 */

export const BEYOND_COLORS = {
  porcelain: "#F3F0E8",
  porcelainDeep: "#EAE5D9",
  horizonSage: "#B7CBC2",
  horizonSageSoft: "#E6EFEA",
  sageInk: "#3F6258",
  softTerracotta: "#D9A879",
  terracottaHover: "#CFA070",
  terracottaSoft: "#F6EDE4",
  terracottaInk: "#8E572C",
  mistyBlue: "#DCE5E8",
  mistyBlueSoft: "#EEF3F5",
  forestSlate: "#394B49",
  slateDeep: "#263331",
  slateMuted: "#546866",
  pureWhite: "#FFFFFF",
  errorClay: "#A63A3A",
  errorBg: "#FDF2F2",
  successSage: "#2F6B55",
  successBg: "#EDF5F1",
  warningOchre: "#8A5A1E",
  warningBg: "#FCF6EC",
} as const;

export const BEYOND_CHART_SERIES = [
  BEYOND_COLORS.forestSlate,
  BEYOND_COLORS.softTerracotta,
  BEYOND_COLORS.horizonSage,
  BEYOND_COLORS.terracottaInk,
  BEYOND_COLORS.sageInk,
] as const;

export const BEYOND_EASE = {
  /** Primary editorial settle curve — calm, unhurried, non-bouncy */
  editorial: [0.22, 1, 0.36, 1] as const,
  /** Gentle exit transition */
  exit: [0.4, 0, 1, 1] as const,
  /** Subtle tactile spring for menus/modals */
  tactile: { type: "spring" as const, stiffness: 320, damping: 30, mass: 0.9 },
} as const;

export const BEYOND_SERVICES_LIST = [
  {
    id: "profile-assessment",
    step: "01",
    shortTitle: "Profile assessment and counselling",
    title: "Profile assessment and counselling",
    summary: "Honest transcript review, GPA & backlog analysis, and direct founder guidance.",
    href: "/book-consultation",
  },
  {
    id: "shortlisting",
    step: "02",
    shortTitle: "Country and university shortlisting",
    title: "Country and university shortlisting",
    summary: "Dream, Target, and Safe institution lists calibrated against real admission criteria.",
    href: "/universities",
  },
  {
    id: "applications",
    step: "03",
    shortTitle: "University application assistance",
    title: "University application assistance",
    summary: "End-to-end portal filing, credential verification, and strict intake deadline management.",
    href: "/services",
  },
  {
    id: "sop-lor-cv",
    step: "04",
    shortTitle: "SOP, LOR and CV guidance",
    title: "SOP, LOR and CV guidance",
    summary: "Narrative-driven editorial refinement for authentic academic statements and portfolios.",
    href: "/services",
  },
  {
    id: "scholarships",
    step: "05",
    shortTitle: "Scholarship guidance",
    title: "Scholarship guidance",
    summary: "Merit bursary mapping, government awards, and scholarship motivation essay support.",
    href: "/scholarships",
  },
  {
    id: "education-loans",
    step: "06",
    shortTitle: "Education loan guidance",
    title: "Education loan guidance",
    summary: "Collateral and non-collateral education loan comparisons and sanction documentation.",
    href: "/loans",
  },
  {
    id: "visa-documentation",
    step: "07",
    shortTitle: "Visa documentation guidance",
    title: "Visa documentation guidance",
    summary: "Meticulous financial dossier audits and 1-on-1 mock embassy visa interviews.",
    href: "/visa-assistance",
  },
  {
    id: "accommodation",
    step: "08",
    shortTitle: "Accommodation and pre-departure assistance",
    title: "Accommodation and pre-departure assistance",
    summary: "Verified student housing, health cover compliance, forex guidance, and arrival readiness.",
    href: "/accommodation",
  },
] as const;

export const SPLASH_STORAGE_KEY = "lugie_beyond_intro_seen_v1";
