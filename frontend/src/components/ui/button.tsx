"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "warm"
  | "secondary"
  | "sage"
  | "ghost"
  | "destructive"
  | "icon";

export type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-[#394B49] text-white border border-[#394B49] shadow-sm hover:bg-[#2C3B39] hover:border-[#2C3B39] hover:shadow-md",
  warm:
    "bg-[#D9A879] text-[#263331] border border-[#D9A879] shadow-sm hover:bg-[#CFA070] hover:border-[#CFA070] hover:shadow-md",
  secondary:
    "bg-white text-[#394B49] border border-[#DCE5E8] shadow-xs hover:bg-[#F3F0E8] hover:border-[#B7CBC2]",
  sage:
    "bg-[#E6EFEA] text-[#263331] border border-[#B7CBC2] hover:bg-[#B7CBC2] hover:text-[#263331]",
  ghost:
    "bg-transparent text-[#394B49] border border-transparent hover:bg-[#EAE5D9]/70",
  destructive:
    "bg-[#A63A3A] text-white border border-[#A63A3A] shadow-sm hover:bg-[#8E2E2E]",
  icon:
    "bg-white text-[#394B49] border border-[#DCE5E8] hover:bg-[#F3F0E8] hover:border-[#B7CBC2]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-xs rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-sm rounded-xl gap-2",
  icon: "h-9 w-9 p-0 rounded-xl",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return cn(
    "inline-flex items-center justify-center font-semibold select-none",
    "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
    "hover:-translate-y-[1px] active:translate-y-0 active:scale-[0.985]",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#394B49]",
    "disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0",
    "cursor-pointer whitespace-nowrap",
    VARIANT_CLASSES[variant],
    variant === "icon" && size === "md" ? SIZE_CLASSES.icon : SIZE_CLASSES[size],
    className
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** True while async submission/action is running; prevents duplicate clicks */
  loading?: boolean;
  loadingText?: string;
  /** Genuine post-operation outcome indicator; never fake success prior to completion */
  feedbackState?: "idle" | "success" | "error";
  successText?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      type = "button",
      disabled,
      loading = false,
      loadingText,
      feedbackState = "idle",
      successText,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isDisabled = Boolean(disabled || loading);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        e.preventDefault();
        return;
      }
      onClick?.(e);
    };

    const resolvedVariant: ButtonVariant =
      feedbackState === "error" && variant !== "destructive" ? "destructive" : variant;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        onClick={handleClick}
        className={buttonVariants({ variant: resolvedVariant, size, className })}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : feedbackState === "success" ? (
          <>
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{successText || children}</span>
          </>
        ) : feedbackState === "error" ? (
          <>
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
