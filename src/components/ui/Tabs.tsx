"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Width of the edge fade, in px. */
const FADE = 24;

export interface TabItem<T extends string> {
  value: T;
  label: string;
  count?: number;
  /** Optional dot colour, e.g. a classification hue. */
  hex?: string;
}

/**
 * Horizontal tab strip with an underline indicator.
 * Controlled — the owning feature keeps the state (often in the URL).
 */
export function Tabs<T extends string>({
  value,
  items,
  onChange,
  label,
  right,
  className,
}: {
  value: T;
  items: TabItem<T>[];
  onChange: (value: T) => void;
  label: string;
  right?: ReactNode;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // The strip hides its scrollbar, so an overflowing tab is invisible AND
  // gives no hint that it exists — at 1280px the Inspector's STALE and
  // CONFLICTS tabs simply vanished past the panel edge. A fade on whichever
  // edge has content behind it puts the affordance back. Measured rather than
  // applied unconditionally: the tablist shrink-wraps its content, so a static
  // mask would dim the last tab on every panel that does not overflow.
  const [overflow, setOverflow] = useState({ left: false, right: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => {
      const max = el.scrollWidth - el.clientWidth;
      setOverflow({ left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 });
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [items.length]);

  // Selection can come from the URL, so the active tab may start out scrolled
  // off. Nudge the strip itself rather than calling scrollIntoView, which
  // would also scroll every ancestor and shift the panel under the cursor.
  useEffect(() => {
    const el = scrollRef.current;
    const active = el?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!el || !active) return;
    const start = active.offsetLeft;
    const end = start + active.offsetWidth;
    if (start < el.scrollLeft) el.scrollLeft = Math.max(0, start - 8);
    else if (end > el.scrollLeft + el.clientWidth)
      el.scrollLeft = end - el.clientWidth + 8;
  }, [value]);

  const maskImage =
    overflow.left && overflow.right
      ? `linear-gradient(to right, transparent, black ${FADE}px, black calc(100% - ${FADE}px), transparent)`
      : overflow.right
        ? `linear-gradient(to right, black calc(100% - ${FADE}px), transparent)`
        : overflow.left
          ? `linear-gradient(to right, transparent, black ${FADE}px)`
          : undefined;

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 border-b border-line",
        className,
      )}
    >
      <div
        ref={scrollRef}
        role="tablist"
        aria-label={label}
        style={
          maskImage ? { maskImage, WebkitMaskImage: maskImage } : undefined
        }
        className="hide-scrollbar -mb-px flex items-center gap-0.5 overflow-x-auto"
      >
        {items.map((item) => {
          const active = item.value === value;
          return (
            <button
              key={item.value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange(item.value)}
              className={cn(
                "relative flex shrink-0 items-center gap-1.5 border-b px-2.5 py-2 text-[11px] font-medium tracking-[0.06em] uppercase transition-colors duration-150",
                active
                  ? "border-fg text-fg"
                  : "border-transparent text-fg-dim hover:text-fg-muted",
              )}
            >
              {item.hex ? (
                <span
                  aria-hidden
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: item.hex }}
                />
              ) : null}
              {item.label}
              {typeof item.count === "number" ? (
                <span
                  className={cn(
                    "num rounded-xs px-1 py-px text-[10px]",
                    active
                      ? "bg-white/8 text-fg-muted"
                      : "bg-white/4 text-fg-faint",
                  )}
                >
                  {item.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      {right ? <div className="shrink-0 pb-1.5">{right}</div> : null}
    </div>
  );
}
