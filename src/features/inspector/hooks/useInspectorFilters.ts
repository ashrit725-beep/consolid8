"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ContextUnit } from "@/types/context";
import {
  AUTHORITY_ORDER,
  CLASSIFICATION_ORDER,
  RISK_ORDER,
} from "@/config/statusStyles";
import type { InspectorFilters, InspectorTab, SortKey } from "../types";

const DEFAULTS: InspectorFilters = {
  tab: "all",
  query: "",
  risk: "any",
  authority: "any",
  included: "any",
};

const DEFAULT_SORT: SortKey = "relevance";

/** Every value the URL is allowed to carry. Anything else falls back. */
const TAB_VALUES: readonly string[] = [
  "all",
  ...CLASSIFICATION_ORDER,
  "recovered",
  "conflicts",
];
const RISK_VALUES: readonly string[] = ["any", ...RISK_ORDER];
const AUTHORITY_VALUES: readonly string[] = ["any", ...AUTHORITY_ORDER];
const INCLUDED_VALUES: readonly string[] = ["any", "yes", "no"];
const SORT_VALUES: readonly string[] = ["relevance", "tokens", "risk", "ref"];

/**
 * A URL is user input: `?risk=banana` must degrade to the default rather than
 * render an empty table or crash a lookup into a style map.
 */
function coerce<T extends string>(
  raw: string | null,
  allowed: readonly string[],
  fallback: T,
): T {
  return raw !== null && allowed.includes(raw) ? (raw as T) : fallback;
}

/**
 * Filter state lives in the URL, so `/inspector?classification=pinned` is a
 * shareable link and the rest of the app can deep-link into a view without
 * any global state.
 */
export function useInspectorFilters(units: ContextUnit[]) {
  const router = useRouter();
  const params = useSearchParams();

  const filters: InspectorFilters = useMemo(
    () => ({
      tab: coerce<InspectorTab>(
        params.get("classification"),
        TAB_VALUES,
        DEFAULTS.tab,
      ),
      query: params.get("q") ?? DEFAULTS.query,
      risk: coerce<InspectorFilters["risk"]>(
        params.get("risk"),
        RISK_VALUES,
        DEFAULTS.risk,
      ),
      authority: coerce<InspectorFilters["authority"]>(
        params.get("authority"),
        AUTHORITY_VALUES,
        DEFAULTS.authority,
      ),
      included: coerce<InspectorFilters["included"]>(
        params.get("included"),
        INCLUDED_VALUES,
        DEFAULTS.included,
      ),
    }),
    [params],
  );

  const sort = coerce<SortKey>(params.get("sort"), SORT_VALUES, DEFAULT_SORT);

  const update = useCallback(
    (patch: Partial<InspectorFilters & { sort: SortKey }>) => {
      const next = new URLSearchParams(params.toString());
      const keyMap: Record<string, string> = {
        tab: "classification",
        query: "q",
        risk: "risk",
        authority: "authority",
        included: "included",
        sort: "sort",
      };

      for (const [key, value] of Object.entries(patch)) {
        const param = keyMap[key] ?? key;
        const isDefault =
          value === undefined ||
          value === "" ||
          value === "any" ||
          (key === "tab" && value === "all") ||
          (key === "sort" && value === DEFAULT_SORT);
        if (isDefault) next.delete(param);
        else next.set(param, String(value));
      }

      const query = next.toString();
      router.replace(query ? `/inspector?${query}` : "/inspector", {
        scroll: false,
      });
    },
    [params, router],
  );

  const results = useMemo(() => {
    const q = filters.query.trim().toLowerCase();

    const filtered = units.filter((unit) => {
      if (filters.tab === "conflicts") {
        if (!unit.supersededBy && !unit.supersedes) return false;
      } else if (filters.tab === "recovered") {
        if (!unit.recovered) return false;
      } else if (filters.tab !== "all" && unit.classification !== filters.tab) {
        return false;
      }
      if (filters.risk !== "any" && unit.risk !== filters.risk) return false;
      if (filters.authority !== "any" && unit.authority !== filters.authority) {
        return false;
      }
      if (filters.included === "yes" && !unit.included) return false;
      if (filters.included === "no" && unit.included) return false;
      if (
        q &&
        !unit.text.toLowerCase().includes(q) &&
        !unit.label.toLowerCase().includes(q) &&
        !unit.ref.toLowerCase().includes(q) &&
        !unit.reason.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "tokens":
          return b.tokens - a.tokens;
        case "risk":
          return RISK_ORDER.indexOf(a.risk) - RISK_ORDER.indexOf(b.risk);
        case "ref":
          return a.ref.localeCompare(b.ref);
        default:
          return b.relevance - a.relevance;
      }
    });
  }, [units, filters, sort]);

  const reset = useCallback(() => {
    router.replace("/inspector", { scroll: false });
  }, [router]);

  return { filters, sort, update, results, reset };
}
