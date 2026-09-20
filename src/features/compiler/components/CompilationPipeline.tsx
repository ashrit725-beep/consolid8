"use client";

import { useEffect, useRef } from "react";
import {
  CircleCheck,
  CircleX,
  LoaderCircle,
  RotateCcw,
  Route,
} from "lucide-react";
import type { CompilationResponse, StageStatus } from "@/types/compilation";
import type { RecoveryAttempt } from "@/types/verification";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Meter } from "@/components/ui/TokenBar";
import DecryptedText from "@/components/ui/DecryptedText";
import ShinyText from "@/components/ui/ShinyText";
import DotGrid from "@/components/ui/DotGrid";
import { cn } from "@/lib/utils";
import { formatDuration, formatInt } from "@/lib/formatting";
import type { StageView } from "../hooks/useCompilation";
import { useAnimatedNumber } from "../hooks/useAnimatedNumber";
import type { CompilerPhase } from "../types";

function StageGlyph({ status }: { status: StageStatus }) {
  switch (status) {
    case "running":
      return <LoaderCircle size={13} className="animate-spin text-info" />;
    case "done":
      return <CircleCheck size={13} className="text-signal" />;
    case "failed":
      return <CircleX size={13} className="text-danger" />;
    case "recovered":
      return <RotateCcw size={13} className="text-warn" />;
    default:
      return (
        <span className="block size-[9px] rounded-full border border-line-strong" />
      );
  }
}

/**
 * The visible runtime. Stage detail text is scrambled while a stage is
 * executing and resolves when it settles, so the panel reads as work
 * happening rather than a progress bar with captions.
 */
