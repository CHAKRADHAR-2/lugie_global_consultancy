"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { BEYOND_EASE } from "@/lib/design-tokens";
import { cn } from "@/lib/utils";

/* ─── Status Badge ─── */
const STATUS_TONES: Record<string, string> = {
  success: "bg-[#EDF5F1] text-[#2F6B55] border-[#B7CBC2]",
  sage: "bg-[#E6EFEA] text-[#3F6258] border-[#B7CBC2]",
  warm: "bg-[#F6EDE4] text-[#8E572C] border-[#D9A879]/60",
  misty: "bg-[#EEF3F5] text-[#394B49] border-[#DCE5E8]",
  warning: "bg-[#FCF6EC] text-[#8A5A1E] border-[#D9A879]",
  error: "bg-[#FDF2F2] text-[#A63A3A] border-[#E7BABA]",
  slate: "bg-[#394B49] text-white border-[#394B49]",
};

export function StatusBadge({
  tone = "misty",
  children,
  className = "",
}: {
  tone?: keyof typeof STATUS_TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide",
        STATUS_TONES[tone] || STATUS_TONES.misty,
        className
      )}
    >
      {children}
    </span>
  );
}

/* ─── Accessible Outcome Feedback Banner ─── */
export function FeedbackBanner({
  tone,
  title,
  message,
  className = "",
}: {
  tone: "success" | "error" | "warning" | "info";
  title?: string;
  message: string;
  className?: string;
}) {
  const styles = {
    success: {
      box: "bg-[#EDF5F1] border-[#B7CBC2] text-[#2F6B55]",
      Icon: CheckCircle2,
    },
    error: {
      box: "bg-[#FDF2F2] border-[#E7BABA] text-[#A63A3A]",
      Icon: AlertCircle,
    },
    warning: {
      box: "bg-[#FCF6EC] border-[#D9A879] text-[#8A5A1E]",
      Icon: AlertTriangle,
    },
    info: {
      box: "bg-[#EEF3F5] border-[#DCE5E8] text-[#394B49]",
      Icon: Info,
    },
  }[tone];

  const IconComp = styles.Icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-3.5 text-xs leading-relaxed",
        styles.box,
        className
      )}
    >
      <IconComp className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <p>{message}</p>
      </div>
    </div>
  );
}

/* ─── Accessible Animated Modal Container ─── */
export function ModalShell({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidth = "max-w-lg",
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidth?: string;
  children: ReactNode;
}) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            className="fixed inset-0 bg-[#263331]/40 backdrop-blur-[2px]"
            initial={prefersReduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              "relative z-10 w-full rounded-2xl border border-[#DCE5E8] bg-white p-6 md:p-8 shadow-xl",
              maxWidth
            )}
            initial={prefersReduced ? false : { opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 6 }}
            transition={{ duration: 0.25, ease: BEYOND_EASE.editorial }}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-xl p-2 text-[#546866] hover:bg-[#F3F0E8] hover:text-[#394B49] transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            {title && (
              <div className="mb-5 pr-8">
                <h2 className="font-editorial text-xl text-[#394B49]">{title}</h2>
                {subtitle && <p className="mt-1 text-xs text-[#546866]">{subtitle}</p>}
              </div>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
