/**
 * Skeleton loader components with shimmer animation.
 * Use these as placeholders while data is loading.
 */

function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`skeleton-shimmer rounded-lg ${className}`}
      {...props}
    />
  );
}

/** Card-shaped skeleton */
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-6 ${className}`}>
      <Skeleton className="mb-4 h-5 w-2/3" />
      <Skeleton className="mb-2 h-3 w-full" />
      <Skeleton className="mb-2 h-3 w-5/6" />
      <Skeleton className="mb-4 h-3 w-4/6" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

/** Table row skeleton */
function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-[hsl(220,13%,91%)] py-4 px-2">
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

/** Dashboard stats skeleton */
function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-[hsl(220,13%,91%)] bg-white p-5"
        >
          <Skeleton className="mb-3 h-4 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

/** Avatar + text skeleton */
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

export { Skeleton, SkeletonCard, SkeletonRow, SkeletonStats, SkeletonProfile };
