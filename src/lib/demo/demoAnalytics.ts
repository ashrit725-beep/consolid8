import type { AnalyticsSnapshot } from "@/types/analytics";
import type { CompilationRun } from "@/types/compilation";
import { DEMO_METRICS, DEMO_RUN_ID } from "./demoCompilation";
import { DEMO_CONTEXT_UNITS, DEMO_TASK } from "./demoConversation";
import { CLASSIFICATION_ORDER } from "@/config/statusStyles";

/** Fleet-level numbers for a workspace that has been running for ~6 weeks. */

const RUN_SEEDS: Array<{
  id: string;
  task: string;
  createdAt: string;
  original: number;
  compiled: number;
  status: "pass" | "fail";
  recoveryPasses: number;
  critical: number;
  criticalTotal: number;
}> = [
  {
    id: DEMO_RUN_ID,
    task: DEMO_TASK,
    createdAt: "2026-09-19T09:41:22.000Z",
    original: DEMO_METRICS.originalTokens,
    compiled: DEMO_METRICS.compiledTokens,
    status: "pass",
    recoveryPasses: 1,
    critical: 12,
    criticalTotal: 12,
  },
  {
    id: "C-1041",
    task: "Draft the incident report for INC-2308 and notify affected customers.",
    createdAt: "2026-09-19T08:12:04.000Z",
    original: 41260,
    compiled: 9840,
    status: "pass",
    recoveryPasses: 0,
    critical: 8,
    criticalTotal: 8,
  },
  {
    id: "C-1040",
    task: "Reconcile the September ledger and flag transactions above threshold.",
    createdAt: "2026-09-19T07:38:51.000Z",
    original: 58910,
    compiled: 13204,
    status: "pass",
    recoveryPasses: 2,
    critical: 14,
    criticalTotal: 14,
  },
  {
    id: "C-1039",
    task: "Summarize the vendor security review and list blocking findings.",
    createdAt: "2026-09-18T16:20:11.000Z",
    original: 33480,
    compiled: 11602,
    status: "pass",
    recoveryPasses: 0,
    critical: 6,
    criticalTotal: 6,
  },
  {
    id: "C-1038",
    task: "Plan the EU-WEST replica failover drill for next Thursday.",
    createdAt: "2026-09-18T14:02:39.000Z",
    original: 67130,
    compiled: 16988,
    status: "pass",
    recoveryPasses: 1,
    critical: 11,
    criticalTotal: 11,
  },
  {
    id: "C-1037",
    task: "Answer the customer escalation about delayed refunds in DE.",
    createdAt: "2026-09-18T11:47:02.000Z",
    original: 22940,
    compiled: 7315,
    status: "pass",
    recoveryPasses: 0,
    critical: 5,
    criticalTotal: 5,
  },
];

export const DEMO_RECENT_RUNS: CompilationRun[] = RUN_SEEDS.map((seed) => ({
  id: seed.id,
  task: seed.task,
  createdAt: seed.createdAt,
  mode: "demo",
  status: seed.status,
  metrics: {
    originalTokens: seed.original,
    compiledTokens: seed.compiled,
    firstPassTokens: seed.compiled,
    tokensSaved: seed.original - seed.compiled,
    tokenReduction: (seed.original - seed.compiled) / seed.original,
    unitsTotal: 0,
    unitsIncluded: 0,
    unitsCompressed: 0,
    unitsOmitted: 0,
    duplicatesOmitted: 0,
    conflictsResolved: 0,
    criticalConstraintsTotal: seed.criticalTotal,
    criticalConstraintsPreserved: seed.critical,
    recoveryPasses: seed.recoveryPasses,
    latencyMs: 0,
  },
}));

const TOKEN_SERIES = [
  { label: "Aug 11", original: 2_140_000, compiled: 712_000 },
  { label: "Aug 18", original: 2_480_000, compiled: 784_000 },
  { label: "Aug 25", original: 2_910_000, compiled: 868_000 },
  { label: "Sep 01", original: 3_240_000, compiled: 931_000 },
  { label: "Sep 08", original: 3_680_000, compiled: 1_012_000 },
  { label: "Sep 15", original: 4_120_000, compiled: 1_104_000 },
];

