import type {
  AuthorityLevel,
  ContextCategory,
  ContextClassification,
  RiskLevel,
  SourceTrust,
} from "@/types/context";
import type {
  RequirementCategory,
  RequirementStatus,
  VerificationStatus,
} from "@/types/verification";
import type { StageStatus } from "@/types/compilation";

/**
 * Every colour decision in the product resolves through this file.
 * Components must not hand-pick hex values or one-off Tailwind colours.
 */
export interface ToneStyle {
  /** Display text, always uppercase-safe. */
  label: string;
  /** Tailwind text colour utility. */
  text: string;
  /** Tailwind background utility (tinted, low alpha). */
  bg: string;
  /** Tailwind border utility. */
  border: string;
  /** Solid colour for bars, strips and SVG charts. */
  hex: string;
  /** Terse one-liner used in legends and tooltips. */
  hint: string;
}

/**
 * THE COLOUR CONTRACT — read before adding or changing any entry below.
 *
 *   green  (signal / pinned)  = verified, preserved, passed
 *   amber  (warn)             = recovered, degraded, compressed
 *   red    (danger/critical)  = failed, missing, policy-breaking
 *   slate  (omitted / fg-dim) = dropped, idle, not required
 *
 * Status is NEVER carried by colour alone: every swatch ships with a label,
 * and every hue here is paired with `label` and `hint` for exactly that reason.
 *
 * A success metric must never borrow a fault hue. Do not paint a savings
 * figure red because it is a reduction, and do not paint a recovered item
 * green because it ended up fine — it ended up amber.
 */
export const CLASSIFICATION_STYLES: Record<ContextClassification, ToneStyle> = {
  pinned: {
    label: "PINNED",
    text: "text-pinned",
    bg: "bg-pinned/10",
    border: "border-pinned/25",
    hex: "#3fd98b",
    hint: "Must survive compilation verbatim",
  },
  retrieved: {
    label: "RETRIEVED",
    text: "text-retrieved",
    bg: "bg-retrieved/10",
    border: "border-retrieved/25",
    hex: "#5aa2ff",
    hint: "Pulled back in because the task needs it",
  },
  cacheable: {
    label: "CACHEABLE",
    text: "text-cacheable",
    bg: "bg-cacheable/10",
    border: "border-cacheable/25",
    hex: "#46c6d9",
    hint: "Stable across runs — served from prefix cache",
  },
  compressed: {
    label: "COMPRESSED",
    text: "text-compressed",
    bg: "bg-compressed/10",
    border: "border-compressed/25",
    hex: "#e0a84b",
    hint: "Rewritten to a shorter lossless-enough form",
  },
  omitted: {
    label: "OMITTED",
    text: "text-omitted",
    bg: "bg-omitted/10",
    border: "border-omitted/25",
    hex: "#707a8a",
    hint: "Not required by this task",
  },
  stale: {
    label: "STALE",
    text: "text-stale",
    bg: "bg-stale/10",
    border: "border-stale/25",
    hex: "#e0703c",
    hint: "Superseded by newer, higher-authority context",
  },
};

export const RISK_STYLES: Record<RiskLevel, ToneStyle> = {
  critical: {
    label: "CRITICAL",
    text: "text-critical",
    bg: "bg-critical/10",
    border: "border-critical/25",
    hex: "#ff5d5d",
    hint: "Dropping this changes the outcome or breaks policy",
  },
  high: {
    label: "HIGH",
    text: "text-warn",
    bg: "bg-warn/10",
    border: "border-warn/25",
    hex: "#e0a84b",
    hint: "Materially degrades the response",
  },
  medium: {
    label: "MEDIUM",
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/25",
    hex: "#5aa2ff",
    hint: "Useful, recoverable if lost",
  },
  low: {
    label: "LOW",
    text: "text-fg-dim",
    bg: "bg-fg-dim/10",
    border: "border-fg-dim/20",
    hex: "#707a8a",
    hint: "Safe to drop",
  },
};

export const VERIFICATION_STYLES: Record<VerificationStatus, ToneStyle> = {
  pass: {
    label: "PASS",
    text: "text-signal",
    bg: "bg-signal/10",
    border: "border-signal/25",
    hex: "#3fd98b",
    hint: "All requirements satisfied",
  },
  fail: {
    label: "FAIL",
    text: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/25",
    hex: "#ff5d5d",
    hint: "At least one requirement is missing",
  },
  running: {
    label: "RUNNING",
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/25",
    hex: "#5aa2ff",
    hint: "Verification in progress",
  },
  idle: {
    label: "IDLE",
    text: "text-fg-dim",
    bg: "bg-fg-dim/10",
    border: "border-fg-dim/20",
    hex: "#707a8a",
    hint: "Nothing compiled yet",
  },
};

export const REQUIREMENT_STATUS_STYLES: Record<RequirementStatus, ToneStyle> = {
  preserved: {
    label: "PRESERVED",
    text: "text-signal",
    bg: "bg-signal/10",
    border: "border-signal/25",
    hex: "#3fd98b",
    hint: "Survived the first compilation pass",
  },
  recovered: {
    label: "RECOVERED",
    text: "text-warn",
    bg: "bg-warn/10",
    border: "border-warn/25",
    hex: "#e0a84b",
    hint: "Restored by auto-recovery after a failed pass",
  },
  missing: {
    label: "MISSING",
    text: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/25",
    hex: "#ff5d5d",
    hint: "Absent from the compiled context",
  },
};

