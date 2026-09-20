import { cn } from "@/lib/utils";

export interface BarSegment {
  id: string;
  label: string;
  tokens: number;
  hex: string;
}

/**
 * Proportional horizontal bar. Used for context composition, the before/after
 * flow and the stress-test strips — one implementation, three consumers.
 */
export function TokenBar({
  segments,
  total,
  height = 8,
  showTooltips = true,
  className,
  rounded = true,
}: {
  segments: BarSegment[];
  /** Denominator. Defaults to the sum of the segments. */
  total?: number;
  height?: number;
  showTooltips?: boolean;
  className?: string;
  rounded?: boolean;
}) {
  const sum = total ?? segments.reduce((acc, s) => acc + s.tokens, 0);
  if (sum <= 0) return null;

  return (
    <div
      className={cn(
        "flex w-full overflow-hidden bg-surface-inset",
        rounded ? "rounded-xs" : "",
        className,
      )}
      style={{ height }}
    >
      {segments.map((segment) => {
        const share = segment.tokens / sum;
        if (share <= 0) return null;
        return (
          <div
            key={segment.id}
            title={
              showTooltips
                ? `${segment.label} · ${segment.tokens.toLocaleString("en-US")} tokens · ${(share * 100).toFixed(1)}%`
                : undefined
            }
            className="h-full transition-[width] duration-700 ease-out first:rounded-l-xs last:rounded-r-xs"
            style={{
              width: `${share * 100}%`,
              backgroundColor: segment.hex,
            }}
          />
        );
      })}
    </div>
  );
}

/** Single-value progress meter with an optional threshold marker. */
export function Meter({
  value,
  tone = "#3fd98b",
  height = 4,
  className,
}: {
  /** 0..1 */
  value: number;
  tone?: string;
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-white/6", className)}
      style={{ height }}
      role="presentation"
    >
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${Math.max(0, Math.min(1, value)) * 100}%`,
          backgroundColor: tone,
        }}
      />
    </div>
  );
}
