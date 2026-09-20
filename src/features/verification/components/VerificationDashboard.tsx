"use client";

import { useState } from "react";
import { GitBranch, ListFilter, RotateCcw } from "lucide-react";
import type { ContextUnit } from "@/types/context";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import AnimatedContent from "@/components/ui/AnimatedContent";
import {
  ConflictResolutionCard,
  ContextDetailDrawer,
  RecoveryTimeline,
} from "@/components/shared";
import { useRuntime } from "@/lib/state";
import { formatInt } from "@/lib/formatting";
import { VerificationHeader } from "./VerificationHeader";
import { RequirementList } from "./RequirementList";

/**
 * Feature entry point.
 */
export function VerificationDashboard() {
  const { run } = useRuntime();
  const [selected, setSelected] = useState<ContextUnit | null>(null);

  const firstAttempt = run.recoveryAttempts[0];
  const lastAttempt = run.recoveryAttempts[run.recoveryAttempts.length - 1];
  const tokenCost =
    firstAttempt && lastAttempt ? lastAttempt.tokens - firstAttempt.tokens : 0;

  return (
    <div className="flex flex-col gap-4">
      <VerificationHeader run={run} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHeader
            title="Requirements"
            subtitle={`${run.verification.total} extracted from the canonical context`}
            icon={<ListFilter size={13} />}
          />
          <RequirementList
            requirements={run.verification.requirements}
            units={run.originalContext}
            onSelectEvidence={setSelected}
          />
        </Panel>

        <div className="flex flex-col gap-4">
          <AnimatedContent distance={20} duration={0.45} threshold={0.05}>
            <Panel>
              <PanelHeader
                title="Recovery timeline"
                subtitle="What happened between the failed pass and the result"
                icon={<RotateCcw size={13} />}
              />
              <div className="p-3.5">
                <RecoveryTimeline attempts={run.recoveryAttempts} />

                <dl className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3">
                  <Stat
                    label="Recovery tokens"
                    value={`+${formatInt(tokenCost)}`}
                    tone="text-warn"
                  />
                  <Stat
                    label="Final reduction"
                    value={`${(run.metrics.tokenReduction * 100).toFixed(1)}%`}
                    tone="text-signal"
                  />
                  <Stat
                    label="Attempts"
                    value={String(run.recoveryAttempts.length)}
                  />
                </dl>
              </div>
            </Panel>
          </AnimatedContent>

          <AnimatedContent
            distance={20}
            duration={0.45}
            threshold={0.05}
            delay={0.05}
          >
            <Panel>
              <PanelHeader
                title="Conflicts resolved"
                subtitle="Contradictions removed before verification"
                icon={<GitBranch size={13} />}
              />
              <div className="space-y-3 p-3.5">
                {run.conflicts.map((conflict) => (
                  <ConflictResolutionCard
                    key={conflict.id}
                    conflict={conflict}
                  />
                ))}
              </div>
            </Panel>
          </AnimatedContent>
        </div>
      </div>

      <ContextDetailDrawer
        unit={selected}
        units={run.originalContext}
        onClose={() => setSelected(null)}
        onSelectUnit={setSelected}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "text-fg",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div>
      <dt className="label-xs truncate">{label}</dt>
      <dd className={`num mt-1 text-[14px] leading-none ${tone}`}>{value}</dd>
    </div>
  );
}
