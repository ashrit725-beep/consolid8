"use client";

import { Suspense, useState } from "react";
import { GitBranch, ScanSearch, ShieldAlert } from "lucide-react";
import type { ContextUnit } from "@/types/context";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { SelectInput } from "@/components/ui/SearchInput";
import { Skeleton } from "@/components/ui/Skeleton";
import FadeContent from "@/components/ui/FadeContent";
import {
  ConflictResolutionCard,
  ContextDetailDrawer,
  EmptyState,
  SourceTrustLegend,
} from "@/components/shared";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  CLASSIFICATION_ORDER,
  CLASSIFICATION_STYLES,
  TRUST_STYLES,
} from "@/config/statusStyles";
import { useRuntime } from "@/lib/state";
import { cn } from "@/lib/utils";
import { formatInt } from "@/lib/formatting";
import { useInspectorFilters } from "../hooks/useInspectorFilters";
import type { InspectorTab, SortKey } from "../types";
import { InspectorTable } from "./InspectorTable";
import { InspectorFilterBar } from "./InspectorFilters";

function InspectorBody() {
  const { run } = useRuntime();
  const units = run.originalContext;
  const { filters, sort, update, results, reset } = useInspectorFilters(units);
  const [selected, setSelected] = useState<ContextUnit | null>(null);

  const recovered = units.filter((unit) => unit.recovered);

  const tabs: TabItem<InspectorTab>[] = [
    { value: "all", label: "All", count: units.length },
    ...CLASSIFICATION_ORDER.map((classification) => ({
      value: classification as InspectorTab,
      label: CLASSIFICATION_STYLES[classification].label,
      count: units.filter((u) => u.classification === classification).length,
      hex: CLASSIFICATION_STYLES[classification].hex,
    })),
    { value: "conflicts", label: "Conflicts", count: run.conflicts.length },
  ];

  const untrusted = units.filter((unit) => unit.trust === "untrusted");

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_296px]">
        <Panel>
          <PanelHeader
            title="Context inspector"
            subtitle={`${units.length} units · every decision, with its reason`}
            icon={<ScanSearch size={13} />}
            actions={
              <SelectInput
                label="Sort by"
                value={sort}
                onChange={(next) => update({ sort: next as SortKey })}
                options={[
                  { value: "relevance", label: "Sort: relevance" },
                  { value: "tokens", label: "Sort: tokens" },
                  { value: "risk", label: "Sort: risk" },
                  { value: "ref", label: "Sort: source" },
                ]}
              />
            }
          />

          <Tabs
            className="shrink-0 px-3"
            label="Context classification"
            value={filters.tab}
            items={tabs}
            onChange={(tab) => update({ tab })}
          />

          <InspectorFilterBar
            filters={filters}
            onChange={update}
            onReset={reset}
            resultCount={
              filters.tab === "conflicts" ? run.conflicts.length : results.length
            }
            recoveredCount={recovered.length}
            units={units}
          />

          {filters.tab === "conflicts" ? (
            <div className="grid min-h-[620px] grow basis-0 auto-rows-min gap-3 overflow-y-auto p-4 lg:grid-cols-2">
              {run.conflicts.map((conflict, index) => (
                <FadeContent
                  key={conflict.id}
                  duration={340}
                  delay={index * 80}
                  threshold={0.02}
                >
                  <ConflictResolutionCard conflict={conflict} />
                </FadeContent>
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="min-h-[620px] grow basis-0 p-4">
              <EmptyState
                title="No context units match these filters"
                description="Loosen a filter or clear the search to see the rest of the decisions."
              />
            </div>
          ) : (
            <div className="min-h-[620px] grow basis-0 overflow-y-auto">
              <InspectorTable
                units={results}
                sort={sort}
                onSortChange={(next) => update({ sort: next })}
                onSelect={setSelected}
                selectedId={selected?.id ?? null}
              />
            </div>
          )}
        </Panel>

        <div className="flex flex-col gap-4">
          <Panel>
            <PanelHeader
              title="Source trust"
              subtitle="Instructions only flow from trusted origins"
              icon={<ShieldAlert size={13} />}
            />
            <div className="p-3">
              <SourceTrustLegend />
            </div>
          </Panel>

          {untrusted.length > 0 ? (
            <Panel className="border-conflict/25">
              <PanelHeader
                title="Blocked instruction"
                subtitle="Untrusted source attempted an override"
              />
              <div className="space-y-3 p-3.5">
                {untrusted.map((unit) => (
                  <div key={unit.id}>
                    <blockquote className="rounded-md border border-conflict/25 bg-conflict/[0.06] px-3 py-2.5 text-[12.5px] leading-snug text-fg">
                      “{unit.text}”
                    </blockquote>
                    <dl className="mt-2.5 space-y-1.5 text-[11.5px]">
                      <Row label="Source">
                        <span className="num text-fg-muted">{unit.ref}</span>
                      </Row>
                      <Row label="Trust">
                        <StatusBadge tone={TRUST_STYLES[unit.trust]} />
                      </Row>
                      <Row label="Decision">
                        <StatusBadge
                          tone={CLASSIFICATION_STYLES[unit.classification]}
                        />
                      </Row>
                    </dl>
                    <p className="mt-2 border-t border-line pt-2 text-[11.5px] leading-snug text-fg-muted">
                      {unit.reason}
                    </p>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          <Panel>
            <PanelHeader
              title="Conflicts resolved"
              subtitle={`${run.conflicts.length} contradictions removed`}
              icon={<GitBranch size={13} />}
            />
            <ul className="divide-y divide-line">
              {run.conflicts.map((conflict) => (
                <li key={conflict.id} className="px-3.5 py-2.5">
                  <p className="text-[11.5px] font-medium text-fg-muted">
                    {conflict.topic}
                  </p>
                  <p className="num mt-1 flex items-center gap-2 text-[11.5px]">
                    <span
                      className={cn(
                        "line-through",
                        CLASSIFICATION_STYLES.stale.text,
                      )}
                    >
                      {conflict.staleValue}
                    </span>
                    <span className="text-fg-faint">→</span>
                    <span className={CLASSIFICATION_STYLES.pinned.text}>
                      {conflict.currentValue}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title="Token accounting" subtitle="Canonical vs compiled" />
            <dl className="divide-y divide-line">
              <Stat
                label="Canonical"
                value={formatInt(run.metrics.originalTokens)}
              />
              <Stat
                label="Compiled"
                value={formatInt(run.metrics.compiledTokens)}
                tone="text-signal"
              />
              <Stat
                label="Removed"
                value={formatInt(run.metrics.tokensSaved)}
                tone="text-fg-muted"
              />
              <Stat
                label="Duplicates dropped"
                value={String(run.metrics.duplicatesOmitted)}
              />
              <Stat
                label="Conflicts resolved"
                value={String(run.metrics.conflictsResolved)}
              />
            </dl>
          </Panel>
        </div>
      </div>

      <ContextDetailDrawer
        unit={selected}
        units={units}
        onClose={() => setSelected(null)}
        onSelectUnit={setSelected}
      />
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="label-xs">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  tone = "text-fg",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 px-3.5 py-2">
      <dt className="label-xs">{label}</dt>
      <dd className={`num text-[12px] ${tone}`}>{value}</dd>
    </div>
  );
}

/** useSearchParams requires a Suspense boundary in the App Router. */
export function ContextInspector() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_296px]">
          <Skeleton className="h-[620px]" />
          <Skeleton className="h-[620px]" />
        </div>
      }
    >
      <InspectorBody />
    </Suspense>
  );
}
