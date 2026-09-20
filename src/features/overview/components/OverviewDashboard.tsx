"use client";

import Link from "next/link";
import { ArrowRight, Layers, ScanSearch, ShieldCheck } from "lucide-react";
import { Panel, PanelBody, PanelHeader } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CLASSIFICATION_STYLES, TRUST_STYLES } from "@/config/statusStyles";
import AnimatedContent from "@/components/ui/AnimatedContent";
import {
  ContextComposition,
  ContextFlow,
  RecentRunsTable,
  RecoveryTimeline,
  SourceTrustLegend,
  VerificationSummary,
} from "@/components/shared";
import { useRuntime } from "@/lib/state";
import { DEMO_RECENT_RUNS } from "@/lib/demo";
import { OverviewHeader } from "./OverviewHeader";
import { MetricsGrid } from "./MetricsGrid";

/**
 * Feature entry point. The page file renders this and nothing else.
 */
export function OverviewDashboard() {
  const { run } = useRuntime();

  return (
    <div className="flex flex-col gap-4">
      <OverviewHeader run={run} />

      <MetricsGrid run={run} />

      <AnimatedContent distance={24} duration={0.5} threshold={0.05}>
        <Panel>
          <PanelHeader
            title="Context transformation"
            subtitle="Both columns share one pixels-per-token scale"
            icon={<Layers size={13} />}
            actions={
              <Link
                href="/compiler"
                className="flex items-center gap-1 text-[10px] font-medium tracking-[0.08em] text-fg-dim uppercase transition-colors hover:text-fg"
              >
                Compile
                <ArrowRight size={11} />
              </Link>
            }
          />
          <PanelBody>
            <ContextFlow
              units={run.originalContext}
              sections={run.sections}
              originalTokens={run.metrics.originalTokens}
              compiledTokens={run.metrics.compiledTokens}
              height={296}
            />
          </PanelBody>
        </Panel>
      </AnimatedContent>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <AnimatedContent distance={24} duration={0.5} threshold={0.05} delay={0.05}>
          <Panel className="h-full">
            <PanelHeader
              title="Verification"
              subtitle={`Checked at compile time · ${run.verification.total} requirements`}
              icon={<ShieldCheck size={13} />}
              actions={
                <Link
                  href="/verification"
                  className="flex items-center gap-1 text-[10px] font-medium tracking-[0.08em] text-fg-dim uppercase transition-colors hover:text-fg"
                >
                  Detail
                  <ArrowRight size={11} />
                </Link>
              }
            />
            <PanelBody className="flex flex-col gap-4">
              <VerificationSummary verification={run.verification} />
              <div>
                <p className="label-xs mb-2">Recovery</p>
                <RecoveryTimeline attempts={run.recoveryAttempts} dense />
              </div>
            </PanelBody>
          </Panel>
        </AnimatedContent>

        <AnimatedContent distance={24} duration={0.5} threshold={0.05} delay={0.1}>
          <Panel className="h-full">
            <PanelHeader
              title="Context composition"
              subtitle="Canonical tokens by decision"
              icon={<ScanSearch size={13} />}
              actions={
                <Link
                  href="/inspector"
                  className="flex items-center gap-1 text-[10px] font-medium tracking-[0.08em] text-fg-dim uppercase transition-colors hover:text-fg"
                >
                  Inspect
                  <ArrowRight size={11} />
                </Link>
              }
            />
            <PanelBody className="flex flex-col gap-4">
              <ContextComposition units={run.originalContext} />
              <div className="border-t border-line pt-3.5">
                <p className="label-xs mb-2">Source trust</p>
                {/* The rule is easier to read as the one unit it caught than
                    as a sentence about it. Deep-links to the omitted tab. */}
                <Link
                  href="/inspector?classification=omitted"
                  className="group mb-2.5 flex items-center gap-2 rounded-sm border border-line bg-surface-inset px-2 py-1.5 transition-colors hover:border-line-strong"
                >
                  <span className="num min-w-0 flex-1 truncate text-[11px] text-fg-muted transition-colors group-hover:text-fg">
                    Document #6 · vendor_spec.pdf
                  </span>
                  <StatusBadge tone={TRUST_STYLES.untrusted} />
                  <StatusBadge tone={CLASSIFICATION_STYLES.omitted} />
                  <ArrowRight
                    size={11}
                    className="shrink-0 text-fg-dim transition-colors group-hover:text-fg"
                  />
                </Link>
                <SourceTrustLegend />
              </div>
            </PanelBody>
          </Panel>
        </AnimatedContent>
      </div>

      <AnimatedContent distance={24} duration={0.5} threshold={0.05}>
        <Panel>
          <PanelHeader
            title="Recent compilations"
            subtitle="Last 6 runs in this workspace"
          />
          <PanelBody>
            <RecentRunsTable runs={DEMO_RECENT_RUNS} activeRunId={run.runId} />
          </PanelBody>
        </Panel>
      </AnimatedContent>
    </div>
  );
}
