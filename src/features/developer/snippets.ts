/**
 * Code shown on the Developer page. Kept in one module so the page stays
 * layout-only and the snippets can be checked against the real contracts.
 */
export const SNIPPETS = {
  install: `npm install @consolid8/sdk`,

  quickstart: `import { Consolid8 } from "@consolid8/sdk";

const consolid8 = new Consolid8();

const result = await consolid8.compile({
  messages,
  task: "Prepare the production deployment plan and identify required approvals."
});

console.log(result.compiledContext);
console.log(result.metrics.tokenReduction);
console.log(result.verification.status);`,

  verify: `const { metrics, verification } = result;

// 72418 -> 18413 (74.6% smaller)
console.log(metrics.originalTokens, metrics.compiledTokens);

if (verification.status !== "pass") {
  // Consolid8 exhausted recovery. Fall back rather than ship a gap.
  return callModel(messages);
}

// Which requirements needed restoring, and from where
const recovered = verification.requirements.filter(
  (requirement) => requirement.status === "recovered"
);`,

  send: `const response = await model.messages.create({
  model: "claude-sonnet-5",
  max_tokens: 2048,
  messages: result.compiledContext.map((unit) => ({
    role: "user",
    content: unit.text
  }))
});`,

  restRequest: `{
  "task": "Prepare the production deployment plan and identify required approvals.",
  "messages": [
    { "role": "user", "content": "Production data must remain in EU-WEST." },
    { "role": "assistant", "content": "Noted." }
  ],
  "budget": 20000
}`,

  restResponse: `{
  "runId": "C-1042",
  "metrics": {
    "originalTokens": 72418,
    "compiledTokens": 18413,
    "firstPassTokens": 15920,
    "tokenReduction": 0.7457,
    "criticalConstraintsPreserved": 12,
    "criticalConstraintsTotal": 12,
    "recoveryPasses": 1,
    "latencyMs": 1847
  },
  "verification": {
    "status": "pass",
    "satisfied": 30,
    "total": 30,
    "recoveryPasses": 1
  },
  "compiledContext": [
    {
      "id": "u-127",
      "ref": "Message #127",
      "text": "Production data must remain in EU-WEST.",
      "classification": "pinned",
      "risk": "critical",
      "tokens": 9
    }
  ],
  "conflicts": [
    {
      "topic": "Production deployment region",
      "staleValue": "US-EAST-1",
      "currentValue": "EU-WEST-1",
      "resolvedBy": "explicit_override"
    }
  ]
}`,

  types: `interface CompilationResponse {
  runId: string;
  task: string;
  originalContext: ContextUnit[];
  compiledContext: ContextUnit[];
  sections: CompiledSection[];
  metrics: CompilationMetrics;
  verification: VerificationResult;
  conflicts: Conflict[];
  recoveryAttempts: RecoveryAttempt[];
}

interface ContextUnit {
  id: string;
  ref: string;
  text: string;
  tokens: number;
  compiledTokens: number;
  classification:
    | "pinned"
    | "retrieved"
    | "cacheable"
    | "compressed"
    | "omitted"
    | "stale";
  risk: "critical" | "high" | "medium" | "low";
  trust: "trusted" | "standard" | "limited" | "untrusted";
  relevance: number;
  included: boolean;
  reason: string;
}

interface RecoveryAttempt {
  attempt: number;
  tokens: number;
  constraintsSatisfied: number;
  constraintsTotal: number;
  status: "pass" | "fail";
  missing: string[];
  recoveredRefs: string[];
}`,
} as const;
