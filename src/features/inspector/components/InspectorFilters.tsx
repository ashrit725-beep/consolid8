"use client";

import { Funnel, RotateCcw, X } from "lucide-react";
import type { ContextUnit } from "@/types/context";
import {
  AUTHORITY_LABELS,
  AUTHORITY_ORDER,
  REQUIREMENT_STATUS_STYLES,
  RISK_ORDER,
  RISK_STYLES,
} from "@/config/statusStyles";
import { SearchInput, SelectInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";
import type { InspectorFilters as Filters } from "../types";

export function InspectorFilterBar({
  filters,
  onChange,
  onReset,
  resultCount,
  recoveredCount,
  units,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  resultCount: number;
  /** Units restored by auto-recovery — the target of the RECOVERED view. */
  recoveredCount: number;
  units: ContextUnit[];
}) {
  const active =
    filters.tab !== "all" ||
    filters.risk !== "any" ||
    filters.authority !== "any" ||
    filters.included !== "any" ||
    filters.query.length > 0;

  const recovered = REQUIREMENT_STATUS_STYLES.recovered;
  const showingRecovered = filters.tab === "recovered";

  const authoritiesPresent = AUTHORITY_ORDER.filter((authority) =>
    units.some((unit) => unit.authority === authority),
  );

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-line px-4 py-2.5">
      <span className="flex items-center gap-1.5 text-fg-faint">
        <Funnel size={12} />
      </span>

      <SearchInput
        label="Search context units"
        value={filters.query}
        onChange={(query) => onChange({ query })}
        placeholder="Search text, source or reason..."
        className="w-full max-w-[220px]"
      />

      <SelectInput
        label="Risk"
        value={filters.risk}
        onChange={(risk) => onChange({ risk })}
        options={[
          { value: "any", label: "Risk: any" },
          ...RISK_ORDER.map((risk) => ({
            value: risk,
            label: `Risk: ${RISK_STYLES[risk].label.toLowerCase()}`,
          })),
        ]}
      />

      <SelectInput
        label="Authority"
        value={filters.authority}
        onChange={(authority) => onChange({ authority })}
        options={[
          { value: "any", label: "Authority: any" },
          ...authoritiesPresent.map((authority) => ({
            value: authority,
            label: AUTHORITY_LABELS[authority],
          })),
        ]}
      />

      <SelectInput
        label="Included"
        value={filters.included}
        onChange={(included) => onChange({ included })}
        options={[
          { value: "any", label: "Included: any" },
          { value: "yes", label: "Included: yes" },
          { value: "no", label: "Included: no" },
        ]}
      />

      {/* The recovered view lives here rather than in the tab strip: the strip
          is already full at 1280-1512px, and this toggle stays visible. */}
      <button
        type="button"
        aria-pressed={showingRecovered}
        onClick={() => onChange({ tab: showingRecovered ? "all" : "recovered" })}
        title={recovered.hint}
        className={cn(
          "flex h-7 shrink-0 items-center gap-1.5 rounded-sm border px-2 text-[11px] font-medium tracking-[0.06em] uppercase transition-colors",
          showingRecovered
            ? [recovered.bg, recovered.border, recovered.text]
            : "border-line bg-surface-inset text-fg-dim hover:border-line-strong hover:text-fg-muted",
        )}
      >
        <RotateCcw size={11} aria-hidden />
        {recovered.label}
        <span
          className={cn(
            "num rounded-xs px-1 py-px text-[10px]",
            showingRecovered ? "bg-white/8 text-fg-muted" : "bg-white/4 text-fg-faint",
          )}
        >
          {recoveredCount}
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <span className="num text-[11px] text-fg-dim">
          {resultCount} {resultCount === 1 ? "unit" : "units"}
        </span>
        <button
          type="button"
          onClick={onReset}
          disabled={!active}
          className={cn(
            "flex items-center gap-1 rounded-xs px-1.5 py-1 text-[10px] tracking-[0.06em] uppercase transition-colors",
            active
              ? "text-fg-dim hover:bg-white/5 hover:text-fg"
              : "cursor-not-allowed text-fg-faint/50",
          )}
        >
          <X size={10} />
          Clear
        </button>
      </div>
    </div>
  );
}
