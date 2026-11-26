"use client";

import { useEffect, useState } from "react";

/**
 * Thin animated progress bar at the top of the viewport.
 * Shows during route transitions / data loading.
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
    <div className="fixed top-0 left-0 right-0 z-[9998] h-[3px] overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r from-[hsl(166,72%,40%)] via-[hsl(45,93%,58%)] to-[hsl(166,72%,40%)] ${
          loading ? "progress-bar-animate" : "translate-x-0"
        } transition-transform`}
        style={{ width: "100%" }}
      />
    </div>
  );
}
