import { ArrowDown, CircleCheck, CircleX, RotateCcw } from "lucide-react";
import type { RecoveryAttempt } from "@/types/verification";
import { cn } from "@/lib/utils";
import { formatDuration, formatInt } from "@/lib/formatting";

/**
 * The proof that Consolid8 is not a summarizer: a failed pass, an automatic
 * repair, and a second pass that succeeds. Reused on Verification, Compiler
 * and anywhere recovery needs explaining.
 */
export function RecoveryTimeline({
  attempts,
  className,
  dense = false,
}: {
  attempts: RecoveryAttempt[];
  className?: string;
  dense?: boolean;
}) {
  if (attempts.length === 0) return null;

  return (
    <ol className={cn("flex flex-col", className)}>
      {attempts.map((attempt, index) => {
        const failed = attempt.status === "fail";
        const isLast = index === attempts.length - 1;
        return (
          <li key={attempt.attempt}>
            <div
              className={cn(
                "rounded-md border bg-surface-inset transition-colors",
                dense ? "px-3 py-2.5" : "px-3.5 py-3",
                failed
                  ? "border-danger/25 bg-danger/[0.04]"
                  : "border-signal/25 bg-signal/[0.04]",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {failed ? (
                    <CircleX size={13} className="text-danger" aria-hidden />
                  ) : (
                    <CircleCheck size={13} className="text-signal" aria-hidden />
                  )}
                  <span className="label-xs text-fg-muted">
                    Attempt {attempt.attempt}
                  </span>
                  <span
                    className={cn(
                      "rounded-xs border px-1.5 py-px text-[10px] font-semibold tracking-[0.08em]",
                      failed
                        ? "border-danger/30 bg-danger/10 text-danger"
                        : "border-signal/30 bg-signal/10 text-signal",
                    )}
                  >
                    {failed ? "FAIL" : "PASS"}
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="num text-[12px] text-fg">
                    {formatInt(attempt.tokens)}
                    <span className="text-fg-faint"> tok</span>
                  </span>
                  <span
                    className={cn(
                      "num text-[12px]",
                      failed ? "text-danger" : "text-signal",
                    )}
                  >
                    {attempt.constraintsSatisfied} / {attempt.constraintsTotal}
                  </span>
                  <span className="num hidden text-[10px] text-fg-faint sm:inline">
                    {formatDuration(attempt.durationMs)}
                  </span>
                </div>
              </div>

              {attempt.missing.length > 0 ? (
                <div className="mt-2 border-t border-danger/15 pt-2">
                  <p className="label-xs text-danger/80">Missing</p>
                  <ul className="mt-1 space-y-0.5">
                    {attempt.missing.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-1.5 text-[12px] text-fg"
                      >
                        <span aria-hidden className="text-danger">
                          ✕
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {attempt.recoveredRefs.length > 0 ? (
                <div className="mt-2 border-t border-line pt-2">
                  <p className="label-xs">Restored</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {attempt.recoveredRefs.map((ref) => (
                      <span
                        key={ref}
                        className="num rounded-xs border border-warn/25 bg-warn/10 px-1.5 py-px text-[10px] text-warn"
                      >
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              <p className="mt-2 text-[11.5px] leading-snug text-fg-muted">
                {attempt.note}
              </p>
            </div>

            {!isLast ? (
              <div className="flex items-center gap-2 py-1.5 pl-3.5">
                <RotateCcw size={11} className="text-warn" aria-hidden />
                <span className="label-xs text-warn">Auto-recovery</span>
                <ArrowDown size={11} className="text-fg-faint" aria-hidden />
              </div>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
