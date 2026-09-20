"use client";

import { CircleCheck, CircleX } from "lucide-react";
import type { StressTestVariant } from "@/types/stress-test";
import BorderGlow from "@/components/ui/BorderGlow";
import GlareHover from "@/components/ui/GlareHover";
import CountUp from "@/components/ui/CountUp";
import { Meter } from "@/components/ui/TokenBar";
import { cn } from "@/lib/utils";
import { formatDuration, formatPercent } from "@/lib/formatting";
import { ContextStrip } from "./ContextStrip";
import { ConstraintDiff } from "./ConstraintDiff";

/**
 * One of the three ways to feed the model. The Consolid8 column is the only
 * one that gets the edge treatment — it is the one that is both small and
 * correct.
 */
export function ComparisonColumn({
  variant,
  baseline,
  delay = 0,
}: {
  variant: StressTestVariant;
  baseline: number;
  delay?: number;
}) {
  const failed = variant.status === "fail";
  const winner = variant.id === "consolid8";
  const reduction = (baseline - variant.tokens) / baseline;

  const body = (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-md border bg-surface",
        winner
          ? "border-transparent"
          : failed
            ? "border-danger/25"
            : "border-line",
      )}
    >
      <header
        className={cn(
          "border-b px-4 py-3",
          failed
            ? "border-danger/20 bg-danger/[0.05]"
            : winner
              ? "border-signal/20 bg-signal/[0.05]"
              : "border-line bg-surface-inset/50",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-[13.5px] font-medium text-fg">
              {variant.name}
            </h3>
            <p className="truncate text-[11px] text-fg-dim">
              {variant.subtitle}
            </p>
          </div>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-xs border px-1.5 py-0.5 text-[10px] font-semibold tracking-[0.1em]",
              failed
                ? "border-danger/35 bg-danger/12 text-danger"
                : "border-signal/35 bg-signal/12 text-signal",
            )}
          >
            {failed ? <CircleX size={10} /> : <CircleCheck size={10} />}
            {failed ? "FAIL" : "PASS"}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
        <Cell label="Tokens">
          <span className="num text-[18px] leading-none text-fg">
            <CountUp to={variant.tokens} separator="," duration={1.1} delay={delay} />
          </span>
        </Cell>
        <Cell label="Constraints">
          <span
            className={cn(
              "num text-[18px] leading-none",
              failed ? "text-danger" : "text-signal",
            )}
          >
            {variant.constraintsSatisfied}
            <span className="text-fg-faint">/{variant.constraintsTotal}</span>
          </span>
        </Cell>
        <Cell label="Latency">
          <span className="num text-[18px] leading-none text-fg-muted">
            {formatDuration(variant.latencyMs)}
          </span>
        </Cell>
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="label-xs">Context size vs full</span>
            <span className="num text-[10px] text-fg-dim">
              {reduction > 0 ? `−${formatPercent(reduction)}` : "baseline"}
            </span>
          </div>
          <ContextStrip segments={variant.strip} baseline={baseline} />
        </div>

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="label-xs">Constraint survival</span>
            <span className="num text-[10px] text-fg-dim">
              {formatPercent(
                variant.constraintsSatisfied / variant.constraintsTotal,
                0,
              )}
            </span>
          </div>
          <Meter
            value={variant.constraintsSatisfied / variant.constraintsTotal}
            tone={failed ? "#ff5d5d" : "#3fd98b"}
            height={5}
          />
        </div>

        <div>
          <p className="label-xs mb-1.5">Method</p>
          <p className="text-[11.5px] leading-snug text-fg-muted">
            {variant.method}
          </p>
        </div>

        <div className="min-h-0 flex-1">
          <p className="label-xs mb-1.5">Constraints</p>
          <div className="max-h-[300px] overflow-y-auto pr-1">
            <ConstraintDiff constraints={variant.constraints} />
          </div>
        </div>
      </div>

      <footer
        className={cn(
          "mt-auto border-t px-4 py-3",
          failed
            ? "border-danger/20 bg-danger/[0.04]"
            : winner
              ? "border-signal/20 bg-signal/[0.04]"
              : "border-line",
        )}
      >
        <p
          className={cn(
            "text-[11.5px] leading-snug",
            failed ? "text-danger" : winner ? "text-signal" : "text-fg-muted",
          )}
        >
          {variant.verdict}
        </p>
      </footer>
    </div>
  );

  if (winner) {
    return (
      <BorderGlow
        borderRadius={7}
        glowRadius={22}
        glowIntensity={0.55}
        edgeSensitivity={26}
        className="h-full"
      >
        <GlareHover borderRadius="7px" glareOpacity={0.06} className="h-full">
          {body}
        </GlareHover>
      </BorderGlow>
    );
  }

  return body;
}

function Cell({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-3 py-2.5">
      <p className="label-xs truncate">{label}</p>
      <p className="mt-1.5">{children}</p>
    </div>
  );
}
