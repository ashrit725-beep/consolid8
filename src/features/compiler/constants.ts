import type { PipelineStage, StageId } from "@/types/compilation";

/**
 * Playback speed for the pipeline animation. The runtime's real stage
 * durations are ~2.0s in total, which is too fast to read from across a room,
 * so the demo stretches them by this factor. Reported latency is always the
 * real number from `metrics.latencyMs`.
 */
export const PIPELINE_SPEED = 1.25;

/**
 * Floors for the three beats the product exists to show: verification
 * failing, recovery restoring the missing rule, and reverification passing.
 * At real speed those land in under half a second each — long enough for a
 * screenshot, far too short for a room to read. Every other stage keeps its
 * proportional duration, so the lead-in still feels like work being done.
 */
export const STAGE_MIN_DWELL_MS: Partial<Record<StageId, number>> = {
  verify: 1100,
  recover: 1200,
  reverify: 1300,
};

/** How long one stage stays on screen during playback. */
export function stageDwellMs(stage: PipelineStage): number {
  return Math.max(
    stage.durationMs * PIPELINE_SPEED,
    STAGE_MIN_DWELL_MS[stage.id] ?? 0,
  );
}

/** Stages that only run when verification fails on the first pass. */
export const RECOVERY_STAGE_IDS = ["recover", "reverify"] as const;
