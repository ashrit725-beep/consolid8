"use client";

import { FlaskConical } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import AnimatedContent from "@/components/ui/AnimatedContent";
import { DEMO_STRESS_TEST } from "@/lib/demo";
import { formatInt } from "@/lib/formatting";
import { ComparisonColumn } from "./ComparisonColumn";
import { StressTestSummary } from "./StressTestSummary";

/**
 * Feature entry point. Same model, same task, three context strategies.
 */
export function StressTestComparison() {
  const result = DEMO_STRESS_TEST;
  const baseline = result.baselineTokens;

  return (
    <div className="flex flex-col gap-4">
      <Panel>
        <PanelHeader
          title="Stress test"
          subtitle="One task, one model, three ways of building the context"
          icon={<FlaskConical size={13} />}
          actions={
            <span className="num text-[10px] text-fg-faint">
              baseline {formatInt(baseline)} tokens
            </span>
          }
        />
        <div className="px-4 py-3">
          <p className="label-xs">Task</p>
          <p className="mt-1 text-[13px] text-fg">{result.task}</p>
        </div>
      </Panel>

      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        {result.variants.map((variant, index) => (
          <AnimatedContent
            key={variant.id}
            distance={22}
            duration={0.5}
            delay={index * 0.08}
            threshold={0.04}
            className="h-full"
          >
            <ComparisonColumn
              variant={variant}
              baseline={baseline}
              delay={index * 0.12}
            />
          </AnimatedContent>
        ))}
      </div>

      <StressTestSummary result={result} />
    </div>
  );
}
