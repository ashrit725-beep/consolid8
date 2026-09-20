"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  /** Class applied to the content wrapper that sits above the highlight. */
  contentClassName?: string;
  /** Colour of the radial highlight that follows the cursor. */
  spotlightColor?: string;
}

/**
 * Cursor-tracking highlight surface (ported from React Bits).
 *
 * Reimplemented with an overlay element and CSS variables instead of a global
 * `::before` rule, so the effect ships entirely inside this file and never
 * touches globals.css. Alpha is kept low on purpose — this is a surface hint,
 * not a glow. Under `prefers-reduced-motion` the overlay is not rendered at
 * all and the surface is completely static.
 */
export default function SpotlightCard({
  children,
  className = "",
  contentClassName,
  spotlightColor = "rgba(63, 217, 139, 0.06)",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion() ?? false;

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={reduceMotion ? undefined : handleMouseMove}
      style={
        {
          "--mouse-x": "50%",
          "--mouse-y": "50%",
          "--spotlight-color": spotlightColor,
        } as CSSProperties
      }
      className={cn("group/spotlight relative overflow-hidden", className)}
    >
      {reduceMotion ? null : (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spotlight:opacity-100 group-focus-within/spotlight:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mouse-x) var(--mouse-y), var(--spotlight-color), transparent 72%)",
          }}
        />
      )}
      <div className={cn("relative", contentClassName)}>{children}</div>
    </div>
  );
}
