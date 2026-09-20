import type { StressTestResult } from "@/types/stress-test";
import type { ContextClassification } from "@/types/context";
import {
  DEMO_CONTEXT_UNITS,
  DEMO_SOURCE_MESSAGE_COUNT,
  DEMO_TASK,
} from "./demoConversation";
import { DEMO_METRICS } from "./demoCompilation";

/** Strip segments are derived from the fixture so the bars always add up. */
function originalTokensBy(classification: ContextClassification): number {
  return DEMO_CONTEXT_UNITS.filter(
    (u) => u.classification === classification,
  ).reduce((total, u) => total + u.tokens, 0);
}

function compiledTokensBy(classification: ContextClassification): number {
  return DEMO_CONTEXT_UNITS.filter(
    (u) => u.classification === classification,
  ).reduce((total, u) => total + u.compiledTokens, 0);
}

/**
 * Three ways to feed the same task to the same model. Only one of them is
 * both small and correct.
 */

const CONSTRAINTS = [
  "Production region is EU-WEST-1",
  "Agent access to the production database is read-only",
  "Production deployment requires a named human approver",
  "Secrets must never be written to logs or traces",
  "Deployment actions must emit audit events",
  "Release window is Thursday 09:00-11:00 UTC",
  "Rollback must complete within 15 minutes",
  "Schema migrations run before any traffic shift",
  "Canary covers 5% of EU traffic for 30 minutes",
  "On-call engineer is paged before rollout begins",
  "Customer-facing incident comms go out by email",
  "Feature flag checkout-v3 defaults to off in production",
] as const;

/** Indices the naive summarizer dropped. */
const NAIVE_LOST = new Set([0, 1, 2]);
const NAIVE_LOST_COUNT = NAIVE_LOST.size;

/** Naive strip segments; the variant total is their sum. */
const NAIVE_STRIP = [
  { classification: "pinned", label: "Constraints kept", tokens: 168 },
  { classification: "retrieved", label: "Recent window", tokens: 9310 },
  { classification: "compressed", label: "Summary of history", tokens: 5444 },
] as const;

const NAIVE_TOKENS = NAIVE_STRIP.reduce((total, seg) => total + seg.tokens, 0);

/** How much larger the verified context is than the naive one. */
const NAIVE_DELTA = (DEMO_METRICS.compiledTokens - NAIVE_TOKENS).toLocaleString(
  "en-US",
);

/** How far back in the thread the residency rule sits, from the fixture. */
const RESIDENCY_MESSAGE_NO = Number(
  DEMO_CONTEXT_UNITS.find((u) => u.id === "u-127")?.ref.replace(/\D/g, "") ?? 0,
);
const RESIDENCY_AGE = DEMO_SOURCE_MESSAGE_COUNT - RESIDENCY_MESSAGE_NO;

const NAIVE_NOTES: Record<number, string> = {
  0: `Residency rule appeared once, ${RESIDENCY_AGE} messages ago. Recency-weighted summarization dropped it.`,
  1: "Read-only access rule collapsed into a generic line about 'database access'.",
  2: "Approval requirement merged with an unrelated sentence and lost its obligation.",
};

export const DEMO_STRESS_TEST: StressTestResult = {
  task: DEMO_TASK,
  baselineTokens: DEMO_METRICS.originalTokens,
  variants: [
    {
      id: "full",
      name: "Full Context",
      subtitle: "Send everything",
      method: "Every message, document and tool result, unmodified.",
      tokens: DEMO_METRICS.originalTokens,
      constraintsSatisfied: 12,
      constraintsTotal: 12,
      status: "pass",
      latencyMs: 8420,
      strip: [
        {
          classification: "pinned",
          label: "Constraints & state",
          tokens: originalTokensBy("pinned"),
        },
        {
          classification: "retrieved",
          label: "Evidence",
          tokens: originalTokensBy("retrieved") + originalTokensBy("cacheable"),
        },
        {
          classification: "compressed",
          label: "History & documents",
          tokens: originalTokensBy("compressed"),
        },
        {
          classification: "omitted",
          label: "Noise & duplicates",
          tokens: originalTokensBy("omitted"),
        },
        {
          classification: "stale",
          label: "Stale & contradictory",
          tokens: originalTokensBy("stale"),
        },
      ],
      constraints: CONSTRAINTS.map((statement, index) => ({
        id: `full-${index}`,
        statement,
        preserved: true,
        note: `Present, but buried among ${originalTokensBy("omitted").toLocaleString("en-US")} tokens of noise and ${originalTokensBy("stale").toLocaleString("en-US")} tokens of contradictory state.`,
      })),
      verdict:
        "Correct and expensive. Contradictory stale context is still in the window.",
    },
    {
      id: "naive",
      name: "Naive Optimization",
      subtitle: "Summarize and truncate",
      method:
        "Recency window plus an LLM summary of everything older. No verification.",
      tokens: NAIVE_TOKENS,
      constraintsSatisfied: 9,
      constraintsTotal: 12,
      status: "fail",
      latencyMs: 1180,
      strip: NAIVE_STRIP.map((seg) => ({ ...seg })),
      constraints: CONSTRAINTS.map((statement, index) => ({
        id: `naive-${index}`,
        statement,
        preserved: !NAIVE_LOST.has(index),
        note:
          NAIVE_NOTES[index] ??
          "Survived because it appeared inside the recency window.",
      })),
      verdict:
        "Smallest context, and the only one that would have shipped a write to production.",
    },
    {
      id: "consolid8",
      name: "Consolid8",
      subtitle: "Verified context optimization",
      method:
        "Constraint extraction, conflict resolution, consolidation, then verification with auto-recovery.",
      tokens: DEMO_METRICS.compiledTokens,
      constraintsSatisfied: 12,
      constraintsTotal: 12,
      status: "pass",
      latencyMs: DEMO_METRICS.latencyMs,
      strip: [
        {
          classification: "pinned",
          label: "Constraints & state",
          tokens: compiledTokensBy("pinned"),
        },
        {
          classification: "retrieved",
          label: "Evidence",
          tokens: compiledTokensBy("retrieved"),
        },
        {
          classification: "compressed",
          label: "Consolidated history",
          tokens: compiledTokensBy("compressed"),
        },
        {
          classification: "cacheable",
          label: "Memory",
          tokens: compiledTokensBy("cacheable"),
        },
      ],
      constraints: CONSTRAINTS.map((statement, index) => ({
        id: `c8-${index}`,
        statement,
        preserved: true,
        note:
          index === 1
            ? "Dropped on attempt 1, detected by verification, restored by auto-recovery."
            : "Pinned by constraint extraction and confirmed by verification.",
      })),
      verdict: `${NAIVE_DELTA} tokens larger than the naive run, and the only small context that is also correct.`,
    },
  ],
  summary: `Naive optimization is cheaper than Consolid8 by ${NAIVE_DELTA} tokens and loses ${NAIVE_LOST_COUNT} constraints that govern production safety. Consolid8 reaches a comparable size and proves that nothing critical was lost.`,
};

export const DEMO_STRESS_LOST_CONSTRAINTS = CONSTRAINTS.filter((_, i) =>
  NAIVE_LOST.has(i),
);
