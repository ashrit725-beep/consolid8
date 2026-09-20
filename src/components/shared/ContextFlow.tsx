"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import type {
  CompiledSection,
  ContextCategory,
  ContextClassification,
  ContextUnit,
} from "@/types/context";
import {
  CATEGORY_STYLES,
  CLASSIFICATION_ORDER,
  CLASSIFICATION_STYLES,
} from "@/config/statusStyles";
import { cn } from "@/lib/utils";
import { formatInt, formatPercent } from "@/lib/formatting";

/**
 * The before/after transformation, drawn to scale.
 *
 * Both stacks share one pixels-per-token scale, so the compiled column is
 * literally ~25% the height of the canonical column. That single fact is the
 * product pitch, and it is readable in about two seconds.
 *
 * Geometry rules that keep the claim true:
 *  - no flex gap between bands (a gap would add pixels the tokens did not pay
 *    for), separation is drawn with an inset hairline instead;
 *  - sub-pixel bands are floored to 1px for visibility, and those borrowed
 *    pixels are taken back proportionally from the bands above the floor, so
 *    each stack's total height stays exactly tokens x pixelsPerToken;
 *  - the funnel is positioned from a measured stack offset, never a guessed
 *    header height.
 */

const CATEGORY_ORDER: ContextCategory[] = [
  "security",
  "policy",
  "state",
  "retrieval",
  "tool_output",
  "document",
  "chat",
  "memory",
  "task",
];

/** Floor so a band that is a rounding error still leaves a hairline. */
const MIN_BAND_PX = 1;

interface FlowBlock {
  key: string;
  label: string;
  tokens: number;
  hex: string;
  detail: string;
  meta: string;
}

function buildBeforeBlocks(units: ContextUnit[]): FlowBlock[] {
  return CATEGORY_ORDER.map((category): FlowBlock | null => {
    const inCategory = units.filter((u) => u.category === category);
    if (inCategory.length === 0) return null;
    const tokens = inCategory.reduce((total, u) => total + u.tokens, 0);
    const kept = inCategory.filter((u) => u.included).length;
    const style = CATEGORY_STYLES[category];
    return {
      key: category,
      label: style.label,
      tokens,
      hex: style.hex,
      detail: style.hint,
      meta: `${inCategory.length} units · ${kept} kept · ${inCategory.length - kept} dropped`,
    };
  }).filter((block): block is FlowBlock => block !== null);
}

/**
 * A compiled section is coloured by what it actually contains: the
 * classification carrying the most compiled tokens inside it. Position in the
 * list decides nothing.
 */
function dominantClassification(
  section: CompiledSection,
  index: Map<string, ContextUnit>,
): ContextClassification | null {
  const byClassification = new Map<ContextClassification, number>();
  for (const id of section.unitIds) {
    const unit = index.get(id);
    if (!unit) continue;
    const weight = unit.compiledTokens > 0 ? unit.compiledTokens : unit.tokens;
    byClassification.set(
      unit.classification,
      (byClassification.get(unit.classification) ?? 0) + weight,
    );
  }
  let winner: ContextClassification | null = null;
  let best = -1;
  // CLASSIFICATION_ORDER breaks ties deterministically.
  for (const classification of CLASSIFICATION_ORDER) {
    const tokens = byClassification.get(classification);
    if (tokens !== undefined && tokens > best) {
      winner = classification;
      best = tokens;
    }
  }
  return winner;
}

function buildAfterBlocks(
  sections: CompiledSection[],
  units: ContextUnit[],
): FlowBlock[] {
  const index = new Map(units.map((unit) => [unit.id, unit]));
  return sections
    .filter((section) => section.tokens > 0)
    .map((section) => {
      const classification = dominantClassification(section, index);
      const style = classification
        ? CLASSIFICATION_STYLES[classification]
        : CLASSIFICATION_STYLES.omitted;
      return {
        key: section.id,
        label: section.title.toUpperCase(),
        tokens: section.tokens,
        hex: style.hex,
        detail: section.description,
        meta: `${section.provenance} · mostly ${style.label}`,
      };
    });
}

/**
 * Band heights for one stack. The returned heights always sum to
 * `sum(tokens) * pixelsPerToken`, floor included.
 */
function bandHeights(blocks: FlowBlock[], pixelsPerToken: number): number[] {
  const raw = blocks.map((block) => block.tokens * pixelsPerToken);
  const deficit = raw.reduce(
    (total, h) => total + Math.max(0, MIN_BAND_PX - h),
    0,
  );
  const surplus = raw.reduce((total, h) => (h > MIN_BAND_PX ? total + h : total), 0);
  if (deficit === 0 || surplus <= deficit) return raw;
  const scale = (surplus - deficit) / surplus;
  return raw.map((h) => (h > MIN_BAND_PX ? h * scale : MIN_BAND_PX));
}

