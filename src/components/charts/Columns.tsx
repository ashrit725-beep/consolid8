"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { formatCompact } from "@/lib/formatting";

export interface ColumnSeries {
  key: string;
  label: string;
  hex: string;
  values: number[];
}

/** Round a raw peak up to a readable axis ceiling so the ticks are legible. */
function niceCeil(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const fraction = value / magnitude;
  const step = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find(
    (candidate) => fraction <= candidate + 1e-9,
  );
  return (step ?? 10) * magnitude;
}

/**
 * Small SVG-free column chart. Grouped or stacked, no dependency, and only
 * the axis furniture needed to read a magnitude off a bar: max, mid, zero.
 */
export function Columns({
  labels,
  series,
  mode = "grouped",
  height = 168,
  valueFormat = formatCompact,
  axisFormat = formatCompact,
  className,
}: {
  labels: string[];
  series: ColumnSeries[];
  mode?: "grouped" | "stacked";
  height?: number;
  /** Formats the values in the hover readout. */
  valueFormat?: (value: number) => string;
  /** Formats the three axis ticks. Kept separate so units stay off the axis. */
  axisFormat?: (value: number) => string;
  className?: string;
}) {
  const id = useId();
  const [hover, setHover] = useState<{ column: number; key?: string } | null>(
    null,
  );

  const columnTotals = labels.map((_, index) =>
    series.reduce((sum, s) => sum + (s.values[index] ?? 0), 0),
  );
  const columnPeaks = labels.map((_, index) =>
    Math.max(0, ...series.map((s) => s.values[index] ?? 0)),
  );
  const max = niceCeil(
    Math.max(...(mode === "stacked" ? columnTotals : columnPeaks), 0),
  );
  const plotHeight = height - 22;
  const ticks = [max, max / 2, 0];

  return (
    <figure className={cn("w-full", className)}>
      <div className="flex w-full items-stretch">
        <div
          aria-hidden
          className="relative w-[44px] shrink-0"
          style={{ height: plotHeight }}
        >
          {ticks.map((tick, tickIndex) => (
            <span
              key={`${id}-tick-${tick}`}
              className="num absolute right-2 -translate-y-1/2 text-[9.5px] text-fg-faint"
              style={{ top: `${(tickIndex / (ticks.length - 1)) * 100}%` }}
            >
              {axisFormat(tick)}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className="relative flex items-end gap-2"
            style={{ height: plotHeight }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-fg/[0.07]"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 top-1/2 h-px bg-fg/[0.07]"
            />
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-px bg-line"
            />

            {labels.map((label, index) => (
              <div
                key={`${id}-${label}`}
                className="relative flex h-full flex-1 items-end justify-center gap-[3px]"
                onMouseEnter={() => setHover({ column: index })}
                onMouseLeave={() => setHover(null)}
              >
                {mode === "grouped" ? (
                  series.map((s) => {
                    const value = s.values[index] ?? 0;
                    return (
                      <div
                        key={s.key}
                        onMouseEnter={() =>
                          setHover({ column: index, key: s.key })
                        }
                        onMouseLeave={() => setHover({ column: index })}
                        className="w-full max-w-[18px] rounded-t-[2px] transition-[height,opacity] duration-500 ease-out"
                        style={{
                          height: `${(value / max) * 100}%`,
                          backgroundColor: s.hex,
                          opacity:
                            hover?.column === index &&
                            hover.key !== undefined &&
                            hover.key !== s.key
                              ? 0.4
                              : 0.85,
                        }}
                      />
                    );
                  })
                ) : (
                  <div className="flex h-full w-full max-w-[26px] flex-col justify-end">
                    {[...series].reverse().map((s) => {
                      const value = s.values[index] ?? 0;
                      return (
                        <div
                          key={s.key}
                          onMouseEnter={() =>
                            setHover({ column: index, key: s.key })
                          }
                          onMouseLeave={() => setHover({ column: index })}
                          className="w-full transition-[height,opacity] duration-500 ease-out first:rounded-t-[2px]"
                          style={{
                            height: `${(value / max) * 100}%`,
                            backgroundColor: s.hex,
                            opacity:
                              hover?.column === index &&
                              hover.key !== undefined &&
                              hover.key !== s.key
                                ? 0.4
                                : 0.88,
                          }}
                        />
                      );
                    })}
                  </div>
                )}

                {hover?.column === index ? (
                  <div
                    className={cn(
                      "pointer-events-none absolute top-0 z-10 min-w-[132px] rounded-xs border border-line-strong bg-surface-overlay px-2 py-1.5",
                      index === 0
                        ? "left-0"
                        : index === labels.length - 1
                          ? "right-0"
                          : "left-1/2 -translate-x-1/2",
                    )}
                  >
                    <p className="label-xs mb-1">{label}</p>
                    <ul className="flex flex-col gap-0.5">
                      {series.map((s) => (
                        <li
                          key={s.key}
                          className={cn(
                            "flex items-center justify-between gap-3",
                            hover.key !== undefined &&
                              hover.key !== s.key &&
                              "opacity-45",
                          )}
                        >
                          <span className="flex items-center gap-1.5">
                            <span
                              aria-hidden
                              className="size-1.5 rounded-[1px]"
                              style={{ backgroundColor: s.hex }}
                            />
                            <span className="text-[10px] whitespace-nowrap text-fg-dim">
                              {s.label}
                            </span>
                          </span>
                          <span className="num text-[10px] whitespace-nowrap text-fg">
                            {valueFormat(s.values[index] ?? 0)}
                          </span>
                        </li>
                      ))}
                      {mode === "stacked" && series.length > 1 ? (
                        <li className="mt-0.5 flex items-center justify-between gap-3 border-t border-line pt-1">
                          <span className="text-[10px] text-fg-dim">Total</span>
                          <span className="num text-[10px] whitespace-nowrap text-fg">
                            {valueFormat(columnTotals[index] ?? 0)}
                          </span>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-1.5 flex gap-2">
            {labels.map((label) => (
              <span
                key={`${id}-label-${label}`}
                className="num flex-1 text-center text-[9.5px] text-fg-faint"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <figcaption className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-1.5 rounded-[1px]"
              style={{ backgroundColor: s.hex }}
            />
            <span className="text-[10px] text-fg-dim">{s.label}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
