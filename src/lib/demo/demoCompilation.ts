import type { CompiledSection, ContextUnit } from "@/types/context";
import type {
  CompilationMetrics,
  CompilationResponse,
  PipelineStage,
} from "@/types/compilation";
import { reductionRatio } from "@/lib/tokens/estimate";
import {
  DEMO_CONTEXT_UNITS,
  DEMO_RECOVERED_UNIT_IDS,
  DEMO_SOURCE_MESSAGE_COUNT,
  DEMO_TASK,
  DEMO_UNIT_INDEX,
} from "./demoConversation";
import {
  DEMO_ATTEMPT_ONE_TOKENS,
  DEMO_CONFLICTS,
  DEMO_CRITICAL_REQUIREMENTS,
  DEMO_RECOVERY_ATTEMPTS,
  DEMO_VERIFICATION,
} from "./demoVerification";

export const DEMO_RUN_ID = "C-1042";

const DEPENDENCY_UNIT_IDS = [
  "u-433",
  "u-436",
  "u-437",
  "u-438",
  "u-ret-3",
  "u-ret-4",
  "u-ret-5",
  "u-sch-1",
  "u-ret-6",
  "u-iam",
];

/** Describes a section by the refs it actually contains, never by hand. */
function provenanceOf(unitIds: string[]): string {
  const refs = unitIds.map((id) => DEMO_UNIT_INDEX.get(id)?.ref ?? "");
  const messages = refs.filter((ref) => ref.startsWith("Message")).length;
  const retrievals = refs.filter((ref) => ref.startsWith("Retrieval")).length;
  const toolCalls = refs
    .filter((ref) => ref.startsWith("Tool"))
    .map((ref) => ref.split(" ")[1] ?? "");
  const parts = [
    `${messages} messages`,
    `${retrievals} retrievals`,
    `tool calls ${toolCalls.join(", ")}`,
  ];
  return parts.join(" · ");
}

/** Ordered sections of the compiled context, as the model receives them. */
const SECTION_SEEDS: Array<Omit<CompiledSection, "tokens">> = [
  {
    id: "sec-constraints",
    title: "System Constraints",
    description:
      "Non-negotiable security and business rules that bound the task.",
    provenance: "Security & change-management policy · 15 messages",
    unitIds: [
      "u-127",
      "u-318",
      "u-204",
      "u-096",
      "u-231",
      "u-340",
      "u-329",
      "u-388",
      "u-366",
      "u-357",
      "u-350",
      "u-372",
      "u-377",
      "u-381",
      "u-393",
    ],
  },
  {
    id: "sec-state",
    title: "Active State",
    description:
      "The current, conflict-resolved picture of the production system.",
    provenance: "Operator declarations + live tool reads",
    unitIds: [
      "u-411",
      "u-402",
      "u-421",
      "u-424",
      "u-418",
      "u-419",
      "u-430",
      "u-431",
      "u-434",
      "u-tool-hc",
    ],
  },
  {
    id: "sec-dependencies",
    title: "Dependencies & Evidence",
    description:
      "Artifacts the plan depends on, each carrying a checkable fact.",
    provenance: provenanceOf(DEPENDENCY_UNIT_IDS),
    unitIds: DEPENDENCY_UNIT_IDS,
  },
  {
    id: "sec-memory",
    title: "Relevant Memory",
    description: "Durable preferences that shape the output format.",
    provenance: "Workspace memory · 3 of 41 entries",
    unitIds: ["u-mem-1", "u-mem-2", "u-mem-3"],
  },
  {
    id: "sec-history",
    title: "Compressed History",
    description:
      "Long threads and documents rewritten to the decisions they carry.",
    provenance: "8 sources · 36,090 tokens in",
    unitIds: [
      "u-doc-1",
      "u-tool-tf",
      "u-tool-ci",
      "u-hist-1",
      "u-hist-2",
      "u-ret-1",
      "u-doc-2",
      "u-hist-3",
    ],
  },
  {
    id: "sec-task",
    title: "Current Task",
    description: "The request being served.",
    provenance: "User turn",
    unitIds: ["u-task"],
  },
];

function sectionTokens(unitIds: string[]): number {
  return unitIds.reduce(
    (total, id) => total + (DEMO_UNIT_INDEX.get(id)?.compiledTokens ?? 0),
    0,
  );
}

export const DEMO_SECTIONS: CompiledSection[] = SECTION_SEEDS.map((seed) => ({
  ...seed,
  tokens: sectionTokens(seed.unitIds),
}));

export const DEMO_COMPILED_UNITS: ContextUnit[] = DEMO_CONTEXT_UNITS.filter(
  (unit) => unit.included,
);

