import type { StageId, StageStatus } from "@/types/compilation";

export type CompilerPhase =
  | "empty"
  | "ready"
  | "running"
  | "complete"
  | "error";

export interface StageState {
  id: StageId;
  status: StageStatus;
}
