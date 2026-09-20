/**
 * Approximate token accounting used when the UI is fed raw text instead of a
 * prepared fixture. Deliberately simple: ~4 characters per token, which is
 * close enough for the canonical-context panel and clearly labelled as an
 * estimate wherever it is surfaced.
 */
export function estimateTokens(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return Math.max(1, Math.round(trimmed.length / 4));
}

export function sumTokens<T extends { tokens: number }>(units: T[]): number {
  return units.reduce((total, unit) => total + unit.tokens, 0);
}

export function sumCompiledTokens<T extends { compiledTokens: number }>(
  units: T[],
): number {
  return units.reduce((total, unit) => total + unit.compiledTokens, 0);
}

/** 0..1 share of `total` removed. Returns 0 when total is 0. */
export function reductionRatio(original: number, compiled: number): number {
  if (original <= 0) return 0;
  return (original - compiled) / original;
}
