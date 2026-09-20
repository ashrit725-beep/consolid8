"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CompilationResponse, RuntimeMode } from "@/types/compilation";
import { DEMO_COMPILATION } from "@/lib/demo";

/** Where the current run sits relative to the figures on screen. */
export type RunPhase = "seeded" | "running" | "settled";

/**
 * The entire global surface of the app. Three values, deliberately.
 * Anything a single feature owns stays in that feature.
 *
 * `runPhase` is a deliberate fourth value and the documented exception to that
 * rule: the Topbar renders on every route, so it cannot read the compiler's
 * local phase, yet it must not assert a PASS for a run that has not happened.
 * Any further additions should go back to being feature-local.
 */
export interface RuntimeState {
  mode: RuntimeMode;
  setMode: (mode: RuntimeMode) => void;
  /** Most recent compilation. Seeded with the demo run so every page renders. */
  run: CompilationResponse;
  setRun: (run: CompilationResponse) => void;
  /**
   * Whether `run` is the seeded/historical fixture, an in-flight compilation,
   * or the result the user just watched settle. Drives the global readout.
   */
  runPhase: RunPhase;
  setRunPhase: (runPhase: RunPhase) => void;
  /** Cross-page selection used by the Inspector drawer. */
  selectedUnitId: string | null;
  selectUnit: (unitId: string | null) => void;
}

const RuntimeContext = createContext<RuntimeState | null>(null);

export function RuntimeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<RuntimeMode>("demo");
  const [run, setRun] = useState<CompilationResponse>(DEMO_COMPILATION);
  const [runPhase, setRunPhase] = useState<RunPhase>("seeded");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  const selectUnit = useCallback((unitId: string | null) => {
    setSelectedUnitId(unitId);
  }, []);

  const value = useMemo<RuntimeState>(
    () => ({
      mode,
      setMode,
      run,
      setRun,
      runPhase,
      setRunPhase,
      selectedUnitId,
      selectUnit,
    }),
    [mode, run, runPhase, selectedUnitId, selectUnit],
  );

  return (
    <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
  );
}

export function useRuntime(): RuntimeState {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error("useRuntime must be used inside <RuntimeProvider>.");
  }
  return context;
}
