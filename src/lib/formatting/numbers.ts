const INT = new Intl.NumberFormat("en-US");

export function formatInt(value: number): string {
  return INT.format(Math.round(value));
}

/** 72418 → "72.4K", 1240000 → "1.24M". */
export function formatCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${(value / 1_000).toFixed(1)}K`;
  if (abs >= 1_000) return `${(value / 1_000).toFixed(2)}K`;
  return INT.format(Math.round(value));
}

/** 0.74574 → "74.6%". */
export function formatPercent(ratio: number, digits = 1): string {
  return `${(ratio * 100).toFixed(digits)}%`;
}

/** Costs are always presented as estimates — never as guaranteed savings. */
export function formatUsd(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${INT.format(Math.round(value))}`;
  }
  return `$${value.toFixed(2)}`;
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatRatio(part: number, total: number): string {
  return `${INT.format(part)} / ${INT.format(total)}`;
}

/** Stable, locale-free timestamp so server and client renders always match. */
export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
    d.getUTCDate(),
  )} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
