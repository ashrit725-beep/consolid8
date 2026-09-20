import Link from "next/link";
import { CircleCheck, CircleX, Loader, RotateCcw } from "lucide-react";
import type { CompilationRun, RunStatus } from "@/types/compilation";
import { VERIFICATION_STYLES } from "@/config/statusStyles";
import { formatInt, formatPercent, formatTimestamp } from "@/lib/formatting";
import { cn } from "@/lib/utils";

/** Second, non-colour channel for the run outcome. */
const STATUS_GLYPH: Record<RunStatus, typeof CircleCheck> = {
  pass: CircleCheck,
  fail: CircleX,
  running: Loader,
};

export function RecentRunsTable({
  runs,
  activeRunId,
}: {
  runs: CompilationRun[];
  activeRunId?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left">
        <thead>
          <tr className="border-b border-line">
            {["Run", "Task", "Original", "Compiled", "Reduction", "Constraints", "Status"].map(
              (heading, index) => (
                <th
                  key={heading}
                  scope="col"
                  className={cn(
                    "label-xs pb-2 pr-3 font-medium last:pr-0",
                    index >= 2 && index <= 5 && "text-right",
                  )}
                >
                  {heading}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {runs.map((run) => {
            const active = run.id === activeRunId;
            const tone = VERIFICATION_STYLES[run.status];
            const StatusGlyph = STATUS_GLYPH[run.status];
            return (
              <tr
                key={run.id}
                className={cn(
                  "border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.02]",
                  active && "bg-signal/[0.035]",
                )}
              >
                <td className="py-2 pr-3">
                  <Link
                    href={`/verification?run=${run.id}`}
                    className="num text-[11.5px] text-fg hover:text-signal"
                  >
                    {run.id}
                  </Link>
                  <p className="num text-[10px] text-fg-faint">
                    {formatTimestamp(run.createdAt)}
                  </p>
                </td>
                <td className="max-w-[340px] py-2 pr-3">
                  <p className="truncate text-[12px] text-fg-muted">{run.task}</p>
                </td>
                <td className="num py-2 pr-3 text-right text-[11.5px] text-fg-dim">
                  {formatInt(run.metrics.originalTokens)}
                </td>
                <td className="num py-2 pr-3 text-right text-[11.5px] text-fg">
                  {formatInt(run.metrics.compiledTokens)}
                </td>
                <td className="num py-2 pr-3 text-right text-[11.5px] text-signal">
                  {formatPercent(run.metrics.tokenReduction)}
                </td>
                <td className="num py-2 pr-3 text-right text-[11.5px] text-fg-muted">
                  {run.metrics.criticalConstraintsPreserved} /{" "}
                  {run.metrics.criticalConstraintsTotal}
                </td>
                <td className="py-2">
                  <span className="inline-flex items-center gap-1.5">
                    <StatusGlyph size={11} className={tone.text} aria-hidden />
                    <span
                      className={cn(
                        "text-[11px] font-medium tracking-[0.06em]",
                        tone.text,
                      )}
                    >
                      {tone.label}
                    </span>
                    {run.metrics.recoveryPasses > 0 ? (
                      <span
                        className="inline-flex items-center gap-0.5 text-[10px] text-warn"
                        title={`${run.metrics.recoveryPasses} recovery pass(es)`}
                      >
                        <RotateCcw size={9} />
                        {run.metrics.recoveryPasses}
                      </span>
                    ) : null}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