export function CompilationPipeline({
  phase,
  stages,
  progress,
  liveTokens,
  result,
  failedAttempt,
  recoveredRefs,
}: {
  phase: CompilerPhase;
  stages: StageView[];
  progress: number;
  liveTokens: number;
  result: CompilationResponse | null;
  failedAttempt: RecoveryAttempt | null;
  recoveredRefs: string[];
}) {
  const tokens = useAnimatedNumber(liveTokens, 700);
  const idle = phase === "ready" || phase === "empty";

  const scrollRef = useRef<HTMLDivElement>(null);

  // The stage the audience should be looking at: whichever is executing, or
  // the last one that settled once the run finishes.
  const focusStageId =
    stages.find((entry) => entry.status === "running")?.stage.id ??
    [...stages].reverse().find((entry) => entry.status !== "pending")?.stage
      .id ??
    null;

  // Re-run on every status change too: `verify` and `recover` grow taller when
  // they settle (the missing-constraint panel, the recovered-ref chips), and
  // that growth is exactly what pushes the payoff out of view.
  const stageSignature = stages
    .map((entry) => `${entry.stage.id}:${entry.status}`)
    .join("|");

  useEffect(() => {
    if (phase !== "running" && phase !== "complete") return;
    const container = scrollRef.current;
    if (!container || !focusStageId) return;
    const el = container.querySelector<HTMLElement>(
      `[data-stage="${focusStageId}"]`,
    );
    if (!el) return;

    const pad = 12;
    const containerRect = container.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    let delta = 0;
    if (rect.bottom > containerRect.bottom - pad) {
      delta = rect.bottom - containerRect.bottom + pad;
    } else if (rect.top < containerRect.top + pad) {
      delta = rect.top - containerRect.top - pad;
    }
    if (Math.abs(delta) < 1) return;

    const reduced =
      typeof window !== "undefined" &&
      (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false);

    container.scrollTo({
      top: container.scrollTop + delta,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [focusStageId, phase, stageSignature]);

  return (
    <Panel className="h-[var(--panel-h,620px)]">
      <PanelHeader
        title="Consolid8 pipeline"
        subtitle={
          phase === "running"
            ? "Executing"
            : phase === "complete"
              ? `Completed in ${formatDuration(result?.metrics.latencyMs ?? 0)}`
              : "Idle"
        }
        icon={<Route size={13} />}
        actions={
          <div className="text-right">
            <p className="num text-[15px] leading-none font-medium text-fg">
              {formatInt(tokens)}
            </p>
            <p className="label-xs mt-0.5">live tokens</p>
          </div>
        }
      />

      <div className="border-b border-line px-4 py-2.5">
        <Meter
          value={progress}
          tone={phase === "complete" ? "#3fd98b" : "#5aa2ff"}
          height={3}
        />
      </div>

      <div ref={scrollRef} className="relative min-h-0 flex-1 overflow-y-auto">
        {idle ? (
          <div className="absolute inset-0">
            <DotGrid
              dotSize={2}
              gap={20}
              baseColor="#141920"
              activeColor="#3fd98b"
              proximity={100}
            />
          </div>
        ) : null}

        <ol className="relative space-y-px p-3">
          {stages.map((entry, index) => {
            const { stage, status } = entry;
            const active = status === "running";
            const settled =
              status === "done" ||
              status === "failed" ||
              status === "recovered";

            return (
              <li key={stage.id} data-stage={stage.id}>
                <div
                  className={cn(
                    "relative flex gap-3 rounded-md border px-3 py-2.5 transition-colors duration-200",
                    active
                      ? "border-info/30 bg-info/[0.06]"
                      : status === "failed"
                        ? "border-danger/30 bg-danger/[0.05]"
                        : status === "recovered"
                          ? "border-warn/30 bg-warn/[0.05]"
                          : settled
                            ? "border-transparent bg-surface-raised/40"
                            : "border-transparent",
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className="flex size-4 items-center justify-center">
                      <StageGlyph status={status} />
                    </span>
                    {index < stages.length - 1 ? (
                      <span
                        aria-hidden
                        className={cn(
                          "mt-1 w-px flex-1 transition-colors duration-300",
                          settled ? "bg-line-strong" : "bg-line",
                        )}
                      />
                    ) : null}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          "text-[12px] font-medium tracking-[0.02em]",
                          active
                            ? "text-fg"
                            : settled
                              ? "text-fg-muted"
                              : "text-fg-faint",
                        )}
                      >
                        {active ? (
                          <ShinyText
                            text={stage.label}
                            speed={1.6}
                            color="#8b93a2"
                            shineColor="#ffffff"
                          />
                        ) : (
                          stage.label
                        )}
                      </span>
                      <span className="num shrink-0 text-[10px] text-fg-faint">
                        {settled ? formatDuration(stage.durationMs) : ""}
                      </span>
                    </div>

                    <p
                      className={cn(
                        "num mt-0.5 truncate text-[11px]",
                        active
                          ? "text-info"
                          : settled
                            ? "text-fg-dim"
                            : "text-fg-faint/60",
                      )}
                    >
                      {active ? (
                        <DecryptedText
                          text={stage.runningDetail}
                          animateOn="view"
                          sequential
                          speed={14}
                          revealDirection="start"
                          useOriginalCharsOnly={false}
                          className="text-info"
                          encryptedClassName="text-info/35"
                        />
                      ) : settled ? (
                        stage.doneDetail
                      ) : (
                        "Queued"
                      )}
                    </p>

                    {status === "failed" && failedAttempt ? (
                      <div className="mt-2 rounded-sm border border-danger/25 bg-danger/[0.07] px-2.5 py-2">
                        <p className="label-xs text-danger/85">
                          Verification failed · missing
                        </p>
                        {failedAttempt.missing.map((item) => (
                          <p
                            key={item}
                            className="mt-1 flex items-start gap-1.5 text-[12px] text-fg"
                          >
                            <span aria-hidden className="text-danger">
                              ✕
                            </span>
                            {item}
                          </p>
                        ))}
                      </div>
                    ) : null}

                    {status === "recovered" && recoveredRefs.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {recoveredRefs.map((ref) => (
                          <span
                            key={ref}
                            className="num rounded-xs border border-warn/25 bg-warn/10 px-1.5 py-px text-[10px] text-warn"
                          >
                            + {ref}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {idle ? (
        // In flow, not absolute: an absolutely positioned hint is pinned to the
        // scroll container's visible bottom, where it paints over the last
        // stage row ("Verifying") as soon as the list overflows. As a sibling
        // it reserves its own height and the list scrolls clear of it.
        <div className="shrink-0 border-t border-line bg-surface px-4 py-3">
          <p className="text-center text-[11px] text-fg-dim">
            Press{" "}
            <kbd className="num rounded-xs border border-line-strong px-1 py-px text-[10px] text-fg-muted">
              ⌘↵
            </kbd>{" "}
            or Compile to run the pipeline.
          </p>
        </div>
      ) : null}

      {phase === "complete" && result ? (
        <div
          className={cn(
            "flex shrink-0 items-center justify-between gap-3 border-t px-4 py-3",
            result.verification.status === "pass"
              ? "border-signal/25 bg-signal/[0.06]"
              : "border-danger/25 bg-danger/[0.06]",
          )}
        >
          <div className="flex items-center gap-2">
            {result.verification.status === "pass" ? (
              <CircleCheck size={15} className="text-signal" />
            ) : (
              <CircleX size={15} className="text-danger" />
            )}
            <div>
              <p
                className={cn(
                  "text-[12.5px] font-semibold",
                  result.verification.status === "pass"
                    ? "text-signal"
                    : "text-danger",
                )}
              >
                {result.verification.status === "pass"
                  ? "Verification passed"
                  : "Verification failed"}
              </p>
              <p className="num text-[10px] text-fg-dim">
                {result.verification.satisfied} / {result.verification.total}{" "}
                requirements · {result.metrics.recoveryPasses} recovery pass
                {result.metrics.recoveryPasses === 1 ? "" : "es"}
              </p>
            </div>
          </div>
          <span className="num text-[10px] text-fg-faint">
            {formatDuration(result.metrics.latencyMs)}
          </span>
        </div>
      ) : null}
    </Panel>
  );
}
