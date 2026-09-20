"use client";

import type { CSSProperties, ReactNode } from "react";
import "./GlareHover.css";

export interface GlareHoverProps {
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  children?: ReactNode;
  /** Hex colour of the sweep. */
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  /** Size of the sweep as a percentage, e.g. 250 = 250%. */
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * Sweeping light pass on hover (ported from React Bits).
 *
 * Defaults are changed to fill their parent with a transparent background and
 * border, so it can wrap an existing surface (a result column, a CTA) rather
 * than being a box of its own. Opacity is kept low — it should read as a
 * material highlight, not a shine effect.
 */
export default function GlareHover({
  width = "100%",
  height = "100%",
  background = "transparent",
  borderRadius = "10px",
  borderColor = "transparent",
  children,
  glareColor = "#ffffff",
  glareOpacity = 0.12,
  glareAngle = -38,
  glareSize = 260,
  transitionDuration = 750,
  playOnce = false,
  className = "",
  style = {},
}: GlareHoverProps) {
  const hex = glareColor.replace("#", "");
  let rgba = glareColor;
  if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  } else if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
    const r = parseInt(hex[0]! + hex[0]!, 16);
    const g = parseInt(hex[1]! + hex[1]!, 16);
    const b = parseInt(hex[2]! + hex[2]!, 16);
    rgba = `rgba(${r}, ${g}, ${b}, ${glareOpacity})`;
  }

  const vars = {
    "--gh-width": width,
    "--gh-height": height,
    "--gh-bg": background,
    "--gh-br": borderRadius,
    "--gh-angle": `${glareAngle}deg`,
    "--gh-duration": `${transitionDuration}ms`,
    "--gh-size": `${glareSize}%`,
    "--gh-rgba": rgba,
    "--gh-border": borderColor,
  } as CSSProperties;

  return (
    <div
      className={`glare-hover ${playOnce ? "glare-hover--play-once" : ""} ${className}`}
      style={{ ...vars, ...style }}
    >
      {children}
    </div>
  );
}
