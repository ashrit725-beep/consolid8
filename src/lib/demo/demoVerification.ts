import type { ContextUnit } from "@/types/context";
import type {
  Conflict,
  RecoveryAttempt,
  RequirementGroup,
  VerificationRequirement,
  VerificationResult,
} from "@/types/verification";
import { REQUIREMENT_CATEGORY_LABELS } from "@/config/statusStyles";
import { DEMO_CONTEXT_UNITS } from "./demoConversation";

/**
 * The 30 requirements Consolid8 extracted from the canonical context for the
 * demo task. Twelve are classified critical — those are the "critical
 * constraints" counted on the Overview and Stress Test pages.
 */

/** The single requirement that attempt 1 dropped. */
export const DEMO_MISSING_REQUIREMENT_ID = "r-crit-02";

export const DEMO_REQUIREMENTS: VerificationRequirement[] = [
  // --- critical facts (12) -------------------------------------------------
  {
    id: "r-crit-01",
    statement: "Production region is EU-WEST-1",
    category: "critical_fact",
    status: "preserved",
    source: "Security Policy · Message #127",
    evidenceUnitId: "u-127",
    risk: "critical",
    detail:
      "Residency requirement restated by the current region declaration in Message #411.",
  },
  {
    id: "r-crit-02",
    statement: "Agent access to the production database is read-only",
    category: "critical_fact",
    status: "recovered",
    source: "Security Policy · Message #318",
    evidenceUnitId: "u-318",
    risk: "critical",
    detail:
      "Absent from attempt 1. Auto-recovery restored Message #318 plus the IAM binding that proves the constraint holds.",
  },
  {
    id: "r-crit-03",
    statement: "Production deployment requires a named human approver",
    category: "critical_fact",
    status: "preserved",
    source: "Change Management · Message #204",
    evidenceUnitId: "u-204",
    risk: "critical",
    detail: "Approver is resolved from the platform on-call rota.",
  },
  {
    id: "r-crit-04",
    statement: "Secrets must never be written to logs or traces",
    category: "critical_fact",
    status: "preserved",
    source: "Security Policy · Message #96",
    evidenceUnitId: "u-096",
    risk: "critical",
    detail: "Applies to the log configuration emitted by the plan.",
  },
  {
    id: "r-crit-05",
    statement: "Deployment actions must emit audit events",
    category: "critical_fact",
    status: "preserved",
    source: "Audit Requirement · Message #231",
    evidenceUnitId: "u-231",
    risk: "critical",
    detail: "Each plan phase carries a named audit event.",
  },
  {
    id: "r-crit-06",
    statement: "Release window is Thursday 09:00-11:00 UTC",
    category: "critical_fact",
    status: "preserved",
    source: "Release Window · Message #388",
    evidenceUnitId: "u-388",
    risk: "high",
    detail: "Bounds the total duration available for migration and canary.",
  },
  {
    id: "r-crit-07",
    statement: "Rollback must complete within 15 minutes",
    category: "critical_fact",
    status: "preserved",
    source: "Rollback SLO · Message #366",
    evidenceUnitId: "u-366",
    risk: "high",
    detail: "Drives the rollback trigger thresholds in the canary phase.",
  },
  {
    id: "r-crit-08",
    statement: "Schema migrations run before any traffic shift",
    category: "critical_fact",
    status: "preserved",
    source: "Migration Order · Message #381",
    evidenceUnitId: "u-381",
    risk: "critical",
    detail: "Verified against the four pending migrations in the schema diff.",
  },
  {
    id: "r-crit-09",
    statement: "Canary covers 5% of EU traffic for 30 minutes",
    category: "critical_fact",
    status: "preserved",
    source: "Canary Requirement · Message #372",
    evidenceUnitId: "u-372",
    risk: "critical",
    detail: "Mandatory stage between migration and full rollout.",
  },
  {
    id: "r-crit-10",
    statement: "On-call engineer is paged before rollout begins",
    category: "critical_fact",
    status: "preserved",
    source: "On-call Paging · Message #377",
    evidenceUnitId: "u-377",
    risk: "critical",
    detail: "Pre-flight step one.",
  },
  {
    id: "r-crit-11",
    statement: "Customer-facing incident comms go out by email",
    category: "critical_fact",
    status: "preserved",
    source: "Incident Comms · Message #350",
    evidenceUnitId: "u-350",
    risk: "medium",
    detail: "Applies to the canary-regression branch of the plan.",
  },
  {
    id: "r-crit-12",
    statement: "Feature flag checkout-v3 defaults to off in production",
    category: "critical_fact",
    status: "preserved",
    source: "Feature Flag · Message #424",
    evidenceUnitId: "u-424",
    risk: "critical",
    detail: "Blast-radius control for the release.",
  },

  // --- policies (5) --------------------------------------------------------
  {
    id: "r-pol-01",
    statement: "Change Management Policy CM-14 governs production releases",
    category: "policy",
    status: "preserved",
    source: "Compliance Handbook · Document #3",
    evidenceUnitId: "u-doc-1",
    risk: "high",
    detail:
      "Clause survived compression: the handbook was reduced from 11,240 to 1,180 tokens with CM-14 kept verbatim.",
  },
  {
    id: "r-pol-02",
    statement: "Infrastructure changes require two-person review",
    category: "policy",
    status: "preserved",
    source: "Two-Person Review · Message #357",
    evidenceUnitId: "u-357",
    risk: "high",
    detail: "Second approval gate for the Terraform step.",
  },
  {
    id: "r-pol-03",
    statement: "Policy DR-2 prohibits cross-region replication",
    category: "policy",
    status: "preserved",
    source: "Data Residency · Message #340",
    evidenceUnitId: "u-340",
    risk: "critical",
    detail: "Invalidates the replication design proposed in RFC-11.",
  },
  {
    id: "r-pol-04",
    statement: "Auth-surface changes require security sign-off",
    category: "policy",
    status: "preserved",
    source: "Security Sign-off · Message #329",
    evidenceUnitId: "u-329",
    risk: "high",
    detail: "Triggered by the session-handling change in 2f91c4e.",
  },
  {
    id: "r-pol-05",
    statement: "Post-deployment verification is logged within 24 hours",
    category: "policy",
    status: "preserved",
    source: "Post-deploy Verification · Message #393",
    evidenceUnitId: "u-393",
    risk: "medium",
    detail: "Final phase of the approved plan template.",
  },

  // --- dependencies (7) ----------------------------------------------------
  {
    id: "r-dep-01",
    statement: "PostgreSQL 16 primary in EU-WEST-1 is reachable",
    category: "dependency",
    status: "preserved",
    source: "Tool #22 · pg_topology",
    evidenceUnitId: "u-430",
    risk: "high",
    detail: "Two replicas in eu-west-1b and eu-west-1c.",
  },
  {
    id: "r-dep-02",
    statement: "Redis session cache is warmed before traffic shift",
    category: "dependency",
    status: "preserved",
    source: "Tool #23 · redis_stat",
    evidenceUnitId: "u-431",
    risk: "medium",
    detail: "Currently 61% warm — the plan adds an explicit warm step.",
  },
  {
    id: "r-dep-03",
    statement: "Stripe webhook endpoint is re-registered after deploy",
    category: "dependency",
    status: "preserved",
    source: "Message #433",
    evidenceUnitId: "u-433",
    risk: "high",
    detail: "Triggered by the edge-router version bump.",
  },
  {
    id: "r-dep-04",
    statement: "Kafka topic orders.v3 has zero consumer lag at cut-over",
    category: "dependency",
    status: "preserved",
    source: "Tool #26 · kafka_lag",
    evidenceUnitId: "u-434",
    risk: "high",
    detail: "Verified zero across all 12 partitions.",
  },
  {
    id: "r-dep-05",
    statement: "Terraform module edge-router v4.2 is applied first",
    category: "dependency",
    status: "preserved",
    source: "Message #436",
    evidenceUnitId: "u-436",
    risk: "high",
    detail: "Prerequisite for the release artifact.",
  },
  {
    id: "r-dep-06",
    statement: "Okta SAML metadata is unchanged",
    category: "dependency",
    status: "preserved",
    source: "Message #437",
    evidenceUnitId: "u-437",
    risk: "medium",
    detail: "No identity approval required for this release.",
  },
  {
    id: "r-dep-07",
    statement: "CDN purge is scheduled for changed asset hashes",
    category: "dependency",
    status: "preserved",
    source: "Message #438",
    evidenceUnitId: "u-438",
    risk: "medium",
    detail: "Post-deploy step.",
  },

  // --- current state (6) ---------------------------------------------------
  {
    id: "r-state-01",
    statement: "PostgreSQL is the active datastore, MongoDB is decommissioned",
    category: "current_state",
    status: "preserved",
    source: "Message #402",
    evidenceUnitId: "u-402",
    risk: "critical",
    detail: "Message #58 marked stale to prevent a contradictory datastore.",
  },
  {
    id: "r-state-02",
    statement: "EU-WEST-1 is active, US-EAST-1 is retired",
    category: "current_state",
    status: "preserved",
    source: "Message #411",
    evidenceUnitId: "u-411",
    risk: "critical",
    detail: "Message #42 marked stale.",
  },
  {
    id: "r-state-03",
    statement: "Build 2f91c4e is the release candidate",
    category: "current_state",
    status: "preserved",
    source: "Message #421",
    evidenceUnitId: "u-421",
    risk: "high",
    detail: "The artifact the plan targets.",
  },
  {
    id: "r-state-04",
    statement: "Staging verification passed at 07:12 UTC",
    category: "current_state",
    status: "preserved",
    source: "Message #418",
    evidenceUnitId: "u-418",
    risk: "medium",
    detail: "Release-readiness precondition satisfied.",
  },
  {
    id: "r-state-05",
    statement: "Two open Sev-3 incidents, neither blocking",
    category: "current_state",
    status: "preserved",
    source: "Message #419",
    evidenceUnitId: "u-419",
    risk: "medium",
    detail: "No Sev-1 or Sev-2 incidents would block the window.",
  },
  {
    id: "r-state-06",
    statement: "checkout-v3 is currently disabled in all environments",
    category: "current_state",
    status: "preserved",
    source: "Message #424",
    evidenceUnitId: "u-424",
    risk: "high",
    detail: "Confirms the flag default the plan must preserve.",
  },
];

