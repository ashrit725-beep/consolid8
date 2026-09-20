import type { ContextStripSegment } from "@/types/stress-test";
import { CLASSIFICATION_STYLES } from "@/config/statusStyles";
import { TokenBar } from "@/components/ui/TokenBar";
import { formatInt } from "@/lib/formatting";

/**
 * A single variant's context, drawn against the full-context baseline so the
 * three columns are directly comparable.
 */
export function ContextStrip({
  segments,
  baseline,
}: {
  segments: ContextStripSegment[];
  /** Widest variant's token count — the shared denominator. */
  baseline: number;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.tokens, 0);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          className="overflow-hidden rounded-xs"
          style={{ width: `${(total / baseline) * 100}%`, minWidth: "6%" }}
        >
          <TokenBar
            height={14}
            segments={segments.map((segment, index) => ({
              id: `${segment.label}-${index}`,
              label: segment.label,
              tokens: segment.tokens,
              hex: CLASSIFICATION_STYLES[segment.classification].hex,
            }))}
          />
        </div>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-full rounded-xs border border-dashed border-line"
        />
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-px">
        {segments.map((segment, index) => (
          <li
            key={`${segment.label}-${index}`}
            className="flex items-center justify-between gap-2"
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span
                aria-hidden
                className="size-1.5 shrink-0 rounded-[1px]"
                style={{
                  backgroundColor:
                    CLASSIFICATION_STYLES[segment.classification].hex,
                }}
              />
              <span className="truncate text-[10px] text-fg-dim">
                {segment.label}
              </span>
            </span>
            <span className="num shrink-0 text-[10px] text-fg-faint">
              {formatInt(segment.tokens)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
