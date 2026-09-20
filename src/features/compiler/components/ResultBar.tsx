"use client";

import type { ReactNode } from "react";
import { ArrowRight, CircleCheck, CircleX, Lock } from "lucide-react";
import type { CompilationResponse } from "@/types/compilation";
import CountUp from "@/components/ui/CountUp";
import { cn } from "@/lib/utils";

/**
 * Post-compilation summary strip. Everything a judge needs in one line.
 *
 * Rendered in both states so the row reserves its height before the first
 * run: the three panels below must not jump at the moment the result lands.
 */
export function ResultBar({ result }: { result: CompilationResponse | null }) {
  if (!result) return <PendingBar />;

  const { metrics, verification, recoveryAttempts } = result;

  // The constraint story is the product: the first attempt dropped one, the
  // second restored it. Derive both ends rather than reporting the happy one.
  const firstAttempt = recoveryAttempts[0];
  const lastAttempt = recoveryAttempts[recoveryAttempts.length - 1];
  const constraintsTotal =
    lastAttempt?.constraintsTotal ?? metrics.criticalConstraintsTotal;
  const firstSatisfied =
    firstAttempt?.constraintsSatisfied ?? metrics.criticalConstraintsPreserved;
  const finalSatisfied =
    lastAttempt?.constraintsSatisfied ?? metrics.criticalConstraintsPreserved;
  const attemptCount = recoveryAttempts.length || metrics.recoveryPasses + 1;
  const restored = finalSatisfied - firstSatisfied;

  return (
    <div className="animate-rise flex flex-wrap items-stretch gap-x-6 gap-y-4 rounded-lg border border-signal/20 bg-surface px-5 py-4">
      <Cell
        label="Original"
        value={
          <Figure value={metrics.originalTokens} className="text-fg-muted" />
        }
      />

      <div className="flex items-center self-center">
        <ArrowRight size={14} className="text-fg-faint" />
      </div>

      <Cell
        label="Compiled"
        value={
          <Figure
            value={metrics.compiledTokens}
            from={metrics.firstPassTokens}
            className="text-fg"
            delay={0.08}
          />
        }
      />

      <Divider />

      <Cell
        label="Token reduction"
        value={
          <Figure
            value={metrics.tokenReduction * 100}
            from={
              ((metrics.originalTokens - metrics.firstPassTokens) /
                metrics.originalTokens) *
              100
            }
            decimals={1}
            suffix="%"
            className="text-signal"
            delay={0.16}
          />
        }
      />

      <Divider />

      <Cell
        label="Critical constraints"
        value={
          restored > 0 ? (
            <>
              <span className="num flex items-center gap-1 text-[22px] leading-none font-medium text-danger">
                <CircleX size={12} className="text-danger/80" />
                {firstSatisfied} / {constraintsTotal}
              </span>
              <ArrowRight size={13} className="text-fg-faint" />
              <span className="num flex items-center gap-1.5 text-[22px] leading-none font-medium text-signal">
                <Lock size={13} className="text-signal/70" />
                {finalSatisfied} / {constraintsTotal}
              </span>
            </>
          ) : (
            <span className="num flex items-center gap-1.5 text-[22px] leading-none font-medium text-signal">
              <Lock size={13} className="text-signal/70" />
              {finalSatisfied} / {constraintsTotal}
            </span>
          )
        }
        sub={`attempt 1 → ${attemptCount} · ${metrics.recoveryPasses} recovery pass${
          metrics.recoveryPasses === 1 ? "" : "es"
        }`}
      />

      <Divider />

      <Cell
        label="Verification"
        value={
          <span
            className={cn(
              "flex items-center gap-1.5 text-[22px] leading-none font-semibold tracking-[0.02em]",
              verification.status === "pass" ? "text-signal" : "text-danger",
            )}
          >
            {verification.status === "pass" ? (
              <CircleCheck size={15} />
            ) : (
              <CircleX size={15} />
            )}
            {verification.status.toUpperCase()}
          </span>
        }
        sub={`${verification.satisfied} / ${verification.total} requirements`}
      />
    </div>
  );
}

/** Same structure, no numbers — holds the row's height before the first run. */
function PendingBar() {
  return (
    // Same 1px border and padding as the filled state, so the row does not
    // grow when the result lands.
    <div className="flex flex-wrap items-stretch gap-x-6 gap-y-4 rounded-lg border border-line bg-surface px-5 py-4">
      {[
        "Original",
        "Compiled",
        "Token reduction",
        "Critical constraints",
        "Verification",
      ].map((label, index) => (
        <div key={label} className="flex items-stretch gap-x-6">
          {index > 0 ? <Divider /> : null}
          <Cell
            label={label}
            value={
              <span className="num text-[22px] leading-none font-medium text-fg-faint">
                —
              </span>
            }
          />
        </div>
      ))}
      <span className="label-xs self-center">Awaiting run</span>
    </div>
  );
}

function Divider() {
  return (
    <span aria-hidden className="hidden w-px self-stretch bg-line sm:block" />
  );
}

/** One column of the strip. The fixed sub-line keeps every state the same height. */
function Cell({
  label,
  value,
  sub,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
}) {
  return (
    <div className="flex flex-col justify-center">
      <span className="label-xs">{label}</span>
      <div className="mt-1 flex h-[22px] items-center gap-1.5">{value}</div>
      <span className="num mt-1 block h-[12px] text-[10px] leading-[12px] text-fg-faint">
        {sub ?? ""}
      </span>
    </div>
  );
}

function Figure({
  value,
  from,
  className,
  suffix,
  decimals,
  delay = 0,
}: {
  value: number;
  /**
   * Where the count starts. Defaults to the target, i.e. no movement — a
   * result bar must never render a zero, however briefly, in a product whose
   * claim is that its numbers are verified. Callers pass the attempt-1 value
   * when the movement itself carries meaning.
   */
  from?: number;
  className?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}) {
  return (
    <span className={cn("num text-[22px] leading-none font-medium", className)}>
      <CountUp
        to={value}
        from={from ?? value}
        separator=","
        duration={0.7}
        delay={delay}
        decimals={decimals}
        suffix={suffix}
      />
    </span>
  );
}
