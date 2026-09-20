"use client";

import { useState } from "react";
import { ArrowUpRight, Check, RotateCcw, X } from "lucide-react";
import type {
  RequirementCategory,
  VerificationRequirement,
} from "@/types/verification";
import type { ContextUnit } from "@/types/context";
import {
  REQUIREMENT_CATEGORY_LABELS,
  REQUIREMENT_STATUS_STYLES,
  RISK_STYLES,
} from "@/config/statusStyles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import FadeContent from "@/components/ui/FadeContent";
import { cn } from "@/lib/utils";

type Filter = "all" | RequirementCategory | "recovered";

/**
 * Every requirement Consolid8 extracted, with the evidence that satisfies it.
 * Status is carried by an icon and a word, never by colour alone.
 */
export function RequirementList({
  requirements,
  units,
  onSelectEvidence,
}: {
  requirements: VerificationRequirement[];
  units: ContextUnit[];
  onSelectEvidence: (unit: ContextUnit) => void;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const categories: RequirementCategory[] = [
    "critical_fact",
    "policy",
    "dependency",
    "current_state",
  ];

  const tabs: TabItem<Filter>[] = [
    { value: "all", label: "All", count: requirements.length },
    ...categories.map((category) => ({
      value: category as Filter,
      label: REQUIREMENT_CATEGORY_LABELS[category],
      count: requirements.filter((r) => r.category === category).length,
    })),
    {
      value: "recovered",
      label: "Recovered",
      count: requirements.filter((r) => r.status === "recovered").length,
      hex: REQUIREMENT_STATUS_STYLES.recovered.hex,
    },
  ];

  const visible = requirements.filter((requirement) => {
    if (filter === "all") return true;
    if (filter === "recovered") return requirement.status === "recovered";
    return requirement.category === filter;
  });

  return (
    <>
      <Tabs
        className="shrink-0 px-3"
        label="Requirement category"
        value={filter}
        items={tabs}
        onChange={setFilter}
      />

      <ul className="h-0 min-h-[560px] grow divide-y divide-line/70 overflow-y-auto">
        {visible.map((requirement, index) => {
          const status = REQUIREMENT_STATUS_STYLES[requirement.status];
          const evidence = units.find(
            (unit) => unit.id === requirement.evidenceUnitId,
          );
          const recovered = requirement.status === "recovered";

          const rowClass = cn(
            "group flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/[0.02]",
            evidence && "cursor-pointer",
            recovered && "bg-warn/[0.035]",
          );

          const body = (
            <>
              <span
                className={cn(
                  "mt-px flex size-4 shrink-0 items-center justify-center rounded-xs border",
                  requirement.status === "missing"
                    ? "border-danger/40 bg-danger/10 text-danger"
                    : recovered
                      ? "border-warn/40 bg-warn/10 text-warn"
                      : "border-signal/35 bg-signal/10 text-signal",
                )}
                aria-hidden
              >
                {requirement.status === "missing" ? (
                  <X size={10} strokeWidth={3} />
                ) : recovered ? (
                  <RotateCcw size={9} strokeWidth={2.5} />
                ) : (
                  <Check size={10} strokeWidth={3} />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="text-[12.5px] leading-snug text-fg">
                    {requirement.statement}
                  </span>
                  <span className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge
                      tone={RISK_STYLES[requirement.risk]}
                      variant="outline"
                    />
                    <StatusBadge tone={status} />
                  </span>
                </span>

                <span className="mt-1 block text-[11.5px] leading-snug text-fg-dim">
                  {requirement.detail}
                </span>

                <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="num text-[10px] text-fg-faint">
                    {requirement.source}
                  </span>
                  {evidence ? (
                    <span className="flex items-center gap-0.5 text-[10px] tracking-[0.06em] text-fg-dim uppercase underline decoration-line-strong underline-offset-2 transition-colors group-hover:text-fg">
                      View evidence
                      <ArrowUpRight size={10} aria-hidden />
                    </span>
                  ) : null}
                </span>
              </span>
            </>
          );

          return (
            <li key={requirement.id}>
              <FadeContent duration={280} delay={Math.min(index, 10) * 24}>
                {evidence ? (
                  <button
                    type="button"
                    className={rowClass}
                    onClick={() => onSelectEvidence(evidence)}
                    aria-label={`View evidence for: ${requirement.statement}`}
                  >
                    {body}
                  </button>
                ) : (
                  <div className={rowClass}>{body}</div>
                )}
              </FadeContent>
            </li>
          );
        })}
      </ul>
    </>
  );
}
