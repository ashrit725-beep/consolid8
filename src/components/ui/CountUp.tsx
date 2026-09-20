"use client";

import { useMotionValue, useSpring } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

export interface CountUpProps {
  /** The target number to count up to. */
  to: number;
  /** The initial number from which the count starts. */
  from?: number;
  /** "up" or "down". When "down", `from` and `to` are reversed. */
  direction?: "up" | "down";
  /** Delay in seconds before counting starts. */
  delay?: number;
  /** Duration of the count animation, in seconds. */
  duration?: number;
  className?: string;
  /** Gate the animation — counting only begins once this is true. */
  startWhen?: boolean;
  /** Thousands separator, e.g. ",". */
  separator?: string;
  /** Rendered before the number, e.g. "$". */
  prefix?: string;
  /** Rendered after the number, e.g. "%". */
  suffix?: string;
  /** Force a fixed number of decimals. Inferred from `to` when omitted. */
  decimals?: number;
  onStart?: () => void;
  onEnd?: () => void;
}

/** Settle margin, in ms, added after delay + duration. */
const SETTLE_MS = 150;

/**
 * The start effect writes the animation's origin value, so it has to land
 * before the browser paints — otherwise the true server-rendered figure is
 * shown for a frame and then appears to drop to zero. On the server there is
 * no layout pass, so fall back to `useEffect` to keep React quiet.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Animated numeric readout (ported from React Bits, typed for this codebase).
 *
 * Used for every headline metric so figures resolve into place instead of
 * snapping.
 *
 * Correctness rule for this port: the DOM must never hold a number that is not
 * either (a) the true value or (b) a frame of an animation that is actively
 * running towards it. The upstream component gated everything on
 * `useInView`, which meant a tile whose observer never fired — inside a
 * transformed or still-revealing ancestor, in a background tab, behind a
 * scroll container the observer did not resolve against — sat at `from`, or at
 * empty string, indefinitely. On /analytics that left all eight KPI tiles
 * blank for ~3s; on the compiler's ResultBar it printed `0 · 0.0%` next to a
 * topbar reading 18,413 · 74.6%. For a product whose claim is verification,
 * two different numbers for one fact on one settled screen is disqualifying.
 *
 * So: the count starts at MOUNT, an unconditional timer settles the exact
 * value whether or not the animation ever ran, and the server render emits the
 * final value as text so the figure is already true before hydration.
 */
export default function CountUp({
  to,
  from = 0,
  direction = "up",
  delay = 0,
  duration = 2,
  className = "",
  startWhen = true,
  separator = "",
  prefix = "",
  suffix = "",
  decimals,
  onStart,
  onEnd,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? to : from);

  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);

  const springValue = useSpring(motionValue, { damping, stiffness });

  // Callers pass inline arrows for these. Holding them in refs keeps them out
  // of the effect's dependency list — otherwise every parent re-render tore
  // down and restarted the timers, which is the other way a count can be left
  // hanging short of its target.
  const onStartRef = useRef(onStart);
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onStartRef.current = onStart;
    onEndRef.current = onEnd;
  });

  const getDecimalPlaces = (num: number): number => {
    const str = num.toString();
    if (str.includes(".")) {
      const fraction = str.split(".")[1];
      if (fraction && parseInt(fraction, 10) !== 0) return fraction.length;
    }
    return 0;
  };

  const maxDecimals =
    decimals ?? Math.max(getDecimalPlaces(from), getDecimalPlaces(to));

  const formatValue = useCallback(
    (latest: number) => {
      const hasDecimals = maxDecimals > 0;
      const formatted = Intl.NumberFormat("en-US", {
        useGrouping: Boolean(separator),
        minimumFractionDigits: hasDecimals ? maxDecimals : 0,
        maximumFractionDigits: hasDecimals ? maxDecimals : 0,
      }).format(latest);
      const withSeparator = separator
        ? formatted.replace(/,/g, separator)
        : formatted;
      return `${prefix}${withSeparator}${suffix}`;
    },
    [maxDecimals, separator, prefix, suffix],
  );

  const target = direction === "down" ? from : to;
  const origin = direction === "down" ? to : from;
  const settled = formatValue(target);

  /** Snap both the source value and the spring, then write the exact text. */
  const settle = useCallback(() => {
    // Springs approach asymptotically, and jumping only the source lets the
    // spring keep writing intermediate frames afterwards — which is how a
    // metric ends up a few digits short of the truth. Both have to move.
    motionValue.jump(target);
    springValue.jump(target);
    if (ref.current) ref.current.textContent = settled;
  }, [motionValue, springValue, target, settled]);

  // Run the count. Starts from mount — there is no in-view gate. `startWhen`
  // is still honoured so a caller can stage the reveal explicitly.
  useIsomorphicLayoutEffect(() => {
    if (!startWhen) return;

    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    onStartRef.current?.();

    if (prefersReducedMotion) {
      settle();
      onEndRef.current?.();
      return;
    }

    motionValue.jump(origin);
    if (ref.current) ref.current.textContent = formatValue(origin);
    const startId = setTimeout(() => {
      motionValue.set(target);
    }, delay * 1000);

    return () => clearTimeout(startId);
  }, [startWhen, motionValue, origin, target, delay, settle, formatValue]);

  // The unconditional settle. Scheduled from mount, independent of whether the
  // animation above ever produced a frame — background tabs, for instance, do
  // not run the spring's rAF loop at all, but this timer still fires and
  // writes the true value. This is the guarantee the rest of the app relies on.
  useEffect(() => {
    if (!startWhen) return;
    const settleId = setTimeout(
      () => {
        settle();
        onEndRef.current?.();
      },
      delay * 1000 + duration * 1000 + SETTLE_MS,
    );
    return () => clearTimeout(settleId);
  }, [startWhen, delay, duration, settle]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest: number) => {
      if (ref.current) ref.current.textContent = formatValue(latest);
    });
    return () => unsubscribe();
  }, [springValue, formatValue]);

  // The final value is the server-rendered text, so the figure is correct on
  // first paint and correct before hydration. React only patches this text
  // node when `settled` itself changes, so it does not fight the animation.
  return (
    <span className={className} ref={ref} aria-label={settled}>
      {settled}
    </span>
  );
}