export const TRUST_STYLES: Record<SourceTrust, ToneStyle> = {
  trusted: {
    label: "TRUSTED",
    text: "text-signal",
    bg: "bg-signal/10",
    border: "border-signal/25",
    hex: "#3fd98b",
    hint: "May assert instructions and policy",
  },
  standard: {
    label: "STANDARD",
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/25",
    hex: "#5aa2ff",
    hint: "May assert intent, not policy",
  },
  limited: {
    label: "LIMITED",
    text: "text-compressed",
    bg: "bg-compressed/10",
    border: "border-compressed/25",
    hex: "#e0a84b",
    hint: "Data only — instructions are ignored",
  },
  untrusted: {
    label: "UNTRUSTED",
    text: "text-conflict",
    bg: "bg-conflict/10",
    border: "border-conflict/25",
    hex: "#f2557a",
    hint: "Instructions are stripped before compilation",
  },
};

export const STAGE_STATUS_STYLES: Record<StageStatus, ToneStyle> = {
  pending: {
    // Grey chrome, not a status hue: keep in sync with --color-fg-faint.
    label: "PENDING",
    text: "text-fg-faint",
    bg: "bg-fg-dim/5",
    border: "border-line",
    hex: "#5b6373",
    hint: "Queued",
  },
  running: {
    label: "RUNNING",
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    hex: "#5aa2ff",
    hint: "Executing",
  },
  done: {
    label: "DONE",
    text: "text-signal",
    bg: "bg-signal/10",
    border: "border-signal/25",
    hex: "#3fd98b",
    hint: "Complete",
  },
  failed: {
    label: "FAILED",
    text: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/30",
    hex: "#ff5d5d",
    hint: "Requirements missing",
  },
  recovered: {
    label: "RECOVERED",
    text: "text-warn",
    bg: "bg-warn/10",
    border: "border-warn/30",
    hex: "#e0a84b",
    hint: "Context restored automatically",
  },
};

export const CATEGORY_STYLES: Record<ContextCategory, ToneStyle> = {
  policy: {
    label: "POLICY",
    text: "text-pinned",
    bg: "bg-pinned/10",
    border: "border-pinned/25",
    hex: "#3fd98b",
    hint: "Business or operational rule",
  },
  security: {
    label: "SECURITY",
    text: "text-critical",
    bg: "bg-critical/10",
    border: "border-critical/25",
    hex: "#ff5d5d",
    hint: "Security and residency control",
  },
  // Category hues are a separate channel from classification and risk; do not alias.
  state: {
    label: "STATE",
    text: "text-[#8b7bd8]",
    bg: "bg-[#8b7bd8]/10",
    border: "border-[#8b7bd8]/25",
    hex: "#8b7bd8",
    hint: "Current system or workflow state",
  },
  memory: {
    label: "MEMORY",
    text: "text-cacheable",
    bg: "bg-cacheable/10",
    border: "border-cacheable/25",
    hex: "#46c6d9",
    hint: "Durable user or org memory",
  },
  chat: {
    label: "CHAT",
    text: "text-omitted",
    bg: "bg-omitted/10",
    border: "border-omitted/25",
    hex: "#707a8a",
    hint: "Conversation turn",
  },
  tool_output: {
    label: "TOOL OUTPUT",
    text: "text-compressed",
    bg: "bg-compressed/10",
    border: "border-compressed/25",
    hex: "#e0a84b",
    hint: "Result returned by a tool call",
  },
  document: {
    label: "DOCUMENT",
    text: "text-conflict",
    bg: "bg-conflict/10",
    border: "border-conflict/25",
    hex: "#f2557a",
    hint: "Uploaded or attached file",
  },
  retrieval: {
    label: "RETRIEVAL",
    text: "text-retrieved",
    bg: "bg-retrieved/10",
    border: "border-retrieved/25",
    hex: "#5aa2ff",
    hint: "Retrieved passage",
  },
  task: {
    label: "TASK",
    text: "text-fg",
    bg: "bg-fg/10",
    border: "border-fg/20",
    hex: "#e7eaf0",
    hint: "The request being served",
  },
};

export const AUTHORITY_LABELS: Record<AuthorityLevel, string> = {
  system: "System",
  security_policy: "Security Policy",
  business_policy: "Business Policy",
  operator: "Operator",
  user: "User",
  agent: "Agent",
  tool: "Tool Output",
  document: "Document",
  web: "Web",
};

/** Ordered high → low. Conflicts resolve toward the front of this list. */
export const AUTHORITY_ORDER: AuthorityLevel[] = [
  "system",
  "security_policy",
  "business_policy",
  "operator",
  "user",
  "agent",
  "tool",
  "document",
  "web",
];

export const REQUIREMENT_CATEGORY_LABELS: Record<RequirementCategory, string> = {
  critical_fact: "Critical Facts",
  policy: "Policies",
  dependency: "Dependencies",
  current_state: "Current State",
};

export const RISK_ORDER: RiskLevel[] = ["critical", "high", "medium", "low"];

export const CLASSIFICATION_ORDER: ContextClassification[] = [
  "pinned",
  "retrieved",
  "cacheable",
  "compressed",
  "omitted",
  "stale",
];
