import type { CompilationResponse } from "@/types/compilation";
import { MetricCard, MetricGrid } from "@/components/ui/MetricCard";
import { CLASSIFICATION_STYLES } from "@/config/statusStyles";
import { DEMO_SOURCE_MESSAGE_COUNT } from "@/lib/demo";
import { formatInt, formatPercent } from "@/lib/formatting";

/**
 * Second-level metrics. The headline tokens and the verification ledger live
 * in the run header — this row answers "what did the runtime actually do to
 * get there", and deliberately restates none of those figures.
 *
 * No glyphs: a metric row reads as one column of numbers. Colour is spent
 * only where it carries the classification contract (pinned = green); a
 * success figure never borrows the stale or recovered tone.
 */
export function MetricsGrid({ run }: { run: CompilationResponse }) {
  const { metrics, originalContext } = run;

  const compressed = originalContext.filter(
    (unit) => unit.classification === "compressed",
  );
  const compressedBefore = compressed.reduce((sum, u) => sum + u.tokens, 0);
  const compressedAfter = compressed.reduce(
    (sum, u) => sum + u.compiledTokens,
    0,
  );
  const compressionRatio =
    compressedBefore > 0
      ? (compressedBefore - compressedAfter) / compressedBefore
      : 0;

  const stale = originalContext.filter(
    (unit) => unit.classification === "stale",
  ).length;

  const pinned = originalContext.filter(
    (unit) => unit.classification === "pinned",
  );
  const pinnedTokens = pinned.reduce((sum, u) => sum + u.compiledTokens, 0);

  const retainedShare =
    metrics.unitsTotal > 0 ? metrics.unitsIncluded / metrics.unitsTotal : 0;

  return (
    <MetricGrid columns={6}>
      <MetricCard
        label="Context units"
        value={metrics.unitsTotal}
        hint={`${DEMO_SOURCE_MESSAGE_COUNT} source messages`}
        delay={0}
      />
      <MetricCard
        label="Units retained"
        value={metrics.unitsIncluded}
        hint={`${formatPercent(retainedShare)} of units kept`}
        delay={0.05}
      />
      <MetricCard
        label="Units dropped"
        value={metrics.unitsOmitted}
        hint={`${metrics.unitsOmitted - stale} irrelevant · ${stale} stale`}
        delay={0.1}
      />
      <MetricCard
        label="Pinned tokens"
        value={pinnedTokens}
        tone={CLASSIFICATION_STYLES.pinned}
        hint={`${pinned.length} units held verbatim`}
        delay={0.15}
      />
      <MetricCard
        label="History compressed"
        value={compressionRatio * 100}
        decimals={1}
        suffix="%"
        hint={`${formatInt(compressedBefore)} → ${formatInt(compressedAfter)} tokens`}
        delay={0.2}
      />
      <MetricCard
        label="Conflicts resolved"
        value={metrics.conflictsResolved}
        hint={`${metrics.duplicatesOmitted} duplicates dropped`}
        delay={0.25}
      />
    </MetricGrid>
  );
}
