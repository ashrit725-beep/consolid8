import type { CompiledSection, ContextUnit } from "./context";
import type { Conflict, RecoveryAttempt, VerificationResult } from "./verification";

export type RuntimeMode = "demo" | "live";

export type StageStatus =
  | "pending"
  | "running"
  | "done"
  | "failed"
  | "recovered";

export type StageId =
  | "ingest"
  | "segment"
  | "extract"
  | "analyze"
  | "resolve"
  | "consolidate"
  | "verify"
  | "recover"
  | "reverify";

export interface PipelineStage {
  id: StageId;
  label: string;
  /** Live-progress copy, e.g. "Analyzing 428 context units...". */
  runningDetail: string;
  /** Post-completion copy, e.g. "428 units segmented". */
  doneDetail: string;
  durationMs: number;
  /** Stages that only execute when verification fails. */
  conditional?: boolean;
}

export interface CompilationMetrics {
  originalTokens: number;
  compiledTokens: number;
  /** Tokens in the first (failed) attempt, before recovery. */
  firstPassTokens: number;
  tokensSaved: number;
  /** 0..1 */
  tokenReduction: number;
  unitsTotal: number;
  unitsIncluded: number;
  unitsCompressed: number;
  unitsOmitted: number;
  duplicatesOmitted: number;
  conflictsResolved: number;
  criticalConstraintsTotal: number;
  criticalConstraintsPreserved: number;
  recoveryPasses: number;
  latencyMs: number;
}

export type RunStatus = "pass" | "fail" | "running";

export interface CompilationRun {
  id: string;
  task: string;
  createdAt: string;
  mode: RuntimeMode;
  status: RunStatus;
  metrics: CompilationMetrics;
}

/** Full payload returned by `compileContext()`. */
export interface CompilationResponse {
  runId: string;
  task: string;
  createdAt: string;
  mode: RuntimeMode;
  originalContext: ContextUnit[];
  compiledContext: ContextUnit[];
  sections: CompiledSection[];
  metrics: CompilationMetrics;
  verification: VerificationResult;
  conflicts: Conflict[];
  recoveryAttempts: RecoveryAttempt[];
  stages: PipelineStage[];
}
