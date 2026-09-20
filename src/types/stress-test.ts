import type { ContextClassification } from "./context";

export type StressVariantId = "full" | "naive" | "consolid8";

export interface ContextStripSegment {
  classification: ContextClassification;
  label: string;
  tokens: number;
}

export interface ConstraintOutcome {
  id: string;
  statement: string;
  preserved: boolean;
  note: string;
}

export interface StressTestVariant {
  id: StressVariantId;
  name: string;
  subtitle: string;
  method: string;
  tokens: number;
  constraintsSatisfied: number;
  constraintsTotal: number;
  status: "pass" | "fail";
  latencyMs: number;
  strip: ContextStripSegment[];
  constraints: ConstraintOutcome[];
  /** One-line verdict shown under the column. */
  verdict: string;
}

export interface StressTestResult {
  task: string;
  baselineTokens: number;
  variants: StressTestVariant[];
  summary: string;
}
