import type {
  AuthorityLevel,
  ContextClassification,
  RiskLevel,
} from "@/types/context";

export type InspectorTab =
  | "all"
  | ContextClassification
  | "recovered"
  | "conflicts";

export interface InspectorFilters {
  tab: InspectorTab;
  query: string;
  risk: RiskLevel | "any";
  authority: AuthorityLevel | "any";
  included: "any" | "yes" | "no";
}

export type SortKey = "relevance" | "tokens" | "risk" | "ref";
