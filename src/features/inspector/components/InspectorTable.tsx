"use client";

import { useCallback, useRef, useState } from "react";
import { RotateCcw, ShieldAlert } from "lucide-react";
import type { ContextUnit } from "@/types/context";
import {
  AUTHORITY_LABELS,
  CLASSIFICATION_STYLES,
  REQUIREMENT_STATUS_STYLES,
  RISK_STYLES,
  TRUST_STYLES,
} from "@/config/statusStyles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Meter } from "@/components/ui/TokenBar";
import { cn } from "@/lib/utils";
import { formatInt, formatPercent } from "@/lib/formatting";
import type { SortKey } from "../types";

/**
 * Column budget. Everything except Context is a fixed width so the table
 * always fits its container at 1280px and wider — no horizontal scroll, and
 * the right-hand columns can never be clipped out of sight.
 *
 * Two budgets. At 1280px the inspector panel sits beside the 296px sidebar and
 * Context is squeezed to ~206px — 35 characters of a statement. So risk,
 * authority and relevance run on a tighter budget (and relevance drops its
 * meter, keeping the number) until 2xl, where the panel is wide enough to
 * afford the full chrome. The narrow widths are still wider than the largest
 * cell content they carry, so nothing new is clipped.
 *
 * "Included" is deliberately absent: it is fully derivable from Decision
 * (omitted and stale are the only classifications that are not included), so
 * it is folded into the Tokens cell, which strikes through the canonical cost
 * of any unit that never reached the compiled context.
 */
const COLUMNS: Array<{
  key: string;
  label: string;
  sort?: SortKey;
  align?: "right";
  width: string;
  title?: string;
}> = [
  { key: "context", label: "Context", width: "w-auto" },
  { key: "decision", label: "Decision", width: "w-[104px]" },
  { key: "risk", label: "Risk", sort: "risk", width: "w-[72px] 2xl:w-[82px]" },
  { key: "authority", label: "Authority", width: "w-[88px] 2xl:w-[104px]" },
  {
    key: "relevance",
    label: "Relevance",
    sort: "relevance",
    align: "right",
    width: "w-[76px] 2xl:w-[94px]",
  },
  {
    key: "tokens",
    label: "Tokens",
    sort: "tokens",
    align: "right",
    width: "w-[112px]",
    title: "Canonical tokens → compiled tokens. Struck through when the unit is not in the compiled context.",
  },
];

const PAGE_JUMP = 10;

/**
 * Every decision Consolid8 made, as a table. One row per context unit.
 *
 * Keyboard: the row list is a single tab stop (roving tabindex). Arrow keys
 * move between rows, Home/End jump to the ends, Enter or Space opens the
 * detail drawer.
 */
