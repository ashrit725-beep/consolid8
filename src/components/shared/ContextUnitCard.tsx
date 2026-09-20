"use client";

import { Lock, RotateCcw, ShieldAlert } from "lucide-react";
import type { ContextUnit } from "@/types/context";
import { CLASSIFICATION_STYLES, RISK_STYLES } from "@/config/statusStyles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";
import { formatInt } from "@/lib/formatting";

/**
 * One unit of context, rendered identically wherever it appears:
 * canonical panel, compiled panel, inspector results and search.
 */
export function ContextUnitCard({
  unit,
  selected = false,
  onSelect,
  density = "comfortable",
  showClassification = true,
  className,
}: {
  unit: ContextUnit;
  selected?: boolean;
  onSelect?: (unit: ContextUnit) => void;
  density?: "comfortable" | "compact";
  showClassification?: boolean;
  className?: string;
}) {
  const classification = CLASSIFICATION_STYLES[unit.classification];
  const risk = RISK_STYLES[unit.risk];
  const interactive = Boolean(onSelect);

  return (
    <article
      onClick={onSelect ? () => onSelect(unit) : undefined}
      onKeyDown={
        onSelect
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelect(unit);
              }
            }
          : undefined
      }
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? "button" : undefined}
      aria-label={interactive ? `${unit.label}: ${unit.text}` : undefined}
      className={cn(
        "group relative rounded-md border bg-surface-raised/60 transition-all duration-150",
        density === "compact" ? "px-2.5 py-2" : "px-3 py-2.5",
        selected
          ? "border-line-strong bg-surface-overlay"
          : "border-line hover:border-line-strong hover:bg-surface-raised",
        interactive && "cursor-pointer",
        !unit.included && "opacity-60 hover:opacity-90",
        className,
      )}
    >
      {/* Classification accent rail — a second, non-colour-only cue is the badge. */}
      <span
        aria-hidden
        className="absolute inset-y-1.5 left-0 w-px rounded-full"
        style={{ backgroundColor: classification.hex, opacity: 0.55 }}
      />

      <header className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="num truncate text-[10px] text-fg-faint">
            {unit.ref}
          </span>
          <span className="text-fg-faint/40">·</span>
          <span className="truncate text-[11px] font-medium text-fg-muted">
            {unit.label}
          </span>
          {unit.recovered ? (
            <RotateCcw
              size={10}
              className="shrink-0 text-warn"
              aria-label="Restored by auto-recovery"
            />
          ) : null}
          {unit.trust === "untrusted" ? (
            <ShieldAlert
              size={10}
              className="shrink-0 text-conflict"
              aria-label="Untrusted source"
            />
          ) : null}
          {unit.risk === "critical" && unit.included ? (
            <Lock
              size={9}
              className="shrink-0 text-critical/70"
              aria-label="Critical"
            />
          ) : null}
        </div>
        <span className="num shrink-0 text-[10px] text-fg-dim">
          {formatInt(unit.tokens)}
          <span className="text-fg-faint"> tok</span>
        </span>
      </header>

      <p
        className={cn(
          "mt-1 text-[12px] leading-snug text-fg/85",
          density === "compact" ? "line-clamp-1" : "line-clamp-2",
        )}
      >
        {unit.text}
      </p>

      {showClassification ? (
        <footer className="mt-1.5 flex items-center gap-1.5">
          <StatusBadge tone={classification} />
          {unit.risk === "critical" || unit.risk === "high" ? (
            <StatusBadge tone={risk} variant="outline" />
          ) : null}
          {unit.compiledTokens > 0 && unit.compiledTokens !== unit.tokens ? (
            <span className="num text-[10px] text-compressed">
              → {formatInt(unit.compiledTokens)}
            </span>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