const VERIFICATION_SERIES = [
  { label: "Aug 11", firstPass: 138, recovered: 26, failed: 3 },
  { label: "Aug 18", firstPass: 164, recovered: 24, failed: 2 },
  { label: "Aug 25", firstPass: 193, recovered: 27, failed: 2 },
  { label: "Sep 01", firstPass: 218, recovered: 29, failed: 1 },
  { label: "Sep 08", firstPass: 241, recovered: 31, failed: 1 },
  { label: "Sep 15", firstPass: 268, recovered: 25, failed: 0 },
];

/** Weekly totals; every fleet-level number below is rolled up from these. */
const TOKEN_TOTALS = TOKEN_SERIES.reduce(
  (acc, week) => ({
    original: acc.original + week.original,
    compiled: acc.compiled + week.compiled,
  }),
  { original: 0, compiled: 0 },
);

const VERIFICATION_TOTALS = VERIFICATION_SERIES.reduce(
  (acc, week) => ({
    firstPass: acc.firstPass + week.firstPass,
    recovered: acc.recovered + week.recovered,
    failed: acc.failed + week.failed,
  }),
  { firstPass: 0, recovered: 0, failed: 0 },
);

const TOTAL_COMPILATIONS =
  VERIFICATION_TOTALS.firstPass +
  VERIFICATION_TOTALS.recovered +
  VERIFICATION_TOTALS.failed;

const TOTAL_TOKENS_AVOIDED = TOKEN_TOTALS.original - TOKEN_TOTALS.compiled;

/**
 * Shape of the reduction histogram. The bucket counts are scaled to the run
 * total so the bars always add up to the "total compilations" they are
 * labelled with; largest-remainder keeps the sum exact.
 */
const REDUCTION_BUCKET_WEIGHTS = [
  { label: "0-40%", weight: 41 },
  { label: "40-55%", weight: 118 },
  { label: "55-65%", weight: 246 },
  { label: "65-75%", weight: 431 },
  { label: "75-85%", weight: 338 },
  { label: "85%+", weight: 110 },
];

const reductionDistribution = (() => {
  const weightTotal = REDUCTION_BUCKET_WEIGHTS.reduce(
    (total, bucket) => total + bucket.weight,
    0,
  );
  const exact = REDUCTION_BUCKET_WEIGHTS.map(
    (bucket) => (bucket.weight / weightTotal) * TOTAL_COMPILATIONS,
  );
  const runs = exact.map((value) => Math.floor(value));
  let remainder = TOTAL_COMPILATIONS - runs.reduce((t, v) => t + v, 0);
  const byFraction = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { index } of byFraction) {
    if (remainder <= 0) break;
    runs[index] = (runs[index] ?? 0) + 1;
    remainder -= 1;
  }
  return REDUCTION_BUCKET_WEIGHTS.map((bucket, index) => ({
    label: bucket.label,
    runs: runs[index] ?? 0,
  }));
})();

const composition = CLASSIFICATION_ORDER.map((classification) => {
  const units = DEMO_CONTEXT_UNITS.filter(
    (u) => u.classification === classification,
  );
  return {
    classification,
    tokens: units.reduce((total, u) => total + u.tokens, 0),
    units: units.length,
  };
});

export const DEMO_ANALYTICS: AnalyticsSnapshot = {
  summary: {
    totalCompilations: TOTAL_COMPILATIONS,
    averageTokenReduction: TOTAL_TOKENS_AVOIDED / TOKEN_TOTALS.original,
    totalTokensAvoided: TOTAL_TOKENS_AVOIDED,
    verificationPassRate:
      (TOTAL_COMPILATIONS - VERIFICATION_TOTALS.failed) / TOTAL_COMPILATIONS,
    firstPassPassRate: VERIFICATION_TOTALS.firstPass / TOTAL_COMPILATIONS,
    recoveryRate: VERIFICATION_TOTALS.recovered / TOTAL_COMPILATIONS,
    criticalFactPreservation: 1,
    conflictsResolved: 3912,
    duplicatesOmitted: 9847,
  },
  tokenSeries: TOKEN_SERIES,
  verificationSeries: VERIFICATION_SERIES,
  composition,
  reductionDistribution,
  recentRuns: DEMO_RECENT_RUNS,
};

/** Defaults for <BusinessImpactCalculator />. */
export const DEMO_IMPACT_DEFAULTS = {
  requestsPerMonth: 250_000,
  averageContextTokens: 48_000,
  averageReduction: DEMO_ANALYTICS.summary.averageTokenReduction,
  inputCostPerMillion: 3,
};