export function InspectorTable({
  units,
  sort,
  onSortChange,
  onSelect,
  selectedId,
}: {
  units: ContextUnit[];
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  onSelect: (unit: ContextUnit) => void;
  selectedId: string | null;
}) {
  const rowRefs = useRef<Array<HTMLTableRowElement | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const lastIndex = Math.max(0, units.length - 1);
  const rovingIndex = Math.min(focusedIndex, lastIndex);

  const moveFocus = useCallback(
    (target: number) => {
      const clamped = Math.max(0, Math.min(units.length - 1, target));
      setFocusedIndex(clamped);
      rowRefs.current[clamped]?.focus();
    },
    [units.length],
  );

  return (
    <table
      role="grid"
      aria-label="Context units"
      className="w-full table-fixed text-left"
    >
      <thead className="sticky top-0 z-10 bg-surface">
        <tr className="border-b border-line">
          {COLUMNS.map((column) => (
            <th
              key={column.key}
              scope="col"
              title={column.title}
              aria-sort={
                column.sort
                  ? sort === column.sort
                    ? "descending"
                    : "none"
                  : undefined
              }
              className={cn(
                "label-xs px-2 pt-1 pb-2 font-medium",
                column.width,
                column.align === "right" && "text-right",
              )}
            >
              {column.sort ? (
                <button
                  type="button"
                  onClick={() => onSortChange(column.sort!)}
                  className={cn(
                    // Preflight resets text-transform on <button>, so the
                    // uppercase from label-xs on the <th> does not reach the
                    // sortable headers without this.
                    "whitespace-nowrap uppercase transition-colors hover:text-fg-muted",
                    sort === column.sort && "text-fg",
                  )}
                >
                  {column.label}
                  {/* Fixed-width slot: the caret appearing must not reflow the
                      header row when the sort changes. */}
                  <span aria-hidden className="inline-block w-2 text-center">
                    {sort === column.sort ? "↓" : ""}
                  </span>
                </button>
              ) : (
                column.label
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {units.map((unit, index) => {
          const classification = CLASSIFICATION_STYLES[unit.classification];
          const risk = RISK_STYLES[unit.risk];
          const selected = unit.id === selectedId;

          return (
            <tr
              key={unit.id}
              ref={(node) => {
                rowRefs.current[index] = node;
              }}
              tabIndex={index === rovingIndex ? 0 : -1}
              onFocus={() => setFocusedIndex(index)}
              onClick={() => {
                setFocusedIndex(index);
                onSelect(unit);
              }}
              onKeyDown={(event) => {
                switch (event.key) {
                  case "ArrowDown":
                    event.preventDefault();
                    moveFocus(index + 1);
                    break;
                  case "ArrowUp":
                    event.preventDefault();
                    moveFocus(index - 1);
                    break;
                  case "PageDown":
                    event.preventDefault();
                    moveFocus(index + PAGE_JUMP);
                    break;
                  case "PageUp":
                    event.preventDefault();
                    moveFocus(index - PAGE_JUMP);
                    break;
                  case "Home":
                    event.preventDefault();
                    moveFocus(0);
                    break;
                  case "End":
                    event.preventDefault();
                    moveFocus(units.length - 1);
                    break;
                  case "Enter":
                  case " ":
                    event.preventDefault();
                    onSelect(unit);
                    break;
                  default:
                    break;
                }
              }}
              aria-selected={selected}
              className={cn(
                "cursor-pointer border-b border-line/50 transition-colors outline-none last:border-0",
                "focus-visible:outline focus-visible:-outline-offset-1 focus-visible:outline-line-strong",
                selected ? "bg-white/[0.045]" : "hover:bg-white/[0.022]",
              )}
            >
              <td className="px-2 py-1.5">
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className="mt-[6px] h-3 w-[2px] shrink-0 rounded-full"
                    style={{ backgroundColor: classification.hex }}
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] text-fg/90">
                      {unit.text}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 truncate text-[10px] text-fg-faint">
                      <span
                        className="min-w-0 truncate"
                        title={`${unit.label} · ${unit.ref}`}
                      >
                        {unit.label}
                        <span className="num"> · {unit.ref}</span>
                      </span>
                      {unit.recovered ? (
                        <RotateCcw
                          size={9}
                          aria-label="Restored by auto-recovery"
                          className={cn(
                            "shrink-0",
                            REQUIREMENT_STATUS_STYLES.recovered.text,
                          )}
                        />
                      ) : null}
                      {unit.trust === "untrusted" ? (
                        <ShieldAlert
                          size={9}
                          aria-label="Untrusted source"
                          className={cn(
                            "shrink-0",
                            TRUST_STYLES.untrusted.text,
                          )}
                        />
                      ) : null}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-2 py-1.5">
                <StatusBadge tone={classification} />
              </td>
              <td className="px-2 py-1.5">
                <StatusBadge tone={risk} variant="outline" />
              </td>
              <td className="px-2 py-1.5">
                <span
                  className="block truncate text-[11.5px] text-fg-muted"
                  title={AUTHORITY_LABELS[unit.authority]}
                >
                  {AUTHORITY_LABELS[unit.authority]}
                </span>
              </td>
              <td className="px-2 py-1.5">
                <div className="flex items-center justify-end gap-2">
                  <span className="hidden w-8 2xl:inline-block">
                    <Meter
                      value={unit.relevance}
                      tone={classification.hex}
                      className="w-8"
                      height={3}
                    />
                  </span>
                  <span className="num w-8 text-right text-[11.5px] text-fg-muted">
                    {formatPercent(unit.relevance, 0)}
                  </span>
                </div>
              </td>
              <td className="num px-2 py-1.5 text-right text-[11.5px] whitespace-nowrap text-fg-muted">
                {unit.included ? (
                  <>
                    {formatInt(unit.tokens)}
                    {unit.compiledTokens > 0 &&
                    unit.compiledTokens !== unit.tokens ? (
                      <span className="text-compressed">
                        {" "}
                        → {formatInt(unit.compiledTokens)}
                      </span>
                    ) : null}
                  </>
                ) : (
                  <>
                    <span className="text-fg-faint line-through">
                      {formatInt(unit.tokens)}
                    </span>
                    <span className="sr-only"> — not included</span>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
