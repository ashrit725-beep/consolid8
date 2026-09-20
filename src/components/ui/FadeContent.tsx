"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface FadeContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onComplete"> {
  children: ReactNode;
  container?: string | HTMLElement | null;
  /** Adds a blur-in as the content fades. */
  blur?: boolean;
  /** Milliseconds (values > 10) or seconds. */
  duration?: number;
  ease?: string;
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
}

/**
 * Opacity-only entrance (ported from React Bits).
 *
 * Preferred over <AnimatedContent /> for dense regions — tables, stage lists,
 * requirement rows — where translation would look busy. Same reliability
 * safeguards: reduced motion resolves instantly, and a failsafe guarantees the
 * content becomes visible even if the scroll trigger never fires.
 */
export default function FadeContent({
  children,
  container,
  blur = false,
  duration = 1000,
  ease = "power2.out",
  delay = 0,
  threshold = 0.1,
  initialOpacity = 0,
  disappearAfter = 0,
  disappearDuration = 0.5,
  disappearEase = "power2.in",
  onComplete,
  onDisappearanceComplete,
  className = "",
  style,
  ...props
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el, { autoAlpha: 1, filter: "blur(0px)" });
      onComplete?.();
      return;
    }

    let scrollerTarget: string | HTMLElement | null =
      container ?? document.getElementById("snap-main-container");
    if (typeof scrollerTarget === "string") {
      scrollerTarget = document.querySelector<HTMLElement>(scrollerTarget);
    }

    const startPct = (1 - threshold) * 100;
    const getSeconds = (value: number) => (value > 10 ? value / 1000 : value);

    gsap.set(el, {
      autoAlpha: initialOpacity,
      filter: blur ? "blur(10px)" : "blur(0px)",
      willChange: "opacity, filter",
    });

    const tl = gsap.timeline({
      paused: true,
      delay: getSeconds(delay),
      onComplete: () => {
        onComplete?.();
        if (disappearAfter > 0) {
          gsap.to(el, {
            autoAlpha: initialOpacity,
            filter: blur ? "blur(10px)" : "blur(0px)",
            delay: getSeconds(disappearAfter),
            duration: getSeconds(disappearDuration),
            ease: disappearEase,
            onComplete: () => onDisappearanceComplete?.(),
          });
        }
      },
    });

    tl.to(el, {
      autoAlpha: 1,
      filter: "blur(0px)",
      duration: getSeconds(duration),
      ease,
    });

    const st = ScrollTrigger.create({
      trigger: el,
      scroller: scrollerTarget ?? undefined,
      start: `top ${startPct}%`,
      once: true,
      onEnter: () => tl.play(),
    });

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) tl.play();

    const failsafe = window.setTimeout(() => {
      if (!tl.isActive() && tl.progress() === 0) tl.play();
    }, 400);

    return () => {
      window.clearTimeout(failsafe);
      st.kill();
      tl.kill();
      gsap.killTweensOf(el);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={ref} className={className} style={style} {...props}>
      {children}
    </div>
  );
}
