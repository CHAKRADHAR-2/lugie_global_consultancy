"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Preserves next-themes provider compatibility across the app while locking
 * the approved light-first editorial palette ("The Beyond Experience").
 * Verified across all 53 routes: zero components toggle dark theme or use `dark:` classes.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