const originalTokens = DEMO_CONTEXT_UNITS.reduce((t, u) => t + u.tokens, 0);
const compiledTokens = DEMO_COMPILED_UNITS.reduce(
  (t, u) => t + u.compiledTokens,
  0,
);

export const DEMO_METRICS: CompilationMetrics = {
  originalTokens,
  compiledTokens,
  firstPassTokens: DEMO_ATTEMPT_ONE_TOKENS,
  tokensSaved: originalTokens - compiledTokens,
  tokenReduction: reductionRatio(originalTokens, compiledTokens),
  unitsTotal: DEMO_CONTEXT_UNITS.length,
  unitsIncluded: DEMO_COMPILED_UNITS.length,
  unitsCompressed: DEMO_CONTEXT_UNITS.filter(
    (u) => u.classification === "compressed",
  ).length,
  unitsOmitted: DEMO_CONTEXT_UNITS.filter((u) => !u.included).length,
  duplicatesOmitted: 2,
  conflictsResolved: DEMO_CONFLICTS.length,
  criticalConstraintsTotal: DEMO_CRITICAL_REQUIREMENTS.length,
  criticalConstraintsPreserved: DEMO_CRITICAL_REQUIREMENTS.filter(
    (r) => r.status !== "missing",
  ).length,
  recoveryPasses: 1,
  latencyMs: 1847,
};

/**
 * Pipeline definition. `runningDetail` strings are shown while a stage is
 * active — real progress, never a bare spinner.
 */
export const DEMO_STAGES: PipelineStage[] = [
  {
    id: "ingest",
    label: "Ingesting",
    runningDetail: `Reading ${DEMO_SOURCE_MESSAGE_COUNT} source messages...`,
    doneDetail: `${DEMO_SOURCE_MESSAGE_COUNT} messages · ${originalTokens.toLocaleString("en-US")} tokens`,
    durationMs: 140,
  },
  {
    id: "segment",
    label: "Segmenting",
    runningDetail: "Splitting into addressable context units...",
    doneDetail: `${DEMO_CONTEXT_UNITS.length} context units`,
    durationMs: 180,
  },
  {
    id: "extract",
    label: "Extracting constraints",
    runningDetail: "Finding critical constraints and policies...",
    doneDetail: `${DEMO_VERIFICATION.total} requirements · ${DEMO_CRITICAL_REQUIREMENTS.length} critical`,
    durationMs: 260,
  },
  {
    id: "analyze",
    label: "Analyzing relevance",
    runningDetail: `Scoring ${DEMO_CONTEXT_UNITS.length} context units against the task...`,
    // Pre-recovery count: the recovered units scored *below* the threshold.
    doneDetail: `${DEMO_COMPILED_UNITS.length - DEMO_RECOVERED_UNIT_IDS.length} units above threshold`,
    durationMs: 420,
  },
  {
    id: "resolve",
    label: "Resolving conflicts",
    runningDetail: "Reconciling contradictory state...",
    doneDetail: `${DEMO_CONFLICTS.length} conflicts resolved · 2 duplicates dropped`,
    durationMs: 190,
  },
  {
    id: "consolidate",
    label: "Consolidating",
    runningDetail: "Rewriting long history into decisions...",
    doneDetail: `${DEMO_ATTEMPT_ONE_TOKENS.toLocaleString("en-US")} tokens`,
    durationMs: 310,
  },
  {
    id: "verify",
    label: "Verifying",
    runningDetail: `Checking ${DEMO_VERIFICATION.total} requirements against the compiled context...`,
    doneDetail: "11 / 12 critical constraints · FAIL",
    durationMs: 210,
  },
  {
    id: "recover",
    label: "Auto-recovery",
    runningDetail: "Restoring necessary context...",
    doneDetail: "Recovered Message #318 (+2 supporting artifacts)",
    durationMs: 90,
    conditional: true,
  },
  {
    id: "reverify",
    label: "Reverifying",
    runningDetail: "Re-checking every requirement...",
    doneDetail: "12 / 12 critical constraints · PASS",
    durationMs: 247,
    conditional: true,
  },
];

export const DEMO_COMPILATION: CompilationResponse = {
  runId: DEMO_RUN_ID,
  task: DEMO_TASK,
  createdAt: "2026-09-19T09:41:22.000Z",
  mode: "demo",
  originalContext: DEMO_CONTEXT_UNITS,
  compiledContext: DEMO_COMPILED_UNITS,
  sections: DEMO_SECTIONS,
  metrics: DEMO_METRICS,
  verification: DEMO_VERIFICATION,
  conflicts: DEMO_CONFLICTS,
  recoveryAttempts: DEMO_RECOVERY_ATTEMPTS,
  stages: DEMO_STAGES,
};
