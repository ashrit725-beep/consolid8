"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ToneStyle } from "@/config/statusStyles";
import CountUp from "./CountUp";
import SpotlightCard from "./SpotlightCard";

export interface MetricCardProps {
  label: string;
  /** Numbers animate via <CountUp />. Strings render verbatim. */
  value: number | string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  /** Colours the value. Defaults to plain foreground. */
  tone?: ToneStyle;
  /** Small caption under the value. */
  hint?: ReactNode;
  badge?: ReactNode;
  icon?: ReactNode;
  /** Stagger the count animation across a grid. */
  delay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const VALUE_SIZES = {
  sm: "text-[18px]",
  md: "text-[24px]",
  lg: "text-[32px]",
} as const;

/**
 * Dense metric readout. Reused on Overview, Compiler, Verification,
 * Stress Test and Analytics — do not fork it per feature.
 */
export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals,
  tone,
  hint,
  badge,
  icon,
  delay = 0,
  size = "md",
  className,
}: MetricCardProps) {
  return (
    <SpotlightCard
      className={cn(
        "group flex min-w-0 flex-col rounded-md border border-line bg-surface transition-colors duration-200 hover:border-line-strong",
        className,
      )}
      contentClassName="flex min-w-0 flex-1 flex-col justify-between gap-2 px-3.5 py-3"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="label-xs truncate">{label}</span>
        {badge ?? (icon ? <span className="text-fg-faint">{icon}</span> : null)}
      </div>

      <div className="flex min-w-0 items-baseline gap-1">
        <span
          className={cn(
            "num truncate leading-none font-medium",
            VALUE_SIZES[size],
            tone?.text ?? "text-fg",
          )}
        >
          {typeof value === "number" ? (
            <CountUp
              to={value}
              separator=","
              duration={1.1}
              delay={delay}
              decimals={decimals}
              prefix={prefix}
              suffix={suffix}
            />
          ) : (
            `${prefix}${value}${suffix}`
          )}
        </span>
      </div>

      {hint ? (
        <p className="truncate text-2xs text-fg-dim">{hint}</p>
      ) : null}
    </SpotlightCard>
  );
}

export function MetricGrid({
  children,
  columns = 6,
  className,
}: {
  children: ReactNode;
  columns?: 3 | 4 | 5 | 6;
  className?: string;
}) {
  const cols = {
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
    5: "sm:grid-cols-3 lg:grid-cols-5",
    6: "sm:grid-cols-3 lg:grid-cols-6",
  }[columns];

  return (
    <div className={cn("grid grid-cols-2 gap-2", cols, className)}>
      {children}
    </div>
  );
}
