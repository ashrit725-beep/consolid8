"use client";

import { type CSSProperties, useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import type { ImpactInputs, ImpactResult } from "@/types/analytics";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { DEMO_IMPACT_DEFAULTS } from "@/lib/demo";
import { formatCompact, formatPercent, formatUsd } from "@/lib/formatting";
import { cn } from "@/lib/utils";

function calculate(inputs: ImpactInputs): ImpactResult {
  const originalMonthlyTokens =
    inputs.requestsPerMonth * inputs.averageContextTokens;
  const compiledMonthlyTokens =
    originalMonthlyTokens * (1 - inputs.averageReduction);
  const estimatedCostBefore =
    (originalMonthlyTokens / 1_000_000) * inputs.inputCostPerMillion;
  const estimatedCostAfter =
    (compiledMonthlyTokens / 1_000_000) * inputs.inputCostPerMillion;

  return {
    originalMonthlyTokens,
    compiledMonthlyTokens,
    tokensAvoided: originalMonthlyTokens - compiledMonthlyTokens,
    estimatedCostBefore,
    estimatedCostAfter,
    estimatedDifference: estimatedCostBefore - estimatedCostAfter,
  };
}

/**
 * Input-token arithmetic, labelled as an estimate throughout. It reports
 * tokens avoided and an estimated input cost difference — not "savings",
 * which would imply a guarantee this UI cannot make.
 */
export function BusinessImpactCalculator() {
  const [inputs, setInputs] = useState<ImpactInputs>(DEMO_IMPACT_DEFAULTS);
  const result = useMemo(() => calculate(inputs), [inputs]);

  const set = <K extends keyof ImpactInputs>(key: K, value: number) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <Panel>
      <PanelHeader
        title="Business impact"
        subtitle="Input-token arithmetic · estimates only"
        icon={<Gauge size={13} />}
      />

      <div className="grid gap-4 p-4 lg:grid-cols-2">
        <div className="space-y-3.5">
          <Field
            label="Requests per month"
            value={inputs.requestsPerMonth}
            min={1000}
            max={5_000_000}
            step={1000}
            format={formatCompact}
            onChange={(value) => set("requestsPerMonth", value)}
          />
          <Field
            label="Average context tokens"
            value={inputs.averageContextTokens}
            min={2000}
            max={200_000}
            step={1000}
            format={formatCompact}
            onChange={(value) => set("averageContextTokens", value)}
          />
          <Field
            label="Average token reduction"
            value={inputs.averageReduction * 100}
            min={10}
            max={95}
            step={0.5}
            format={(value) => `${value.toFixed(1)}%`}
            onChange={(value) => set("averageReduction", value / 100)}
          />
          <Field
            label="Model input cost per 1M tokens"
            value={inputs.inputCostPerMillion}
            min={0.1}
            max={30}
            step={0.1}
            format={(value) => `$${value.toFixed(2)}`}
            onChange={(value) => set("inputCostPerMillion", value)}
          />
        </div>

        <div className="rounded-md border border-line bg-surface-inset p-3.5">
          <dl className="space-y-2.5">
            <Output
              label="Original monthly tokens"
              value={formatCompact(result.originalMonthlyTokens)}
            />
            <Output
              label="Compiled monthly tokens"
              value={formatCompact(result.compiledMonthlyTokens)}
            />
            <Output
              label="Tokens avoided"
              value={formatCompact(result.tokensAvoided)}
              tone="text-signal"
            />
            <div className="border-t border-line pt-2.5">
              <Output
                label="Estimated input cost before"
                value={formatUsd(result.estimatedCostBefore)}
              />
              <Output
                label="Estimated input cost after"
                value={formatUsd(result.estimatedCostAfter)}
              />
            </div>
            <div className="border-t border-line pt-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="label-xs">Estimated difference</dt>
                <dd className="num text-[19px] leading-none text-signal">
                  {formatUsd(result.estimatedDifference)}
                  <span className="text-[10px] text-fg-faint"> / mo</span>
                </dd>
              </div>
            </div>
          </dl>

          <p className="mt-3 border-t border-line pt-2.5 text-[10.5px] leading-snug text-fg-faint">
            Estimated from input tokens only, at the rate entered above. Output
            tokens, cache hits and provider discounts are not modelled. Actual
            reduction varies by task — this workspace averages{" "}
            {formatPercent(DEMO_IMPACT_DEFAULTS.averageReduction)}.
          </p>
        </div>
      </div>
    </Panel>
  );
}

function Field({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  const id = label.replace(/\s+/g, "-").toLowerCase();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label-xs">
          {label}
        </label>
        <span className="num text-[12px] text-fg">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ "--pct": `${pct}%` } as CSSProperties}
        className={cn(
          "mt-2 h-4 w-full cursor-pointer appearance-none bg-transparent",
          "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-info",
          // The filled portion states the value without decoding thumb position.
          "[&::-webkit-slider-runnable-track]:h-[3px] [&::-webkit-slider-runnable-track]:rounded-full",
          "[&::-webkit-slider-runnable-track]:bg-[linear-gradient(90deg,var(--color-fg)_0_var(--pct),var(--color-line-strong)_var(--pct)_100%)]",
          "[&::-webkit-slider-thumb]:mt-[-4px] [&::-webkit-slider-thumb]:size-[11px] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-[2px] [&::-webkit-slider-thumb]:bg-fg",
          "[&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110",
          // Firefox.
          "[&::-moz-range-track]:h-[3px] [&::-moz-range-track]:rounded-full",
          "[&::-moz-range-track]:bg-[linear-gradient(90deg,var(--color-fg)_0_var(--pct),var(--color-line-strong)_var(--pct)_100%)]",
          "[&::-moz-range-thumb]:size-[11px] [&::-moz-range-thumb]:rounded-[2px] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-fg",
        )}
      />
    </div>
  );
}

function Output({
  label,
  value,
  tone = "text-fg",
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <dt className="label-xs">{label}</dt>
      <dd className={cn("num text-[12.5px]", tone)}>{value}</dd>
    </div>
  );
}
