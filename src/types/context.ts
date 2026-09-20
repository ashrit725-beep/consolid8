/**
 * Context primitives. Every feature describes context with these types —
 * never redefine them locally.
 */

/** What Consolid8 decided to do with a unit of context. */
export type ContextClassification =
  | "pinned"
  | "retrieved"
  | "cacheable"
  | "compressed"
  | "omitted"
  | "stale";

/** How damaging it would be to drop this unit. */
export type RiskLevel = "critical" | "high" | "medium" | "low";

/** Who or what asserted the information. Higher authority wins conflicts. */
export type AuthorityLevel =
  | "system"
  | "security_policy"
  | "business_policy"
  | "operator"
  | "user"
  | "agent"
  | "tool"
  | "document"
  | "web";

/** How much the runtime trusts instructions coming from this origin. */
export type SourceTrust = "trusted" | "standard" | "limited" | "untrusted";

/** Coarse bucket used for composition charts and the before/after flow. */
export type ContextCategory =
  | "policy"
  | "security"
  | "state"
  | "memory"
  | "chat"
  | "tool_output"
  | "document"
  | "retrieval"
  | "task";

export interface ContextUnit {
  id: string;
  /** Human-facing origin, e.g. "Message #127". */
  ref: string;
  category: ContextCategory;
  /** Short title, e.g. "Security Policy". */
  label: string;
  text: string;
  /** Token cost in the canonical (uncompiled) context. */
  tokens: number;
  /** Token cost after consolidation. Equals `tokens` unless compressed. */
  compiledTokens: number;
  classification: ContextClassification;
  risk: RiskLevel;
  authority: AuthorityLevel;
  trust: SourceTrust;
  /** 0..1 relevance to the active task. */
  relevance: number;
  included: boolean;
  /** Plain-language justification shown in the Inspector drawer. */
  reason: string;
  dependencies: string[];
  /** True when the unit only survived because auto-recovery restored it. */
  recovered?: boolean;
  /** Id of the unit that replaced this one. */
  supersededBy?: string;
  /** Id of the unit this one replaced. */
  supersedes?: string;
  turn?: number;
}

/** A named group of compiled context, e.g. "SYSTEM CONSTRAINTS". */
export interface CompiledSection {
  id: string;
  title: string;
  description: string;
  unitIds: string[];
  tokens: number;
  /** Where the section's content was drawn from, e.g. "Messages #127, #318". */
  provenance: string;
}