export const DEMO_CRITICAL_REQUIREMENTS = DEMO_REQUIREMENTS.filter(
  (r) => r.category === "critical_fact",
);

function buildGroups(
  requirements: VerificationRequirement[],
  missingIds: string[] = [],
): RequirementGroup[] {
  const categories = [
    "critical_fact",
    "policy",
    "dependency",
    "current_state",
  ] as const;
  return categories.map((category) => {
    const inCategory = requirements.filter((r) => r.category === category);
    return {
      category,
      label: REQUIREMENT_CATEGORY_LABELS[category],
      total: inCategory.length,
      passed: inCategory.filter((r) => !missingIds.includes(r.id)).length,
    };
  });
}

export const DEMO_REQUIREMENT_GROUPS = buildGroups(DEMO_REQUIREMENTS);

function compiledTokensOf(units: readonly ContextUnit[]): number {
  return units.reduce((total, unit) => total + unit.compiledTokens, 0);
}

const INCLUDED_UNITS = DEMO_CONTEXT_UNITS.filter((u) => u.included);

/**
 * Attempt 2 is the whole compiled context. Attempt 1 is that context minus the
 * units auto-recovery had to restore, so the two totals and the delta between
 * them can never drift from the fixture.
 */
export const DEMO_ATTEMPT_TWO_TOKENS = compiledTokensOf(INCLUDED_UNITS);
export const DEMO_ATTEMPT_ONE_TOKENS =
  DEMO_ATTEMPT_TWO_TOKENS -
  compiledTokensOf(INCLUDED_UNITS.filter((u) => u.recovered));

