"use client";

import Link from "next/link";
import { ArrowRight, CircleCheck, CircleX, RotateCcw } from "lucide-react";
import type { CompilationResponse } from "@/types/compilation";
import type { RecoveryAttempt, VerificationResult } from "@/types/verification";
import CountUp from "@/components/ui/CountUp";
import {
  REQUIREMENT_STATUS_STYLES,
  VERIFICATION_STYLES,
} from "@/config/statusStyles";
import { cn } from "@/lib/utils";
import {
  formatDuration,
  formatInt,
  formatTimestamp,
} from "@/lib/formatting";

/**
 * Run header. An operator opens this page to see the state of the last
 * compilation, so it leads with the run — id, task, outcome — and carries no
 * product pitch; the page description in the document head covers that.
 *
 * This section owns the headline transformation (original → compiled →
 * reduction) and the verify → recover → reverify ledger. Nothing below it on
 * the page should restate those figures.
 */
export function OverviewHeader({ run }: { run: CompilationResponse }) {
  const { metrics, verification } = run;
  const tone = VERIFICATION_STYLES[verification.status];
  const passed = verification.status === "pass";

  return (
    <section className="rounded-md border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5">
        <span className="num rounded-xs border border-line-strong bg-surface-inset px-1.5 py-0.5 text-[11px] text-fg">
          {run.runId}
        </span>
        <span className="num text-[11px] text-fg-dim">
          {formatTimestamp(run.createdAt)}
        </span>
        <span className="label-xs">{run.mode} runtime</span>
        <span className="num text-[11px] text-fg-dim">
          {formatDuration(metrics.latencyMs)}
        </span>

        <span
          className={cn(
            "ml-auto inline-flex items-center gap-1.5 rounded-xs border px-2 py-0.5 text-[10px] font-semibold tracking-[0.1em]",
            tone.bg,
            tone.border,
            tone.text,
          )}
          title={`${verification.satisfied} of ${verification.total} requirements satisfied`}
        >
          {passed ? <CircleCheck size={11} /> : <CircleX size={11} />}
          {passed ? "VERIFIED" : tone.label}
        </span>
      </div>

      <div className="grid gap-5 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <p className="label-xs">Task</p>
          <h2 className="mt-1.5 max-w-[68ch] text-[17px] leading-snug font-medium tracking-[-0.011em] text-fg">
            {run.task}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link
              href="/compiler"
              className="group inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.06em] text-fg uppercase transition-colors hover:text-signal"
            >
              Run the compiler
              <ArrowRight
                size={12}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
            <span aria-hidden className="h-3 w-px bg-line-strong" />
            <Link
              href="/stress-test"
              className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.06em] text-fg-dim uppercase transition-colors hover:text-fg"
            >
              Compare against naive optimization
            </Link>
          </div>
        </div>

        {/* ---------------------------------------------- headline numbers */}
        <div className="flex flex-wrap items-end gap-x-7 gap-y-4">
          <Figure
            label="Context available"
            value={metrics.originalTokens}
            caption="canonical tokens"
          />
          <span
            aria-hidden
            className="mb-7 hidden h-px w-6 bg-[repeating-linear-gradient(90deg,var(--color-line-strong)_0_3px,transparent_3px_6px)] sm:block"
          />
          <Figure
            label="Context sent"
            value={metrics.compiledTokens}
            caption={`${formatInt(metrics.tokensSaved)} tokens removed`}
            delay={0.25}
            tone="text-fg"
          />
          <Figure
            label="Reduction"
            value={metrics.tokenReduction * 100}
            decimals={1}
            suffix="%"
            caption="smaller than canonical"
            delay={0.45}
            tone="text-signal"
          />
        </div>
      </div>

      <AttemptLedger
        attempts={run.recoveryAttempts}
        verification={verification}
      />
    </section>
  );
}

/**
 * The two-attempt story in one dense strip: fail → recover → pass. Attempt
 * token totals are shown for the failed pass and as a delta for the recovered
 * one, so the compiled figure is stated exactly once on the page.
 */
function AttemptLedger({
  attempts,
  verification,
}: {
  attempts: RecoveryAttempt[];
  verification: VerificationResult;
}) {
  const first = attempts[0];
  const last = attempts.length > 1 ? attempts[attempts.length - 1] : undefined;
  if (!first) return null;

  const recoveredTone = REQUIREMENT_STATUS_STYLES.recovered;
  const addedTokens = last ? last.tokens - first.tokens : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line bg-surface-inset px-4 py-2.5">
      <span className="label-xs shrink-0">Verify → recover → reverify</span>
      <span aria-hidden className="h-3 w-px bg-line-strong" />

      <AttemptCell attempt={first} showTokens />

      {last ? (
        <>
          <ArrowRight size={11} className="shrink-0 text-fg-faint" aria-hidden />
          <span className="inline-flex items-center gap-1.5">
            <RotateCcw size={10} className={cn("shrink-0", recoveredTone.text)} />
            <span className="label-xs">Recovery</span>
            <span className={cn("num text-[12px] font-medium", recoveredTone.text)}>
              +{formatInt(addedTokens)}
            </span>
            <span className="num text-[10px] text-fg-faint">
              tok · {last.recoveredRefs.length} refs restored
            </span>
          </span>
          <ArrowRight size={11} className="shrink-0 text-fg-faint" aria-hidden />
          <AttemptCell attempt={last} />
        </>
      ) : null}

      <span className="num ml-auto text-[10px] text-fg-dim">
        {verification.satisfied}/{verification.total} requirements ·{" "}
        {verification.recoveryPasses} recovery pass
        {verification.recoveryPasses === 1 ? "" : "es"}
      </span>
    </div>
  );
}

function AttemptCell({
  attempt,
  showTokens = false,
}: {
  attempt: RecoveryAttempt;
  showTokens?: boolean;
}) {
  const tone = VERIFICATION_STYLES[attempt.status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="label-xs">Attempt {attempt.attempt}</span>
      <span className={cn("num text-[12px] font-medium", tone.text)}>
        {attempt.constraintsSatisfied}
        <span className="text-fg-faint">/{attempt.constraintsTotal}</span>
      </span>
      <span
        className={cn(
          "rounded-xs border px-1 py-px text-[9px] font-semibold tracking-[0.1em]",
          tone.bg,
          tone.border,
          tone.text,
        )}
      >
        {tone.label}
      </span>
      <span className="num text-[10px] text-fg-faint">
        {showTokens ? `${formatInt(attempt.tokens)} tok · ` : ""}
        {formatDuration(attempt.durationMs)}
      </span>
    </span>
  );
}

function Figure({
  label,
  value,
  caption,
  tone = "text-fg-muted",
  suffix,
  decimals,
  delay = 0,
}: {
  label: string;
  value: number;
  caption: string;
  tone?: string;
  suffix?: string;
  decimals?: number;
  delay?: number;
}) {
  return (
    <div>
      <p className="label-xs">{label}</p>
      <p className={cn("num mt-1 text-[24px] leading-none font-medium", tone)}>
        <CountUp
          to={value}
          separator=","
          duration={1.2}
          delay={delay}
          decimals={decimals}
          suffix={suffix}
        />
      </p>
      <p className="num mt-1 text-[10px] text-fg-faint">{caption}</p>
    </div>
  );
}
