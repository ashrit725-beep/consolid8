"use client";

import { Fragment } from "react";
import {
  ArrowRight,
  Check,
  CircleCheck,
  CircleX,
  RotateCcw,
  X,
} from "lucide-react";
import type { CompilationResponse } from "@/types/compilation";
import {
  REQUIREMENT_CATEGORY_LABELS,
  VERIFICATION_STYLES,
} from "@/config/statusStyles";
import CountUp from "@/components/ui/CountUp";
import { cn } from "@/lib/utils";
import { formatInt, formatTimestamp } from "@/lib/formatting";

/**
 * The verdict, the attempt sequence that produced it, and the group counts.
 * The sequence is the header's primary visual: 11/12 → auto-recovery → 12/12.
 */
export function VerificationHeader({ run }: { run: CompilationResponse }) {
  const { verification, metrics } = run;
  const passed = verification.status === "pass";
  const attempts = run.recoveryAttempts;

  return (
    <section
      className={cn(
        "rounded-md border bg-surface",
        passed ? "border-signal/25" : "border-danger/25",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-md border",
              passed
                ? "border-signal/30 bg-signal/10 text-signal"
                : "border-danger/30 bg-danger/10 text-danger",
            )}
          >
            {passed ? <CircleCheck size={17} /> : <CircleX size={17} />}
          </span>
          <div>
            <h2
              className={cn(
                "text-[17px] leading-tight font-medium tracking-[-0.011em]",
                passed ? "text-signal" : "text-danger",
              )}
            >
              Verification {passed ? "passed" : "failed"}
            </h2>
            <p className="num text-[11px] text-fg-dim">
              {run.runId} · checked {formatTimestamp(verification.checkedAt)}
            </p>
          </div>
        </div>

        <div className="flex items-end gap-6">
          <div>
            <p className="label-xs">Requirements satisfied</p>
            <p className="num mt-1 text-[24px] leading-none font-medium text-fg">
              <CountUp to={verification.satisfied} duration={1} />
              <span className="text-fg-faint">/{verification.total}</span>
            </p>
          </div>
          <div>
            <p className="label-xs">Recovery passes</p>
            <p className="num mt-1 text-[24px] leading-none font-medium text-warn">
              {verification.recoveryPasses}
            </p>
          </div>
          <div className="hidden sm:block">
            <p className="label-xs">Compiled tokens</p>
            <p className="num mt-1 text-[24px] leading-none font-medium text-fg">
              {formatInt(metrics.compiledTokens)}
            </p>
          </div>
        </div>
      </div>

      {attempts.length > 0 ? (
        <ol className="flex flex-wrap items-stretch gap-x-2 gap-y-2 border-b border-line px-4 py-3">
          {attempts.map((attempt, index) => {
            const previous = attempts[index - 1];
            const failed = attempt.status === "fail";
            const tone = failed
              ? VERIFICATION_STYLES.fail
              : VERIFICATION_STYLES.pass;
            const added = previous ? attempt.tokens - previous.tokens : 0;

            return (
              <Fragment key={attempt.attempt}>
                {previous ? (
                  <li
                    className="flex items-center gap-2 px-1"
                    aria-label="Auto-recovery between attempts"
                  >
                    <ArrowRight
                      size={12}
                      className="text-fg-faint"
                      aria-hidden
                    />
                    <span className="flex items-center gap-1.5 rounded-xs border border-warn/25 bg-warn/10 px-2 py-1">
                      <RotateCcw size={11} className="text-warn" aria-hidden />
                      <span className="label-xs text-warn">Auto-recovery</span>
                      <span className="num text-[11px] text-warn">
                        +{formatInt(added)} tok
                      </span>
                      <span className="num hidden text-[11px] text-fg-dim sm:inline">
                        · {attempt.recoveredRefs.length} refs restored
                      </span>
                    </span>
                  </li>
                ) : null}

                <li
                  className={cn(
                    "flex items-center gap-2.5 rounded-xs border px-2.5 py-1.5",
                    failed
                      ? "border-danger/25 bg-danger/[0.06]"
                      : "border-signal/25 bg-signal/[0.06]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-xs border",
                      failed
                        ? "border-danger/40 bg-danger/10 text-danger"
                        : "border-signal/35 bg-signal/10 text-signal",
                    )}
                    aria-hidden
                  >
                    {failed ? (
                      <X size={10} strokeWidth={3} />
                    ) : (
                      <Check size={10} strokeWidth={3} />
                    )}
                  </span>
                  <span className="label-xs text-fg-muted">
                    Attempt {attempt.attempt}
                  </span>
                  <span className={cn("num text-[13px]", tone.text)}>
                    {attempt.constraintsSatisfied}
                    <span className="text-fg-faint">
                      {" "}
                      / {attempt.constraintsTotal}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-semibold tracking-[0.08em] uppercase",
                      tone.text,
                    )}
                  >
                    {tone.label}
                  </span>
                  <span className="num text-[11px] text-fg-dim">
                    {formatInt(attempt.tokens)}
                    <span className="text-fg-faint"> tok</span>
                  </span>
                </li>
              </Fragment>
            );
          })}
        </ol>
      ) : null}

      <ul className="flex flex-wrap items-center gap-x-6 gap-y-1.5 px-4 py-2.5">
        {verification.groups.map((group) => {
          const complete = group.passed === group.total;
          return (
            <li key={group.category} className="flex items-center gap-2">
              {complete ? (
                <Check size={11} className="text-signal/70" aria-hidden />
              ) : (
                <X size={11} className="text-danger" aria-hidden />
              )}
              <span className="label-xs">
                {REQUIREMENT_CATEGORY_LABELS[group.category]}
              </span>
              <span
                className={cn(
                  "num text-[12px]",
                  complete ? "text-fg" : "text-danger",
                )}
              >
                {group.passed}
                <span className="text-fg-faint"> / {group.total}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
