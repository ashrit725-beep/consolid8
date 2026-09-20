"use client";

import type { ReactNode } from "react";
import { ArrowRight, Link2Off } from "lucide-react";
import type { ContextUnit } from "@/types/context";
import {
  AUTHORITY_LABELS,
  CLASSIFICATION_STYLES,
  RISK_STYLES,
} from "@/config/statusStyles";
import { Drawer } from "@/components/ui/Drawer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Meter } from "@/components/ui/TokenBar";
import { SourceTrustBadge } from "./SourceTrust";
import { formatInt, formatPercent } from "@/lib/formatting";
import { cn } from "@/lib/utils";

/**
 * Full decision record for one context unit. Shared by the Compiler and the
 * Inspector — there is exactly one of these in the product.
 */
export function ContextDetailDrawer({
  unit,
  units,
  onClose,
  onSelectUnit,
}: {
  unit: ContextUnit | null;
  /** Used to resolve supersedes / superseded-by links. */
  units: ContextUnit[];
  onClose: () => void;
  onSelectUnit?: (unit: ContextUnit) => void;
}) {
  if (!unit) return null;

  const classification = CLASSIFICATION_STYLES[unit.classification];
  const risk = RISK_STYLES[unit.risk];
  // Supersession runs in both directions and is not one-to-one: a single
  // message can replace several earlier ones. Resolve every link, not the
  // first match.
  const related = resolveRelated(unit, units);
  // "9 → 0" would read as if the text had been compressed away. An omitted
  // unit was not compressed, it was left out.
  const compressed =
    unit.included && unit.compiledTokens !== unit.tokens;

  return (
    <Drawer
      open={Boolean(unit)}
      onClose={onClose}
      title={unit.label}
      subtitle={unit.ref}
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="label-xs">Included in compiled context</span>
          <span
            className={cn(
              "rounded-xs border px-2 py-0.5 text-[11px] font-semibold tracking-[0.08em]",
              unit.included
                ? "border-signal/30 bg-signal/10 text-signal"
                : "border-omitted/30 bg-omitted/10 text-omitted",
            )}
          >
            {unit.included ? "YES" : "NO"}
          </span>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <section>
          <p className="label-xs mb-1.5">Text</p>
          <blockquote className="rounded-md border-l-2 bg-surface-inset px-3 py-2.5 text-[13px] leading-relaxed text-fg" style={{ borderLeftColor: classification.hex }}>
            {unit.text}
          </blockquote>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <Field label="Decision">
            <StatusBadge tone={classification} size="sm" />
          </Field>
          <Field label="Risk">
            <StatusBadge tone={risk} size="sm" variant="outline" />
          </Field>
          <Field label="Authority">
            <span className="text-[12px] text-fg">
              {AUTHORITY_LABELS[unit.authority]}
            </span>
          </Field>
          <Field label="Source trust">
            <SourceTrustBadge trust={unit.trust} showAuthority={false} />
          </Field>
        </section>

        <section className="grid grid-cols-2 gap-2">
          <Field label="Relevance to task">
            <div>
              <span className="num text-[15px] text-fg">
                {formatPercent(unit.relevance, 0)}
              </span>
              <Meter
                className="mt-1.5"
                value={unit.relevance}
                tone={classification.hex}
              />
            </div>
          </Field>
          <Field label="Tokens">
            <div className="flex items-baseline gap-2">
              <span className="num text-[15px] text-fg">
                {formatInt(unit.tokens)}
              </span>
              {compressed ? (
                <span className="num text-[11px] text-compressed">
                  → {formatInt(unit.compiledTokens)}
                </span>
              ) : null}
            </div>
          </Field>
        </section>

        <section>
          <p className="label-xs mb-1.5">Why Consolid8 decided this</p>
          <p className="text-[12.5px] leading-relaxed text-fg-muted">
            {unit.reason}
          </p>
        </section>

        {unit.dependencies.length > 0 ? (
          <section>
            <p className="label-xs mb-1.5">Dependencies</p>
            <div className="flex flex-wrap gap-1">
              {unit.dependencies.map((dependency) => (
                <span
                  key={dependency}
                  className="rounded-xs border border-line bg-surface-inset px-2 py-0.5 text-[11px] text-fg-muted"
                >
                  {dependency}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section>
            <p className="label-xs mb-1.5">
              {related.length === 1 ? "Supersession" : `Supersession · ${related.length} links`}
            </p>
            <div className="flex flex-col gap-1.5">
              {related.map(({ unit: link, direction }) => (
                <button
                  key={link.id}
                  type="button"
                  onClick={() => onSelectUnit?.(link)}
                  disabled={!onSelectUnit}
                  className="flex w-full items-center gap-2.5 rounded-md border border-line bg-surface-inset px-3 py-2 text-left transition-colors enabled:hover:border-line-strong"
                >
                  {direction === "superseded_by" ? (
                    <Link2Off size={13} className="shrink-0 text-stale" />
                  ) : (
                    <ArrowRight size={13} className="shrink-0 text-pinned" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="label-xs block">
                      {direction === "superseded_by"
                        ? "Superseded by"
                        : "Supersedes"}
                    </span>
                    <span className="block truncate text-[12px] text-fg">
                      {link.text}
                    </span>
                    <span className="num text-[10px] text-fg-faint">
                      {link.ref}
                    </span>
                  </span>
                  <StatusBadge
                    tone={CLASSIFICATION_STYLES[link.classification]}
                  />
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {unit.recovered ? (
          <section className="rounded-md border border-warn/25 bg-warn/[0.06] px-3 py-2.5">
            <p className="label-xs text-warn">Restored by auto-recovery</p>
            <p className="mt-1 text-[12px] leading-snug text-fg-muted">
              This unit was dropped on the first compilation pass. Verification
              detected the gap and Consolid8 restored it before returning a
              result.
            </p>
          </section>
        ) : null}
      </div>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-md border border-line bg-surface-inset px-3 py-2">
      <p className="label-xs mb-1.5">{label}</p>
      {children}
    </div>
  );
}

type SupersessionDirection = "supersedes" | "superseded_by";

interface RelatedUnit {
  unit: ContextUnit;
  direction: SupersessionDirection;
}

/**
 * Every supersession link touching this unit, in both directions:
 * the units it replaced, and the units that replaced it.
 */
function resolveRelated(unit: ContextUnit, units: ContextUnit[]): RelatedUnit[] {
  const seen = new Set<string>();
  const related: RelatedUnit[] = [];
  const push = (candidate: ContextUnit | undefined, direction: SupersessionDirection) => {
    if (!candidate || candidate.id === unit.id || seen.has(candidate.id)) return;
    seen.add(candidate.id);
    related.push({ unit: candidate, direction });
  };

  for (const candidate of units) {
    if (unit.supersedes && candidate.id === unit.supersedes) {
      push(candidate, "supersedes");
    }
    if (unit.supersededBy && candidate.id === unit.supersededBy) {
      push(candidate, "superseded_by");
    }
    // Reverse links: declared on the other unit.
    if (candidate.supersededBy === unit.id) push(candidate, "supersedes");
    if (candidate.supersedes === unit.id) push(candidate, "superseded_by");
  }

  return related;
}
