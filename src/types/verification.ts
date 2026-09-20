import type { RiskLevel } from "./context";

export type VerificationStatus = "pass" | "fail" | "running" | "idle";

export type RequirementCategory =
  | "critical_fact"
  | "policy"
  | "dependency"
  | "current_state";

export type RequirementStatus = "preserved" | "recovered" | "missing";

export interface VerificationRequirement {
  id: string;
  /** The claim that must survive compilation, e.g. "Production region = EU-WEST". */
  statement: string;
  category: RequirementCategory;
  status: RequirementStatus;
  /** Origin of the requirement, e.g. "Security Policy · Message #127". */
  source: string;
  /** Context unit that satisfies the requirement. */
  evidenceUnitId: string;
  risk: RiskLevel;
  detail: string;
}

export interface RequirementGroup {
  category: RequirementCategory;
  label: string;
  passed: number;
  total: number;
}

/** One pass of compile → verify. Attempt 1 may fail and trigger recovery. */
export interface RecoveryAttempt {
  attempt: number;
  tokens: number;
  constraintsSatisfied: number;
  constraintsTotal: number;
  status: "pass" | "fail";
  /** Requirement statements that were missing on this attempt. */
  missing: string[];
  /** Context refs restored before the next attempt, e.g. ["Message #318"]. */
  recoveredRefs: string[];
  recoveredUnitIds: string[];
  note: string;
  durationMs: number;
}

export interface VerificationResult {
  status: VerificationStatus;
  checkedAt: string;
  requirements: VerificationRequirement[];
  groups: RequirementGroup[];
  attempts: RecoveryAttempt[];
  recoveryPasses: number;
  /** Convenience rollups so consumers never recompute them inconsistently. */
  satisfied: number;
  total: number;
}

export interface Conflict {
  id: string;
  topic: string;
  staleValue: string;
  staleRef: string;
  staleUnitId: string;
  currentValue: string;
  currentRef: string;
  currentUnitId: string;
  reason: string;
  resolvedBy: "recency" | "authority" | "explicit_override";
}