const RECOVERED_TOKENS = DEMO_ATTEMPT_TWO_TOKENS - DEMO_ATTEMPT_ONE_TOKENS;

const CANONICAL_TOKENS = DEMO_CONTEXT_UNITS.reduce((t, u) => t + u.tokens, 0);
const REDUCTION_AFTER_RECOVERY = (
  (1 - DEMO_ATTEMPT_TWO_TOKENS / CANONICAL_TOKENS) *
  100
).toFixed(1);

export const DEMO_RECOVERY_ATTEMPTS: RecoveryAttempt[] = [
  {
    attempt: 1,
    tokens: DEMO_ATTEMPT_ONE_TOKENS,
    constraintsSatisfied: 11,
    constraintsTotal: 12,
    status: "fail",
    missing: ["Agent access to the production database is read-only"],
    recoveredRefs: [],
    recoveredUnitIds: [],
    note: "Selection scored Message #318 below the inclusion threshold on recency. The deployment plan touches database work, so the omission is unsafe.",
    durationMs: 1120,
  },
  {
    attempt: 2,
    tokens: DEMO_ATTEMPT_TWO_TOKENS,
    constraintsSatisfied: 12,
    constraintsTotal: 12,
    status: "pass",
    missing: [],
    recoveredRefs: [
      "Message #318",
      "Retrieval #8 · approval-matrix",
      "Tool #35 · iam_binding",
    ],
    recoveredUnitIds: ["u-318", "u-ret-4", "u-iam"],
    note: `Recovery restored the access-control rule with the two artifacts that prove it, adding ${RECOVERED_TOKENS.toLocaleString("en-US")} tokens. Reduction held at ${REDUCTION_AFTER_RECOVERY}%.`,
    durationMs: 727,
  },
];

