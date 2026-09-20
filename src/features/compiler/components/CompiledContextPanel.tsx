"use client";

import { useState } from "react";
import { ChevronDown, Layers } from "lucide-react";
import type { CompilationResponse } from "@/types/compilation";
import type { ContextUnit } from "@/types/context";
import { Panel, PanelFooter, PanelHeader } from "@/components/ui/Panel";
import FadeContent from "@/components/ui/FadeContent";
import { EmptyState } from "@/components/shared";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CLASSIFICATION_STYLES } from "@/config/statusStyles";
import { cn } from "@/lib/utils";
import { formatInt, formatPercent } from "@/lib/formatting";

/**
 * What the model actually receives, grouped into the sections Consolid8
 * assembles. Every section shows where its content came from.
 */
export function CompiledContextPanel({
  result,
  running,
  onSelectUnit,
  selectedUnitId,
}: {
  result: CompilationResponse | null;
  running: boolean;
  onSelectUnit: (unit: ContextUnit) => void;
  selectedUnitId: string | null;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({
    "sec-constraints": true,
    "sec-state": true,
  });

  const unitsById = new Map(
    (result?.originalContext ?? []).map((unit) => [unit.id, unit]),
  );

  return (
    <Panel className="h-[var(--panel-h,620px)]">
      <PanelHeader
        title="Compiled context"
        subtitle={
          result
            ? `${result.sections.length} sections · ${result.metrics.unitsIncluded} units`
            : running
              ? "Waiting for the pipeline"
              : "Not compiled yet"
        }
        icon={<Layers size={13} />}
        actions={
          result ? (
            <div className="flex items-center gap-2">
              <span className="num text-[13px] font-medium text-signal">
                {formatInt(result.metrics.compiledTokens)}
                <span className="text-[10px] text-fg-faint"> tok</span>
              </span>
              <span className="num rounded-xs border border-signal/25 bg-signal/10 px-1.5 py-px text-[10px] text-signal">
                −{formatPercent(result.metrics.tokenReduction)}
              </span>
            </div>
          ) : null
        }
      />

      {!result ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            title={running ? "Compiling..." : "Nothing compiled yet"}
            description={
              running
                ? "The compiled context appears here once verification completes."
                : undefined
            }
          />
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {result.sections.map((section, index) => {
              const expanded = open[section.id] ?? false;
              const share = section.tokens / result.metrics.compiledTokens;

              return (
                <FadeContent
                  key={section.id}
                  duration={320}
                  delay={index * 70}
                  threshold={0.02}
                >
                  <div className="overflow-hidden rounded-md border border-line bg-surface-inset">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() =>
                        setOpen((prev) => ({
                          ...prev,
                          [section.id]: !expanded,
                        }))
                      }
                      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.02]"
                    >
                      <ChevronDown
                        size={12}
                        className={cn(
                          "shrink-0 text-fg-faint transition-transform duration-200",
                          expanded ? "rotate-0" : "-rotate-90",
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[11px] font-semibold tracking-[0.08em] text-fg uppercase">
                            {section.title}
                          </span>
                          <span className="num shrink-0 text-[11px] text-fg-muted">
                            {formatInt(section.tokens)}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            aria-hidden
                            className="h-[3px] rounded-full bg-signal/45"
                            style={{
                              width: `${Math.max(2, share * 100)}%`,
                            }}
                          />
                          <span className="num text-[9.5px] text-fg-faint">
                            {formatPercent(share, 1)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {expanded ? (
                      <div className="border-t border-line px-3 py-2">
                        <p className="num mb-2 text-[10px] text-fg-faint">
                          {section.provenance}
                        </p>
                        <ul className="space-y-1">
                          {section.unitIds.map((unitId) => {
                            const unit = unitsById.get(unitId);
                            if (!unit) return null;
                            const style =
                              CLASSIFICATION_STYLES[unit.classification];
                            return (
                              <li key={unitId}>
                                <button
                                  type="button"
                                  onClick={() => onSelectUnit(unit)}
                                  className={cn(
                                    "flex w-full items-start gap-2 rounded-sm border px-2 py-1.5 text-left transition-colors",
                                    selectedUnitId === unitId
                                      ? "border-line-strong bg-surface-overlay"
                                      : "border-transparent hover:border-line hover:bg-white/[0.02]",
                                  )}
                                >
                                  <span
                                    aria-hidden
                                    className="mt-[5px] size-1.5 shrink-0 rounded-full"
                                    style={{ backgroundColor: style.hex }}
                                  />
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[11.5px] text-fg/85">
                                      {unit.text}
                                    </span>
                                    <span className="mt-0.5 flex items-center gap-1.5">
                                      <span className="num text-[9.5px] text-fg-faint">
                                        {unit.ref}
                                      </span>
                                      <StatusBadge tone={style} />
                                      {unit.recovered ? (
                                        <span className="num text-[9.5px] text-warn">
                                          recovered
                                        </span>
                                      ) : null}
                                    </span>
                                  </span>
                                  <span className="num shrink-0 text-[10px] text-fg-dim">
                                    {formatInt(unit.compiledTokens)}
                                  </span>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                </FadeContent>
              );
            })}
          </div>

          <PanelFooter className="justify-between">
            <span className="num text-[10px] text-fg-faint">
              {formatInt(result.metrics.tokensSaved)} tokens removed from{" "}
              {formatInt(result.metrics.originalTokens)}
            </span>
            <span className="num text-[10px] text-signal">
              {formatPercent(result.metrics.tokenReduction)} reduction
            </span>
          </PanelFooter>
        </>
      )}
    </Panel>
  );
}
