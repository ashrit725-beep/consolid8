"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "motion/react";
import { useMemo, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Magnifying dock (ported from React Bits).
 *
 * Used as the jump bar to the evidence routes. Restyled to the Consolid8
 * surface tokens with smaller items and squared corners so it reads as a tool
 * strip rather than an OS dock.
 *
 * Two departures from the reference implementation, both because the
 * reference is a decoration and this is navigation:
 *
 * 1. Each item is a real `<button type="button">`. Upstream they are
 *    `motion.div`s carrying `role="button"` and a hand-rolled key handler,
 *    which keeps them out of `document.querySelectorAll('button')` and out of
 *    reach of anything that enumerates real controls. A button gets tab order,
 *    Enter/Space, the focus ring and form semantics for free.
 * 2. The label is always visible. Upstream it is a hover tooltip, which left
 *    four unlabelled 14px glyphs — unreadable for anyone not already holding
 *    the mental model, and invisible entirely on touch. The tooltip is gone:
 *    with the label permanently under the glyph it was duplicating itself.
 */

/** Line box of the persistent label, in px. */
const LABEL_HEIGHT = 11;
/** Gap between the glyph and its label, in px. */
const LABEL_GAP = 2;
/** Vertical padding of the panel, in px. */
const PANEL_PADDING_Y = 8;

export interface DockItemData {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  /** Renders the item in its active state. */
  active?: boolean;
}

function DockItem({
  icon,
  label,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  active,
  reduceMotion,
}: {
  icon: ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
  mouseX: MotionValue<number>;
  spring: SpringOptions;
  distance: number;
  magnification: number;
  baseItemSize: number;
  active?: boolean;
  reduceMotion: boolean;
}) {
  const glyphRef = useRef<HTMLSpanElement>(null);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = glyphRef.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize],
  );
  const size = useSpring(targetSize, spring);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex cursor-pointer flex-col items-center rounded-sm px-1 outline-none focus-visible:ring-1 focus-visible:ring-fg/40",
        className,
      )}
      style={{ gap: `${LABEL_GAP}px` }}
    >
      {/* The glyph box holds its base size in the layout while the magnified
          square grows out of it, so hovering one item never reflows the row
          or nudges the labels sideways. The square is pinned to the bottom of
          that box so it grows upward — growing from the centre would swell
          down over the item's own label and hide the thing the hover is
          meant to be identifying. */}
      <span
        ref={glyphRef}
        aria-hidden
        className="relative block shrink-0"
        style={{ width: baseItemSize, height: baseItemSize }}
      >
        <motion.span
          style={
            reduceMotion
              ? { width: baseItemSize, height: baseItemSize }
              : { width: size, height: size }
          }
          className={cn(
            "absolute bottom-0 left-1/2 flex -translate-x-1/2 items-center justify-center rounded-sm border transition-colors",
            active
              ? "border-signal/35 bg-signal/12 text-signal"
              : "border-line bg-surface-raised text-fg-muted group-hover:border-line-strong group-hover:text-fg group-focus-visible:border-line-strong group-focus-visible:text-fg",
          )}
        >
          {icon}
        </motion.span>
      </span>

      <span
        className={cn(
          "block text-[9px] leading-[11px] font-medium tracking-[0.02em] whitespace-nowrap transition-colors",
          active
            ? "text-signal"
            : "text-fg-muted group-hover:text-fg group-focus-visible:text-fg",
        )}
        style={{ height: LABEL_HEIGHT }}
      >
        {label}
      </span>
    </button>
  );
}

export interface DockProps {
  items: DockItemData[];
  className?: string;
  spring?: SpringOptions;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  dockHeight?: number;
  baseItemSize?: number;
}

export default function Dock({
  items,
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 48,
  distance = 160,
  panelHeight = 44,
  dockHeight = 80,
  baseItemSize = 34,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);
  const reduceMotion = useReducedMotion() ?? false;

  // The panel has to be tall enough for glyph + label whatever the caller
  // asked for, or the label is clipped. It is bottom-anchored, so the extra
  // height grows upward into the space the magnification already uses.
  const resolvedPanelHeight = Math.max(
    panelHeight,
    baseItemSize + LABEL_GAP + LABEL_HEIGHT + PANEL_PADDING_Y,
  );

  const maxHeight = useMemo(
    () => Math.max(dockHeight, magnification + magnification / 2 + 4),
    [magnification, dockHeight],
  );
  const heightRow = useTransform(
    isHovered,
    [0, 1],
    [resolvedPanelHeight, maxHeight],
  );
  const height = useSpring(heightRow, spring);

  return (
    <motion.div
      style={{
        height: reduceMotion ? resolvedPanelHeight : height,
        scrollbarWidth: "none",
      }}
      className="pointer-events-none relative mx-2 flex max-w-full items-end justify-center"
    >
      <div
        onMouseMove={({ pageX }) => {
          if (reduceMotion) return;
          isHovered.set(1);
          mouseX.set(pageX);
        }}
        onMouseLeave={() => {
          if (reduceMotion) return;
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={cn(
          "pointer-events-auto absolute bottom-0 left-1/2 flex w-fit -translate-x-1/2 items-end gap-1.5 rounded-lg border border-line-strong bg-surface/95 px-1.5 backdrop-blur-md",
          className,
        )}
        style={{
          height: resolvedPanelHeight,
          paddingTop: PANEL_PADDING_Y / 2,
          paddingBottom: PANEL_PADDING_Y / 2,
        }}
      >
        {items.map((item) => (
          <DockItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            className={item.className}
            mouseX={mouseX}
            spring={spring}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            active={item.active}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </motion.div>
  );
}
