"use client";

import { ChartColumn, ShieldCheck } from "lucide-react";
import { MetricCard, MetricGrid } from "@/components/ui/MetricCard";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import AnimatedContent from "@/components/ui/AnimatedContent";
import { Columns } from "@/components/charts";
import { RecentRunsTable } from "@/components/shared";
import {
  CLASSIFICATION_STYLES,
  REQUIREMENT_STATUS_STYLES,
  VERIFICATION_STYLES,
} from "@/config/statusStyles";
import { DEMO_ANALYTICS } from "@/lib/demo";
import { useRuntime } from "@/lib/state";
import { formatInt } from "@/lib/formatting";
import { BusinessImpactCalculator } from "./BusinessImpactCalculator";
import { WeeklyThroughput } from "./WeeklyThroughput";

/** "1 run", "431 runs" — the readout is never grammatically wrong. */
const formatRuns = (value: number) =>
  `${formatInt(value)} ${Math.round(value) === 1 ? "run" : "runs"}`;

/** Neutral baseline series — no status meaning, so it comes from the theme. */
const CANONICAL_SERIES_COLOR = "var(--color-fg-faint)";

/**
 * Feature entry point. Fleet-level behaviour of the runtime.
 */
export function AnalyticsDashboard() {
  const { run } = useRuntime();
  const { summary, tokenSeries, verificationSeries, reductionDistribution } =
    DEMO_ANALYTICS;

  /** Buckets are the source for this panel's own count, not the fleet tile. */
  const distributionRuns = reductionDistribution.reduce(
    (total, bucket) => total + bucket.runs,
    0,
  );

  return (
    <div className="flex flex-col gap-4">
      <MetricGrid columns={5}>
        <MetricCard
          label="Total compilations"
          value={summary.totalCompilations}
          hint="Last 6 weeks"
          delay={0}
        />
        <MetricCard
          label="Avg token reduction"
          value={summary.averageTokenReduction * 100}
          decimals={1}
          suffix="%"
          hint="Across all tasks"
          delay={0.05}
        />
        <MetricCard
          label="Tokens avoided"
          value={summary.totalTokensAvoided / 1_000_000}
          decimals={1}
          suffix="M"
          size="lg"
          hint={`${formatInt(summary.totalTokensAvoided)} input tokens · ${tokenSeries.length} weeks`}
          delay={0.1}
        />
        <MetricCard
          label="Verification pass rate"
          value={summary.verificationPassRate * 100}
          decimals={1}
          suffix="%"
          tone={VERIFICATION_STYLES.pass}
          hint="After recovery"
          delay={0.15}
        />
        <MetricCard
          label="Critical fact preservation"
          value={summary.criticalFactPreservation * 100}
          decimals={1}
          suffix="%"
          hint="No run shipped a missing constraint"
          delay={0.2}
        />
        <MetricCard
          label="First-pass pass rate"
          value={summary.firstPassPassRate * 100}
          decimals={1}
          suffix="%"
          tone={VERIFICATION_STYLES.pass}
          hint="Verified without recovery"
          delay={0.25}
        />
        <MetricCard
          label="Recovery rate"
          value={summary.recoveryRate * 100}
          decimals={1}
          suffix="%"
          tone={REQUIREMENT_STATUS_STYLES.recovered}
          hint="Runs that needed a restore"
          delay={0.3}
        />
        <MetricCard
          label="Conflicts resolved"
          value={summary.conflictsResolved}
          hint="Contradictions removed"
          delay={0.35}
        />
        <MetricCard
          label="Duplicates omitted"
          value={summary.duplicatesOmitted}
          hint="Redundant units dropped"
          delay={0.4}
        />
      </MetricGrid>

      <div className="grid gap-4 xl:grid-cols-2">
        <AnimatedContent distance={20} duration={0.45} threshold={0.04}>
          <Panel className="h-full">
            <PanelHeader
              title="Token usage"
              subtitle="Canonical vs compiled, weekly"
              icon={<ChartColumn size={13} />}
            />
            <PanelBody>
              <Columns
                labels={tokenSeries.map((point) => point.label)}
                series={[
                  {
                    key: "original",
                    label: "Canonical",
                    hex: CANONICAL_SERIES_COLOR,
                    values: tokenSeries.map((point) => point.original),
                  },
                  {
                    key: "compiled",
                    label: "Compiled",
                    hex: VERIFICATION_STYLES.pass.hex,
                    values: tokenSeries.map((point) => point.compiled),
                  },
                ]}
              />
            </PanelBody>
          </Panel>
        </AnimatedContent>

        <AnimatedContent
          distance={20}
          duration={0.45}
          threshold={0.04}
          delay={0.05}
        >
          <Panel className="h-full">
            <PanelHeader
              title="Verification outcomes"
              subtitle="First-pass, recovered and failed runs"
              icon={<ShieldCheck size={13} />}
            />
            <PanelBody>
              <Columns
                mode="stacked"
                valueFormat={formatRuns}
                labels={verificationSeries.map((point) => point.label)}
                series={[
                  {
                    key: "firstPass",
                    label: "Passed first attempt",
                    hex: REQUIREMENT_STATUS_STYLES.preserved.hex,
                    values: verificationSeries.map((point) => point.firstPass),
                  },
                  {
                    key: "recovered",
                    label: "Passed after recovery",
                    hex: REQUIREMENT_STATUS_STYLES.recovered.hex,
                    values: verificationSeries.map((point) => point.recovered),
                  },
                  {
                    key: "failed",
                    label: "Fell back to full context",
                    hex: VERIFICATION_STYLES.fail.hex,
                    values: verificationSeries.map((point) => point.failed),
                  },
                ]}
              />
            </PanelBody>
          </Panel>
        </AnimatedContent>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <AnimatedContent distance={20} duration={0.45} threshold={0.04}>
          <Panel className="h-full">
            <PanelHeader
              title="Reduction distribution"
              subtitle={`${formatInt(distributionRuns)} runs by reduction achieved`}
            />
            <PanelBody>
              <Columns
                mode="stacked"
                height={248}
                valueFormat={formatRuns}
                labels={reductionDistribution.map((bucket) => bucket.label)}
                series={[
                  {
                    key: "runs",
                    label: "Runs",
                    hex: CLASSIFICATION_STYLES.retrieved.hex,
                    values: reductionDistribution.map((bucket) => bucket.runs),
                  },
                ]}
              />
            </PanelBody>
          </Panel>
        </AnimatedContent>

        <AnimatedContent
          distance={20}
          duration={0.45}
          threshold={0.04}
          delay={0.05}
        >
          <Panel className="h-full">
            <PanelHeader
              title="Weekly throughput"
              subtitle="Fleet totals per week · exact figures behind the chart"
            />
            <PanelBody>
              <WeeklyThroughput series={tokenSeries} />
            </PanelBody>
          </Panel>
        </AnimatedContent>
      </div>

      <BusinessImpactCalculator />

      <Panel>
        <PanelHeader
          title="Recent compilations"
          subtitle={`Newest 6 of ${formatInt(summary.totalCompilations)} runs in this workspace`}
        />
        <PanelBody>
          <RecentRunsTable
            runs={DEMO_ANALYTICS.recentRuns}
            activeRunId={run.runId}
          />
        </PanelBody>
      </Panel>
    </div>
  );
}
