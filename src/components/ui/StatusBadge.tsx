import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ToneStyle } from "@/config/statusStyles";

export type BadgeSize = "xs" | "sm";

/**
 * The single badge used for every status in the product. Callers pass a
 * `ToneStyle` from config/statusStyles — never raw colours.
 *
 * Accessibility: state is carried by the label text, not only by colour. The
 * optional glyph adds a second non-colour channel for PASS / FAIL.
 */
export function StatusBadge({
  tone,
  label,
  glyph,
  size = "xs",
  variant = "soft",
  title,
  className,
}: {
  tone: ToneStyle;
  /** Overrides `tone.label`. */
  label?: ReactNode;
  glyph?: ReactNode;
  size?: BadgeSize;
  variant?: "soft" | "outline" | "bare";
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title ?? tone.hint}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-xs border font-medium tracking-[0.07em] uppercase",
        size === "xs" ? "px-1.5 py-px text-[10px]" : "px-2 py-0.5 text-2xs",
        tone.text,
        variant === "soft" && [tone.bg, tone.border],
        variant === "outline" && ["bg-transparent", tone.border],
        variant === "bare" && "border-transparent bg-transparent px-0",
        className,
      )}
    >
      {glyph ? <span aria-hidden className="shrink-0">{glyph}</span> : null}
      {label ?? tone.label}
    </span>
  );
}

/** Small colour dot for legends and list rows. */
export function ToneDot({
  hex,
  className,
  pulse = false,
}: {
  hex: string;
  className?: string;
  pulse?: boolean;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-1.5 shrink-0 rounded-full",
        pulse && "animate-pulse-soft",
        className,
      )}
      style={{ backgroundColor: hex }}
    />
  );
}
