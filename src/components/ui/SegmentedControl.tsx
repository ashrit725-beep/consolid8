"use client";

import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
  disabled?: boolean;
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  label,
  className,
}: {
  value: T;
  options: SegmentOption<T>[];
  onChange: (value: T) => void;
  /** Accessible group name, e.g. "Runtime mode". */
  label: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-sm border border-line bg-surface-inset p-0.5",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={option.disabled}
            title={option.hint}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xs px-2.5 py-1 text-[10px] font-medium tracking-[0.08em] uppercase transition-colors duration-150",
              "disabled:pointer-events-none disabled:opacity-35",
              active
                ? "bg-surface-overlay text-fg shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset]"
                : "text-fg-dim hover:text-fg-muted",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
