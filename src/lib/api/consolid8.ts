import type {
  CompilationResponse,
  CompilationRun,
  RuntimeMode,
} from "@/types/compilation";
import type { AnalyticsSnapshot } from "@/types/analytics";
import type { StressTestResult } from "@/types/stress-test";
import type { VerificationResult } from "@/types/verification";
import {
  DEMO_ANALYTICS,
  DEMO_COMPILATION,
  DEMO_RECENT_RUNS,
  DEMO_STRESS_TEST,
  DEMO_VERIFICATION,
} from "@/lib/demo";
import { LIVE_BACKEND_CONFIGURED, request } from "./client";
import { Consolid8ApiError } from "./errors";

export interface CompileInput {
  task: string;
  /** Raw conversation when running live. Ignored in demo mode. */
  messages?: Array<{ role: string; content: string }>;
  /** Optional budget hint for the runtime, in tokens. */
  budget?: number;
}

/**
 * The contract every feature codes against. Swapping the demo runtime for the
 * real one is a single call to `getApi("live")` — no component changes.
 */
export interface Consolid8Api {
  readonly mode: RuntimeMode;
  compileContext(input: CompileInput): Promise<CompilationResponse>;
  getCompilation(runId: string): Promise<CompilationResponse>;
  getRunHistory(): Promise<CompilationRun[]>;
  runVerification(runId: string): Promise<VerificationResult>;
  runStressTest(input: CompileInput): Promise<StressTestResult>;
  getAnalytics(): Promise<AnalyticsSnapshot>;
}

function delay<T>(value: T, ms: number): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * Demo runtime. Returns the same shapes the live runtime returns, so the UI
 * cannot tell them apart. Latencies are small — the visible pipeline timing
 * lives in the compiler feature, not here.
 */
export const demoApi: Consolid8Api = {
  mode: "demo",

  async compileContext(input) {
    if (!input.task.trim()) {
      throw new Consolid8ApiError(
        "missing_task",
        "A task is required.",
        "Consolid8 selects context relative to a task. Describe what the model needs to do.",
      );
    }
    return delay({ ...DEMO_COMPILATION, task: input.task }, 120);
  },

  async getCompilation(runId) {
    if (runId !== DEMO_COMPILATION.runId) {
      throw new Consolid8ApiError("not_found", `Run ${runId} was not found.`);
    }
    return delay(DEMO_COMPILATION, 60);
  },

  async getRunHistory() {
    return delay(DEMO_RECENT_RUNS, 60);
  },

  async runVerification() {
    return delay(DEMO_VERIFICATION, 90);
  },

  async runStressTest() {
    return delay(DEMO_STRESS_TEST, 120);
  },

  async getAnalytics() {
    return delay(DEMO_ANALYTICS, 90);
  },
};

/** Live runtime. Endpoint shapes match `docs` on the Developer page. */
export const liveApi: Consolid8Api = {
  mode: "live",

  compileContext(input) {
    if (!input.task.trim()) {
      throw new Consolid8ApiError("missing_task", "A task is required.");
    }
    return request<CompilationResponse>("/api/compile", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getCompilation(runId) {
    return request<CompilationResponse>(
      `/api/compilations/${encodeURIComponent(runId)}`,
    );
  },

  getRunHistory() {
    return request<CompilationRun[]>("/api/compilations");
  },

  runVerification(runId) {
    return request<VerificationResult>(
      `/api/compilations/${encodeURIComponent(runId)}/verify`,
      { method: "POST" },
    );
  },

  runStressTest(input) {
    return request<StressTestResult>("/api/stress-test", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  getAnalytics() {
    return request<AnalyticsSnapshot>("/api/analytics");
  },
};

export function getApi(mode: RuntimeMode): Consolid8Api {
  return mode === "live" ? liveApi : demoApi;
}

export { LIVE_BACKEND_CONFIGURED };
export { Consolid8ApiError } from "./errors";
export type { ApiErrorKind } from "./errors";
