"use client";

import { useCallback, useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import "./BorderGlow.css";

function parseHSL(hslStr: string) {
  const match = hslStr.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  if (!match) return { h: 150, s: 67, l: 55 };
  return {
    h: parseFloat(match[1]!),
    s: parseFloat(match[2]!),
    l: parseFloat(match[3]!),
  };
}

function buildGlowVars(
  glowColor: string,
  intensity: number,
): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const opacities = [100, 60, 50, 40, 30, 20, 10];
  const keys = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  const vars: Record<string, string> = {};
  for (let i = 0; i < opacities.length; i++) {
    vars[`--glow-color${keys[i]}`] =
      `hsl(${base} / ${Math.min(opacities[i]! * intensity, 100)}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = [
  "80% 55%",
  "69% 34%",
  "8% 6%",
  "41% 38%",
  "86% 85%",
  "82% 18%",
  "51% 4%",
];
const GRADIENT_KEYS = [
  "--gradient-one",
  "--gradient-two",
  "--gradient-three",
  "--gradient-four",
  "--gradient-five",
  "--gradient-six",
  "--gradient-seven",
];
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1];

function buildGradientVars(colors: string[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < 7; i++) {
    const color = colors[Math.min(COLOR_MAP[i]!, colors.length - 1)]!;
    vars[GRADIENT_KEYS[i]!] =
      `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${color} 0px, transparent 50%)`;
  }
  vars["--gradient-base"] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function isLightColor(color: string): boolean {
  const value = color.trim().replace("#", "");
  if (!/^[\da-f]{3}([\da-f]{3})?$/i.test(value)) return false;
  const hex =
    value.length === 3
      ? value
          .split("")
          .map((char) => char + char)
          .join("")
      : value;
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  return red * 0.2126 + green * 0.7152 + blue * 0.0722 > 180;
}

const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);
const easeInCubic = (x: number) => x * x * x;

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (value: number) => void;
  onEnd?: () => void;
}) {
  const t0 = performance.now() + delay;
  let rafId = 0;
  let cancelled = false;

  function tick() {
    if (cancelled) return;
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) rafId = requestAnimationFrame(tick);
    else onEnd?.();
  }

  const timeoutId = setTimeout(() => {
    rafId = requestAnimationFrame(tick);
  }, delay);

  // Returned so the caller can tear the tween down; without this an intro
  // sweep keeps writing custom properties onto a node React already removed.
  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
    cancelAnimationFrame(rafId);
  };
}

export interface BorderGlowProps {
  children: ReactNode;
  className?: string;
  /** How close to the edge the pointer must be for the glow to appear (0-100). */
  edgeSensitivity?: number;
  /** Glow colour as HSL components, e.g. "150 67 55". */
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  /** Play an intro sweep on mount. */
  animated?: boolean;
  /** Three hex colours distributed across the mesh-gradient border. */
  colors?: string[];
  fillOpacity?: number;
}

/**
 * Edge-tracking border glow (ported from React Bits).
 *
 * Defaults are retuned to the Consolid8 palette — signal green / blue / cyan,
 * a 10px radius and a lower intensity — so it reads as a precision highlight
 * on a result surface rather than a neon card.
 */
export default function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 30,
  glowColor = "150 67 55",
  backgroundColor = "#0b0d11",
  borderRadius = 10,
  glowRadius = 28,
  glowIntensity = 0.7,
  coneSpread = 25,
  animated = false,
  colors = ["#3fd98b", "#5aa2ff", "#46c6d9"],
  fillOpacity = 0.4,
}: BorderGlowProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getCenterOfElement = useCallback((el: HTMLElement) => {
    const { width, height } = el.getBoundingClientRect();
    return [width / 2, height / 2] as const;
  }, []);

  const getEdgeProximity = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      let kx = Infinity;
      let ky = Infinity;
      if (dx !== 0) kx = cx / Math.abs(dx);
      if (dy !== 0) ky = cy / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    },
    [getCenterOfElement],
  );

  const getCursorAngle = useCallback(
    (el: HTMLElement, x: number, y: number) => {
      const [cx, cy] = getCenterOfElement(el);
      const dx = x - cx;
      const dy = y - cy;
      if (dx === 0 && dy === 0) return 0;
      let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (degrees < 0) degrees += 360;
      return degrees;
    },
    [getCenterOfElement],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      card.style.setProperty(
        "--edge-proximity",
        `${(getEdgeProximity(card, x, y) * 100).toFixed(3)}`,
      );
      card.style.setProperty(
        "--cursor-angle",
        `${getCursorAngle(card, x, y).toFixed(3)}deg`,
      );
    },
    [getEdgeProximity, getCursorAngle],
  );

  useEffect(() => {
    if (!animated || !cardRef.current) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;
    const angleStart = 110;
    const angleEnd = 465;
    card.classList.add("sweep-active");
    card.style.setProperty("--cursor-angle", `${angleStart}deg`);

    const setAngle = (v: number) =>
      card.style.setProperty(
        "--cursor-angle",
        `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`,
      );

    const cancels = [
      animateValue({
        duration: 500,
        onUpdate: (v) => card.style.setProperty("--edge-proximity", String(v)),
      }),
      animateValue({
        ease: easeInCubic,
        duration: 1500,
        end: 50,
        onUpdate: setAngle,
      }),
      animateValue({
        ease: easeOutCubic,
        delay: 1500,
        duration: 2250,
        start: 50,
        end: 100,
        onUpdate: setAngle,
      }),
      animateValue({
        ease: easeInCubic,
        delay: 2500,
        duration: 1500,
        start: 100,
        end: 0,
        onUpdate: (v) => card.style.setProperty("--edge-proximity", String(v)),
        onEnd: () => card.classList.remove("sweep-active"),
      }),
    ];

    return () => {
      for (const cancel of cancels) cancel();
      card.classList.remove("sweep-active");
    };
  }, [animated]);

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      className={`border-glow-card${isLightColor(backgroundColor) ? " border-glow-card--light" : ""} ${className}`}
      style={
        {
          "--card-bg": backgroundColor,
          "--edge-sensitivity": edgeSensitivity,
          "--border-radius": `${borderRadius}px`,
          "--glow-padding": `${glowRadius}px`,
          "--cone-spread": coneSpread,
          "--fill-opacity": fillOpacity,
          ...buildGlowVars(glowColor, glowIntensity),
          ...buildGradientVars(colors),
        } as CSSProperties
      }
    >
      <span className="edge-light" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