function Stack({
  blocks,
  total,
  pixelsPerToken,
  align,
  hovered,
  onHover,
}: {
  blocks: FlowBlock[];
  total: number;
  pixelsPerToken: number;
  align: "left" | "right";
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  const heights = bandHeights(blocks, pixelsPerToken);
  return (
    <div className="flex flex-col overflow-hidden rounded-xs">
      {blocks.map((block, index) => {
        const height = heights[index] ?? 0;
        const share = block.tokens / total;
        const active = hovered === block.key;
        return (
          <button
            key={block.key}
            type="button"
            onMouseEnter={() => onHover(block.key)}
            onMouseLeave={() => onHover(null)}
            onFocus={() => onHover(block.key)}
            onBlur={() => onHover(null)}
            aria-label={`${block.label}: ${formatInt(block.tokens)} tokens, ${formatPercent(share)} of this column`}
            className={cn(
              "group relative flex w-full items-center overflow-hidden px-2 text-left transition-[background-color,filter] duration-200",
              active && "brightness-125",
            )}
            style={{
              height,
              backgroundColor: `color-mix(in oklab, ${block.hex} ${active ? 26 : 16}%, transparent)`,
              // Separator and hover outline are drawn *inside* the band: a
              // flex gap or a real border would add pixels the tokens did not
              // pay for and break the shared scale.
              boxShadow: active
                ? "inset 0 0 0 1px rgb(255 255 255 / 0.18), inset 0 -1px 0 0 var(--color-canvas)"
                : "inset 0 -1px 0 0 var(--color-canvas)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[2px]"
              style={{ backgroundColor: block.hex }}
            />
            {height >= 18 ? (
              <span
                className={cn(
                  "flex w-full min-w-0 items-baseline justify-between gap-2",
                  align === "right" && "flex-row",
                )}
              >
                <span
                  className="truncate text-[10px] font-medium tracking-[0.08em]"
                  style={{ color: block.hex }}
                >
                  {block.label}
                </span>
                <span className="num shrink-0 text-[10px] text-fg-dim">
                  {formatInt(block.tokens)}
                </span>
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function ContextFlow({
  units,
  sections,
  originalTokens,
  compiledTokens,
  height = 300,
  className,
}: {
  units: ContextUnit[];
  sections: CompiledSection[];
  originalTokens: number;
  compiledTokens: number;
  height?: number;
  className?: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const beforeBlocks = useMemo(() => buildBeforeBlocks(units), [units]);
  const afterBlocks = useMemo(
    () => buildAfterBlocks(sections, units),
    [sections, units],
  );

  // One scale for both columns, and nothing between the bands to inflate a
  // stack, so rendered height is exactly proportional to tokens.
  const beforeTokens = beforeBlocks.reduce((t, b) => t + b.tokens, 0) || originalTokens;
  const afterTokens = afterBlocks.reduce((t, b) => t + b.tokens, 0);
  const pixelsPerToken = height / beforeTokens;
  const afterHeight = afterTokens * pixelsPerToken;
  const ghostHeight = Math.max(0, height - afterHeight);
  const removedTokens = Math.max(0, beforeTokens - afterTokens);
  const reduction = (originalTokens - compiledTokens) / originalTokens;

  const active =
    beforeBlocks.find((b) => b.key === hovered) ??
    afterBlocks.find((b) => b.key === hovered) ??
    null;

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/*
        Headers, stacks and legends each live in their own grid row, so the
        funnel cell is exactly the stack band: alignment is structural, not a
        guessed header height.
      */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_132px_1fr] lg:grid-rows-[auto_auto_auto] lg:gap-y-0">
        {/* ---------------------------------------------------------- before */}
        <div className="lg:col-start-1 lg:row-start-1">
          <ColumnHeader
            eyebrow="Before"
            title="Canonical context"
            value={originalTokens}
            note={`${units.length} units`}
          />
        </div>
        <div className="lg:col-start-1 lg:row-start-2">
          <Stack
            blocks={beforeBlocks}
            total={beforeTokens}
            pixelsPerToken={pixelsPerToken}
            align="left"
            hovered={hovered}
            onHover={setHovered}
          />
        </div>
        <div className="lg:col-start-1 lg:row-start-3">
          <Legend
            blocks={beforeBlocks}
            total={beforeTokens}
            hovered={hovered}
            onHover={setHovered}
          />
        </div>

        {/* ---------------------------------------------------------- funnel */}
        <div
          className="relative hidden lg:col-start-2 lg:row-start-2 lg:block lg:self-stretch"
          aria-hidden
        >
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox={`0 0 132 ${height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="c8-funnel" x1="0" x2="1">
                <stop offset="0%" stopColor="#3fd98b" stopOpacity="0.14" />
                <stop offset="100%" stopColor="#3fd98b" stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <polygon
              points={`0,0 132,0 132,${afterHeight} 0,${height}`}
              fill="url(#c8-funnel)"
            />
            <line
              x1="0"
              y1={height}
              x2="132"
              y2={afterHeight}
              stroke="#3fd98b"
              strokeOpacity="0.28"
              strokeWidth="0.4"
              vectorEffect="non-scaling-stroke"
              strokeDasharray="3 3"
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-sm border border-signal/30 bg-signal/10 px-2.5 py-1">
              <span className="size-1.5 animate-pulse-soft rounded-full bg-signal" />
              <span className="text-[10px] font-semibold tracking-[0.14em] text-signal">
                CONSOLID8
              </span>
            </div>
            <ArrowRight size={13} className="text-fg-faint" />
            <span className="num text-[11px] font-medium text-signal">
              &minus;{formatPercent(reduction)}
            </span>
          </div>
        </div>

        {/* ----------------------------------------------------------- after */}
        <div className="lg:col-start-3 lg:row-start-1">
          <ColumnHeader
            eyebrow="After"
            title="Compiled context"
            value={compiledTokens}
            note={`${sections.length} sections`}
            tone="signal"
          />
        </div>
        <div className="lg:col-start-3 lg:row-start-2">
          <Stack
            blocks={afterBlocks}
            total={afterTokens}
            pixelsPerToken={pixelsPerToken}
            align="right"
            hovered={hovered}
            onHover={setHovered}
          />
          {/* The removed tokens, drawn at the same scale: the emptiness is the
              point, so it is labelled instead of left black. */}
          {ghostHeight > 4 ? (
            <div
              className="flex items-start justify-center rounded-b-xs border border-dashed border-line-strong px-2 pt-2"
              style={{
                height: ghostHeight,
                backgroundImage:
                  "repeating-linear-gradient(135deg, rgb(231 234 240 / 0.05) 0 1px, transparent 1px 7px)",
              }}
            >
              <p className="text-center">
                <span className="num block text-[11px] text-fg-dim">
                  &minus;{formatInt(removedTokens)} tokens
                </span>
                <span className="label-xs">removed by compilation</span>
              </p>
            </div>
          ) : null}
        </div>
        <div className="lg:col-start-3 lg:row-start-3">
          <Legend
            blocks={afterBlocks}
            total={afterTokens}
            hovered={hovered}
            onHover={setHovered}
          />
        </div>
      </div>

      {/* ------------------------------------------------- hover detail rail */}
      <div className="flex min-h-[42px] items-center rounded-md border border-line bg-surface-inset px-3 py-2">
        {active ? (
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className="text-[11px] font-semibold tracking-[0.08em]"
              style={{ color: active.hex }}
            >
              {active.label}
            </span>
            <span className="num text-[11px] text-fg">
              {formatInt(active.tokens)} tokens
            </span>
            <span className="text-[11px] text-fg-muted">{active.detail}</span>
            <span className="num text-[10px] text-fg-faint">{active.meta}</span>
          </div>
        ) : (
          <p className="text-[11px] text-fg-dim">
            Hover any band to see what it contains, how many tokens it cost and
            what Consolid8 did with it.
          </p>
        )}
      </div>
    </div>
  );
}

function Legend({
  blocks,
  total,
  hovered,
  onHover,
}: {
  blocks: FlowBlock[];
  total: number;
  hovered: string | null;
  onHover: (key: string | null) => void;
}) {
  return (
    <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-px border-t border-line pt-2">
      {blocks.map((block) => {
        const active = hovered === block.key;
        return (
          <li key={block.key}>
            <button
              type="button"
              onMouseEnter={() => onHover(block.key)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(block.key)}
              onBlur={() => onHover(null)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-xs px-1 py-[3px] text-left transition-colors",
                active ? "bg-white/[0.05]" : "hover:bg-white/[0.025]",
              )}
            >
              <span className="flex min-w-0 items-center gap-1.5">
                <span
                  aria-hidden
                  className="size-1.5 shrink-0 rounded-[1px]"
                  style={{ backgroundColor: block.hex }}
                />
                <span className="truncate text-[10px] tracking-[0.05em] text-fg-dim">
                  {block.label}
                </span>
              </span>
              <span className="num shrink-0 text-[10px] text-fg-faint">
                {formatPercent(block.tokens / total, 1)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ColumnHeader({
  eyebrow,
  title,
  value,
  note,
  tone,
}: {
  eyebrow: string;
  title: string;
  value: number;
  note: string;
  tone?: "signal";
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-2">
      <div>
        <span className="label-xs">{eyebrow}</span>
        <p className="text-[12px] text-fg-muted">{title}</p>
      </div>
      <div className="text-right">
        <p
          className={cn(
            "num text-[19px] leading-none font-medium",
            tone === "signal" ? "text-signal" : "text-fg",
          )}
        >
          {formatInt(value)}
        </p>
        <p className="num text-[10px] text-fg-faint">{note}</p>
      </div>
    </div>
  );
}
