"use client";

import { useEffect, useState } from "react";

/**
 * Quiet Horizon Sage + Soft Terracotta top progress bar for active async transitions.
 */
export function PageLoader({ loading = false }: { loading?: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (!visible && !loading) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9998] h-[3px] overflow-hidden bg-[#DCE5E8]/60"
      role="progressbar"
      aria-label="Page loading"
    >
      <div
        className={`h-full bg-gradient-to-r from-[#394B49] via-[#D9A879] to-[#B7CBC2] ${
          loading ? "progress-bar-animate" : "translate-x-0"
        } transition-transform`}
        style={{ width: "100%" }}
      />
    </div>
  );
}
