import type * as React from "react";

/**
 * Warm Porcelain -> Misty Blue skeleton shimmer placeholders.
 */
function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={`skeleton-shimmer rounded-lg ${className}`}
      {...props}
    />
  );
}

function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#DCE5E8] bg-white p-6 ${className}`}>
      <Skeleton className="mb-4 h-5 w-2/3" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-2 h-3 w-5/6" />
      <Skeleton className="mb-4 h-3 w-4/6" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-[#DCE5E8]/70 py-4 px-2">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${Math.max(40, 100 / cols)}%` }}
        />
      ))}
    </div>
  );
}

function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[#DCE5E8] bg-white p-5"
        >
          <Skeleton className="mb-3 h-3.5 w-24" />
          <Skeleton className="mb-2 h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
      ))}
    </div>
  );
}

function SkeletonProfile() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1">
        <Skeleton className="mb-1.5 h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

function SkeletonJourney() {
  return (
    <div className="space-y-6" aria-label="Loading content">
      <div className="rounded-2xl border border-[#DCE5E8] bg-white p-6">
        <Skeleton className="mb-3 h-6 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <SkeletonStats count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <SkeletonCard />
        </div>
        <div className="lg:col-span-4">
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonRow,
  SkeletonStats,
  SkeletonProfile,
  SkeletonJourney,
};
