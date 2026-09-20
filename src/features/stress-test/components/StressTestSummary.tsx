import { TriangleAlert, X } from "lucide-react";
import type { StressTestResult } from "@/types/stress-test";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";
import { formatInt } from "@/lib/formatting";

/**
 * The single takeaway: naive optimization is cheaper and wrong.
 */
export function StressTestSummary({ result }: { result: StressTestResult }) {
  const naive = result.variants.find((variant) => variant.id === "naive");
  const consolid8 = result.variants.find(
    (variant) => variant.id === "consolid8",
  );
  if (!naive || !consolid8) return null;

  const lost = naive.constraints.filter((constraint) => !constraint.preserved);
  const delta = consolid8.tokens - naive.tokens;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <Panel className="border-danger/25">
        <PanelHeader
          title="Lost by naive optimization"
          subtitle={`${lost.length} of ${naive.constraintsTotal} constraints did not survive`}
          icon={<TriangleAlert size={13} className="text-danger" />}
        />
        <ul className="divide-y divide-line">
          {lost.map((constraint) => (
            <li key={constraint.id} className="px-4 py-2.5">
              <p className="flex items-start gap-2 text-[12.5px] leading-snug text-fg">
                <X
                  size={11}
                  className="mt-[3px] shrink-0 text-danger"
                  strokeWidth={3}
                />
                {constraint.statement}
              </p>
              <p className="mt-1 pl-[19px] text-[11px] leading-snug text-fg-dim">
                {constraint.note}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-t border-danger/20 bg-danger/[0.05] px-4 py-2.5">
          <p className="text-[11.5px] leading-snug text-danger">
            A plan built from this context would propose a production database
            write, with no approver and no residency check.
          </p>
        </div>
      </Panel>

      <Panel className="border-signal/25">
        <PanelHeader
          title="Consolid8"
          subtitle={`${consolid8.constraintsSatisfied} of ${consolid8.constraintsTotal} constraints preserved and verified`}
        />
        <div className="space-y-3.5 p-4">
          <Row
            label="Cost of being correct"
            value={`+${formatInt(delta)} tokens`}
            detail={`${formatInt(consolid8.tokens)} vs ${formatInt(naive.tokens)} — ${(
              (delta / naive.tokens) *
              100
            ).toFixed(1)}% larger than the naive run`}
            tone="text-fg"
          />
          <Row
            label="Still smaller than full context"
            value={`−${formatInt(result.baselineTokens - consolid8.tokens)} tokens`}
            detail={`${((1 - consolid8.tokens / result.baselineTokens) * 100).toFixed(1)}% reduction against sending everything`}
            tone="text-signal"
          />
          <Row
            label="How the gap was caught"
            value="Verification + auto-recovery"
            detail="Attempt 1 dropped the read-only rule. Verification failed, recovery restored it, attempt 2 passed."
            tone="text-warn"
          />
          <p className="border-t border-line pt-3 text-[11.5px] leading-relaxed text-fg-muted">
            {result.summary}
          </p>
        </div>
      </Panel>
    </div>
  );
}

function Row({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="label-xs">{label}</span>
        <span className={cn("num text-[12.5px]", tone)}>{value}</span>
      </div>
      <p className="mt-1 text-[11px] leading-snug text-fg-dim">{detail}</p>
    </div>
  );
}
