"use client";

import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import type { ContextUnit } from "@/types/context";
import { Panel, PanelFooter, PanelHeader } from "@/components/ui/Panel";
import { SearchInput } from "@/components/ui/SearchInput";
import AnimatedList from "@/components/ui/AnimatedList";
import { ContextUnitCard, EmptyState } from "@/components/shared";
import { Button } from "@/components/ui/Button";
import { DEMO_SOURCE_MESSAGE_COUNT } from "@/lib/demo";
import { formatInt } from "@/lib/formatting";

/**
 * Everything the model would receive without Consolid8.
 */
export function CanonicalContextPanel({
  units,
  onSelectUnit,
  selectedUnitId,
  onLoadDemo,
}: {
  units: ContextUnit[];
  onSelectUnit: (unit: ContextUnit) => void;
  selectedUnitId: string | null;
  onLoadDemo: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return units;
    return units.filter(
      (unit) =>
        unit.text.toLowerCase().includes(q) ||
        unit.label.toLowerCase().includes(q) ||
        unit.ref.toLowerCase().includes(q),
    );
  }, [units, query]);

  const total = units.reduce((sum, unit) => sum + unit.tokens, 0);

  return (
    <Panel className="h-[var(--panel-h,620px)]">
      <PanelHeader
        title="Canonical context"
        subtitle={
          units.length > 0
            ? `${units.length} units · ${DEMO_SOURCE_MESSAGE_COUNT} source messages`
            : "Nothing loaded"
        }
        icon={<Boxes size={13} />}
        actions={
          <span className="num text-[13px] font-medium text-fg">
            {formatInt(total)}
            <span className="text-[10px] text-fg-faint"> tok</span>
          </span>
        }
      />

      {units.length === 0 ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <EmptyState
            title="No context loaded"
            description="Paste a conversation or load the Consolid8 demo thread to see how much context a single task actually needs."
            action={
              <Button variant="primary" size="sm" onClick={onLoadDemo}>
                Load demo
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="border-b border-line px-3 py-2">
            <SearchInput
              label="Search canonical context"
              value={query}
              onChange={setQuery}
              placeholder={`Search ${units.length} units...`}
            />
          </div>

          <AnimatedList
            className="flex-1"
            items={filtered}
            getKey={(unit) => unit.id}
            onItemSelect={onSelectUnit}
            showGradients
            displayScrollbar
            emptyState={
              <p className="px-1 py-6 text-center text-[12px] text-fg-dim">
                No context units match “{query}”.
              </p>
            }
            renderItem={(unit) => (
              <ContextUnitCard
                unit={unit}
                selected={unit.id === selectedUnitId}
                density="compact"
              />
            )}
          />

          <PanelFooter className="justify-between">
            <span className="num text-[10px] text-fg-faint">
              {filtered.length} shown · {units.length} total
            </span>
            <span className="text-[10px] text-fg-faint">
              Click any unit for the full decision
            </span>
          </PanelFooter>
        </>
      )}
    </Panel>
  );
}
