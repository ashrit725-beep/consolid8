import type { ContextClassification } from "./context";
import type { CompilationRun } from "./compilation";

export interface AnalyticsSummary {
  totalCompilations: number;
  /** 0..1 */
  averageTokenReduction: number;
  totalTokensAvoided: number;
  /** 0..1 */
  verificationPassRate: number;
  firstPassPassRate: number;
  recoveryRate: number;
  criticalFactPreservation: number;
  conflictsResolved: number;
  duplicatesOmitted: number;
}

export interface TokenSeriesPoint {
  label: string;
  original: number;
  compiled: number;
}

export interface VerificationSeriesPoint {
  label: string;
  firstPass: number;
  recovered: number;
  failed: number;
}

export interface CompositionSlice {
  classification: ContextClassification;
  tokens: number;
  units: number;
}

export interface ReductionBucket {
  label: string;
  runs: number;
}

export interface AnalyticsSnapshot {
  summary: AnalyticsSummary;
  tokenSeries: TokenSeriesPoint[];
  verificationSeries: VerificationSeriesPoint[];
  composition: CompositionSlice[];
  reductionDistribution: ReductionBucket[];
  recentRuns: CompilationRun[];
}

/** Inputs for <BusinessImpactCalculator />. Costs are always estimates. */
export interface ImpactInputs {
  requestsPerMonth: number;
  averageContextTokens: number;
  /** 0..1 */
  averageReduction: number;
  /** USD per 1M input tokens. */
  inputCostPerMillion: number;
}

export interface ImpactResult {
  originalMonthlyTokens: number;
  compiledMonthlyTokens: number;
  tokensAvoided: number;
  estimatedCostBefore: number;
  estimatedCostAfter: number;
  estimatedDifference: number;
}
