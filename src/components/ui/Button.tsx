"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-fg text-canvas border-fg hover:bg-white active:bg-[#cfd4dd] font-semibold",
  secondary:
    "bg-surface-raised text-fg border-line-strong hover:border-fg-faint hover:bg-surface-overlay",
  ghost:
    "bg-transparent text-fg-muted border-transparent hover:text-fg hover:bg-white/[0.04]",
  danger:
    "bg-danger/10 text-danger border-danger/30 hover:bg-danger/16 hover:border-danger/50",
};

const SIZES: Record<Size, string> = {
  sm: "h-7 px-2.5 text-[11px] gap-1.5",
  md: "h-8 px-3 text-[11px] gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  /** Right-aligned keyboard hint, e.g. "⌘↵". */
  hint?: string;
}

export function Button({
  variant = "secondary",
  size = "md",
  icon,
  hint,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border font-medium tracking-[0.06em] uppercase transition-colors duration-150",
        "disabled:pointer-events-none disabled:opacity-40",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
      {hint ? (
        <kbd
          aria-hidden
          className="num ml-0.5 rounded-xs border border-current/25 px-1 text-[9px] opacity-60"
        >
          {hint}
        </kbd>
      ) : null}
    </button>
  );
}
