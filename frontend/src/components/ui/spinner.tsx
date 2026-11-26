/**
 * Branded spinner — teal ring with navy center dot.
 */
export function Spinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  const border = { sm: "border-2", md: "border-2", lg: "border-[3px]" };

  return (
    <div
      className={`${dims[size]} ${border[size]} animate-spin rounded-full border-[hsl(166,72%,40%)] border-t-transparent ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
