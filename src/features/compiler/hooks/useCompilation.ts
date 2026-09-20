"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  CompilationResponse,
  PipelineStage,
  StageId,
  StageStatus,
} from "@/types/compilation";
import type { RecoveryAttempt } from "@/types/verification";
import type { ContextUnit } from "@/types/context";
import { Consolid8ApiError, getApi } from "@/lib/api";
import { DEMO_CONTEXT_UNITS, DEMO_TASK } from "@/lib/demo";
import { useRuntime } from "@/lib/state";
import { stageDwellMs } from "../constants";
import type { CompilerPhase } from "../types";

export interface StageView {
  stage: PipelineStage;
  status: StageStatus;
}

export interface UseCompilation {
  phase: CompilerPhase;
  task: string;
  setTask: (task: string) => void;
  units: ContextUnit[];
  stages: StageView[];
  activeStageId: StageId | null;
  result: CompilationResponse | null;
  error: Consolid8ApiError | null;
  /** The failing attempt, published the moment `verify` fails — not at the
   *  end of the run, so the room can read it while it is on screen. */
  failedAttempt: RecoveryAttempt | null;
  /** Context refs restored, published the moment `recover` settles. */
  recoveredRefs: string[];
  /** Token count as it moves through the run. */
  liveTokens: number;
  /** 0..1 across the executed stages. */
  progress: number;
  compile: () => void;
  reset: () => void;
  loadDemo: () => void;
}

/**
 * Drives one compilation: calls the API adapter, then plays the returned
 * stages back at a readable speed. All compiler state lives here so the
 * panels stay presentational.
 */
export function useCompilation(): UseCompilation {
  const { mode, setRun, setRunPhase, run } = useRuntime();

  const [phase, setPhase] = useState<CompilerPhase>("ready");
  const [task, setTask] = useState(DEMO_TASK);
  const [units, setUnits] = useState<ContextUnit[]>(DEMO_CONTEXT_UNITS);
  const [stages, setStages] = useState<StageView[]>(() =>
    run.stages
      .filter((stage) => !stage.conditional)
      .map((stage) => ({ stage, status: "pending" as StageStatus })),
  );
  const [activeStageId, setActiveStageId] = useState<StageId | null>(null);
  const [result, setResult] = useState<CompilationResponse | null>(null);
  const [error, setError] = useState<Consolid8ApiError | null>(null);
  const [failedAttempt, setFailedAttempt] = useState<RecoveryAttempt | null>(
    null,
  );
  const [recoveredRefs, setRecoveredRefs] = useState<string[]>([]);
  const [liveTokens, setLiveTokens] = useState(run.metrics.originalTokens);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cancelled = useRef(false);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => {
    return () => {
      cancelled.current = true;
      clearTimers();
    };
  }, [clearTimers]);

  const wait = useCallback(
    (ms: number) =>
      new Promise<void>((resolve) => {
        timers.current.push(setTimeout(resolve, ms));
      }),
    [],
  );

  const compile = useCallback(async () => {
    if (phase === "running") return;

    clearTimers();
    cancelled.current = false;
    setError(null);
    setResult(null);
    setFailedAttempt(null);
    setRecoveredRefs([]);
    setPhase("running");
    setRunPhase("running");

    let response: CompilationResponse;
    try {
      response = await getApi(mode).compileContext({ task });
    } catch (caught) {
      if (cancelled.current) return;
      setError(
        caught instanceof Consolid8ApiError
          ? caught
          : new Consolid8ApiError("unknown", "Compilation failed."),
      );
      setPhase("error");
      // The global readout falls back to the previous run rather than being
      // stranded mid-flight with dashes.
      setRunPhase("seeded");
      return;
    }

    if (cancelled.current) return;

    const needsRecovery = response.recoveryAttempts.some(
      (attempt) => attempt.status === "fail",
    );
    const sequence = response.stages.filter(
      (stage) => !stage.conditional || needsRecovery,
    );
    const finalVerifyId: StageId = needsRecovery ? "reverify" : "verify";

    setUnits(response.originalContext);
    setLiveTokens(response.metrics.originalTokens);
    setStages(sequence.map((stage) => ({ stage, status: "pending" })));

    for (const stage of sequence) {
      if (cancelled.current) return;

      setActiveStageId(stage.id);
      setStages((prev) =>
        prev.map((entry) =>
          entry.stage.id === stage.id
            ? { ...entry, status: "running" }
            : entry,
        ),
      );

      await wait(stageDwellMs(stage));
      if (cancelled.current) return;

      const settled: StageStatus =
        stage.id === "verify" && needsRecovery
          ? "failed"
          : stage.id === "recover"
            ? "recovered"
            : "done";

      setStages((prev) =>
        prev.map((entry) =>
          entry.stage.id === stage.id ? { ...entry, status: settled } : entry,
        ),
      );

      if (stage.id === "verify" && needsRecovery) {
        setFailedAttempt(
          response.recoveryAttempts.find((a) => a.status === "fail") ?? null,
        );
      }
      if (stage.id === "recover") {
        setRecoveredRefs(
          response.recoveryAttempts.find((a) => a.recoveredRefs.length > 0)
            ?.recoveredRefs ?? [],
        );
      }
      if (stage.id === "consolidate") {
        setLiveTokens(response.metrics.firstPassTokens);
      }
      if (stage.id === finalVerifyId) {
        setLiveTokens(response.metrics.compiledTokens);
      }
    }

    if (cancelled.current) return;

    setActiveStageId(null);
    setResult(response);
    setRun(response);
    setRunPhase("settled");
    setPhase("complete");
  }, [clearTimers, mode, phase, setRun, setRunPhase, task, wait]);

  const reset = useCallback(() => {
    cancelled.current = true;
    clearTimers();
    cancelled.current = false;
    setPhase("empty");
    setRunPhase("seeded");
    setUnits([]);
    setResult(null);
    setError(null);
    setFailedAttempt(null);
    setRecoveredRefs([]);
    setActiveStageId(null);
    setLiveTokens(0);
    setTask("");
    setStages(
      run.stages
        .filter((stage) => !stage.conditional)
        .map((stage) => ({ stage, status: "pending" as StageStatus })),
    );
  }, [clearTimers, run.stages, setRunPhase]);

  const loadDemo = useCallback(() => {
    cancelled.current = true;
    clearTimers();
    cancelled.current = false;
    setPhase("ready");
    // Same contradiction as reset(): the workspace is back to awaiting a run,
    // so the header must stop presenting the figures as current.
    setRunPhase("seeded");
    setUnits(DEMO_CONTEXT_UNITS);
    setTask(DEMO_TASK);
    setResult(null);
    setError(null);
    setFailedAttempt(null);
    setRecoveredRefs([]);
    setActiveStageId(null);
    setLiveTokens(
      DEMO_CONTEXT_UNITS.reduce((total, unit) => total + unit.tokens, 0),
    );
    setStages(
      run.stages
        .filter((stage) => !stage.conditional)
        .map((stage) => ({ stage, status: "pending" as StageStatus })),
    );
  }, [clearTimers, run.stages, setRunPhase]);

  const settledCount = stages.filter(
    (entry) => entry.status !== "pending" && entry.status !== "running",
  ).length;

  return {
    phase,
    task,
    setTask,
    units,
    stages,
    activeStageId,
    result,
    error,
    failedAttempt,
    recoveredRefs,
    liveTokens,
    progress: stages.length === 0 ? 0 : settledCount / stages.length,
    compile: () => void compile(),
    reset,
    loadDemo,
  };
}
