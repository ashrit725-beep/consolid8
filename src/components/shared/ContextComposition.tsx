import type { ContextUnit } from "@/types/context";
import {
  CLASSIFICATION_ORDER,
  CLASSIFICATION_STYLES,
} from "@/config/statusStyles";
import { TokenBar } from "@/components/ui/TokenBar";
import { formatInt, formatPercent } from "@/lib/formatting";

/** Where the canonical context went, by decision. */
export function ContextComposition({ units }: { units: ContextUnit[] }) {
  const total = units.reduce((sum, unit) => sum + unit.tokens, 0);

  const rows = CLASSIFICATION_ORDER.map((classification) => {
    const matching = units.filter((u) => u.classification === classification);
    return {
      classification,
      style: CLASSIFICATION_STYLES[classification],
      tokens: matching.reduce((sum, u) => sum + u.tokens, 0),
      count: matching.length,
    };
  }).filter((row) => row.count > 0);

  return (
    <div className="flex flex-col gap-3">
      <TokenBar
        height={10}
        segments={rows.map((row) => ({
          id: row.classification,
          label: row.style.label,
          tokens: row.tokens,
          hex: row.style.hex,
        }))}
        total={total}
      />

      <ul className="flex flex-col divide-y divide-line/70">
        {rows.map((row) => (
          <li
            key={row.classification}
            className="flex items-center justify-between gap-3 py-1.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                aria-hidden
                className="size-2 shrink-0 rounded-xs"
                style={{ backgroundColor: row.style.hex }}
              />
              <span className="text-[11.5px] font-medium text-fg-muted">
                {row.style.label}
              </span>
              <span className="truncate text-[11px] text-fg-faint">
                {row.style.hint}
              </span>
            </div>
            <div className="flex shrink-0 items-baseline gap-3">
              <span className="num text-[10px] text-fg-faint">
                {row.count} units
              </span>
              <span className="num w-14 text-right text-[11.5px] text-fg">
                {formatInt(row.tokens)}
              </span>
              <span className="num w-11 text-right text-[10px] text-fg-dim">
                {formatPercent(row.tokens / total, 1)}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