export const DEMO_VERIFICATION: VerificationResult = {
  status: "pass",
  checkedAt: "2026-09-19T09:41:22.000Z",
  requirements: DEMO_REQUIREMENTS,
  groups: DEMO_REQUIREMENT_GROUPS,
  attempts: DEMO_RECOVERY_ATTEMPTS,
  recoveryPasses: 1,
  satisfied: DEMO_REQUIREMENTS.length,
  total: DEMO_REQUIREMENTS.length,
};

/** State of verification at the end of attempt 1, before recovery. */
export const DEMO_VERIFICATION_FIRST_PASS: VerificationResult = {
  status: "fail",
  checkedAt: "2026-09-19T09:41:20.000Z",
  requirements: DEMO_REQUIREMENTS.map((r) =>
    r.id === DEMO_MISSING_REQUIREMENT_ID ? { ...r, status: "missing" } : r,
  ),
  groups: buildGroups(DEMO_REQUIREMENTS, [DEMO_MISSING_REQUIREMENT_ID]),
  attempts: [DEMO_RECOVERY_ATTEMPTS[0]!],
  recoveryPasses: 0,
  satisfied: DEMO_REQUIREMENTS.length - 1,
  total: DEMO_REQUIREMENTS.length,
};

export const DEMO_CONFLICTS: Conflict[] = [
  {
    id: "c-region",
    topic: "Production deployment region",
    staleValue: "US-EAST-1",
    staleRef: "Message #42",
    staleUnitId: "u-042",
    currentValue: "EU-WEST-1",
    currentRef: "Message #411",
    currentUnitId: "u-411",
    reason:
      "A later explicit production configuration replaced the previous deployment region. Carrying both would let the model pick either.",
    resolvedBy: "explicit_override",
  },
  {
    id: "c-datastore",
    topic: "Primary datastore",
    staleValue: "MongoDB",
    staleRef: "Message #58",
    staleUnitId: "u-058",
    currentValue: "PostgreSQL 16",
    currentRef: "Message #402",
    currentUnitId: "u-402",
    reason:
      "The March migration completed; the earlier statement describes a system that no longer exists.",
    resolvedBy: "recency",
  },
  {
    id: "c-architecture",
    topic: "Region topology",
    staleValue: "Active-active dual region",
    staleRef: "Document #2 · RFC-11",
    staleUnitId: "u-rfc-11",
    currentValue: "Single region, EU-WEST-1",
    currentRef: "Message #411",
    currentUnitId: "u-411",
    reason:
      "RFC-11 was rejected, and its bidirectional replication design contradicts policy DR-2, which holds higher authority than a design document.",
    resolvedBy: "authority",
  },
];
