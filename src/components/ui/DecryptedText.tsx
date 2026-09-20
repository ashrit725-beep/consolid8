"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion, useReducedMotion } from "motion/react";

const styles: Record<string, CSSProperties> = {
  wrapper: { display: "inline-block", whiteSpace: "pre-wrap" },
  srOnly: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0,0,0,0)",
    border: 0,
  },
};

export interface DecryptedTextProps {
  text: string;
  /** Milliseconds between iterations. */
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  /** Class applied to revealed characters. */
  className?: string;
  parentClassName?: string;
  /** Class applied to still-scrambled characters. */
  encryptedClassName?: string;
  animateOn?: "view" | "hover" | "inViewHover" | "click";
  clickMode?: "once" | "toggle";
}

/**
 * Character-scramble reveal (ported from React Bits).
 *
 * Used for the compiler's live stage readout, where text is genuinely being
 * recomputed. One accessibility fix over the reference: the screen-reader copy
 * exposes the real string, not the scrambled frame.
 */
export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className = "",
  parentClassName = "",
  encryptedClassName = "",
  animateOn = "hover",
  clickMode = "once",
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(animateOn !== "click");
  const [direction, setDirection] = useState<"forward" | "reverse">("forward");

  const reduceMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLSpanElement>(null);
  const orderRef = useRef<number[]>([]);
  const pointerRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const availableChars = useMemo(() => {
    return useOriginalCharsOnly
      ? Array.from(new Set(text.split(""))).filter((char) => char !== " ")
      : characters.split("");
  }, [useOriginalCharsOnly, text, characters]);

  const shuffleText = useCallback(
    (originalText: string, currentRevealed: Set<number>) =>
      originalText
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (currentRevealed.has(i)) return originalText[i];
          return availableChars[
            Math.floor(Math.random() * availableChars.length)
          ];
        })
        .join(""),
    [availableChars],
  );

  const computeOrder = useCallback(
    (len: number) => {
      const order: number[] = [];
      if (len <= 0) return order;
      if (revealDirection === "start") {
        for (let i = 0; i < len; i++) order.push(i);
        return order;
      }
      if (revealDirection === "end") {
        for (let i = len - 1; i >= 0; i--) order.push(i);
        return order;
      }
      const middle = Math.floor(len / 2);
      let offset = 0;
      while (order.length < len) {
        if (offset % 2 === 0) {
          const idx = middle + offset / 2;
          if (idx >= 0 && idx < len) order.push(idx);
        } else {
          const idx = middle - Math.ceil(offset / 2);
          if (idx >= 0 && idx < len) order.push(idx);
        }
        offset++;
      }
      return order.slice(0, len);
    },
    [revealDirection],
  );

  const fillAllIndices = useCallback(() => {
    const set = new Set<number>();
    for (let i = 0; i < text.length; i++) set.add(i);
    return set;
  }, [text]);

  const removeRandomIndices = useCallback(
    (set: Set<number>, count: number) => {
      const arr = Array.from(set);
      for (let i = 0; i < count && arr.length > 0; i++) {
        arr.splice(Math.floor(Math.random() * arr.length), 1);
      }
      return new Set(arr);
    },
    [],
  );

  const encryptInstantly = useCallback(() => {
    const emptySet = new Set<number>();
    setRevealedIndices(emptySet);
    setDisplayText(shuffleText(text, emptySet));
    setIsDecrypted(false);
  }, [text, shuffleText]);

  const triggerDecrypt = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(text.length);
      pointerRef.current = 0;
    }
    setRevealedIndices(new Set());
    setDirection("forward");
    setIsAnimating(true);
  }, [sequential, computeOrder, text.length]);

  const triggerReverse = useCallback(() => {
    if (sequential) {
      orderRef.current = computeOrder(text.length).slice().reverse();
      pointerRef.current = 0;
    }
    setRevealedIndices(fillAllIndices());
    setDisplayText(shuffleText(text, fillAllIndices()));
    setDirection("reverse");
    setIsAnimating(true);
  }, [sequential, computeOrder, fillAllIndices, shuffleText, text]);

  useEffect(() => {
    if (!isAnimating || reduceMotion) return;

    let currentIteration = 0;

    const getNextIndex = (revealedSet: Set<number>) => {
      const textLength = text.length;
      switch (revealDirection) {
        case "end":
          return textLength - 1 - revealedSet.size;
        case "center": {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex =
            revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
          if (
            nextIndex >= 0 &&
            nextIndex < textLength &&
            !revealedSet.has(nextIndex)
          ) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    const stop = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setIsAnimating(false);
    };

    intervalRef.current = setInterval(() => {
      setRevealedIndices((prevRevealed) => {
        if (sequential) {
          if (direction === "forward") {
            if (prevRevealed.size < text.length) {
              const nextIndex = getNextIndex(prevRevealed);
              const newRevealed = new Set(prevRevealed);
              newRevealed.add(nextIndex);
              setDisplayText(shuffleText(text, newRevealed));
              return newRevealed;
            }
            stop();
            setIsDecrypted(true);
            return prevRevealed;
          }
          if (pointerRef.current < orderRef.current.length) {
            const idxToRemove = orderRef.current[pointerRef.current++]!;
            const newRevealed = new Set(prevRevealed);
            newRevealed.delete(idxToRemove);
            setDisplayText(shuffleText(text, newRevealed));
            if (newRevealed.size === 0) {
              stop();
              setIsDecrypted(false);
            }
            return newRevealed;
          }
          stop();
          setIsDecrypted(false);
          return prevRevealed;
        }

        if (direction === "forward") {
          setDisplayText(shuffleText(text, prevRevealed));
          currentIteration++;
          if (currentIteration >= maxIterations) {
            stop();
            setDisplayText(text);
            setIsDecrypted(true);
          }
          return prevRevealed;
        }

        let currentSet = prevRevealed;
        if (currentSet.size === 0) currentSet = fillAllIndices();
        const removeCount = Math.max(
          1,
          Math.ceil(text.length / Math.max(1, maxIterations)),
        );
        const nextSet = removeRandomIndices(currentSet, removeCount);
        setDisplayText(shuffleText(text, nextSet));
        currentIteration++;
        if (nextSet.size === 0 || currentIteration >= maxIterations) {
          stop();
          setIsDecrypted(false);
          setDisplayText(shuffleText(text, new Set()));
          return new Set();
        }
        return nextSet;
      });
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    isAnimating,
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    shuffleText,
    direction,
    fillAllIndices,
    removeRandomIndices,
    reduceMotion,
  ]);

  const handleClick = () => {
    if (animateOn !== "click") return;
    if (clickMode === "once") {
      if (isDecrypted) return;
      setDirection("forward");
      triggerDecrypt();
      return;
    }
    if (isDecrypted) triggerReverse();
    else {
      setDirection("forward");
      triggerDecrypt();
    }
  };

  const triggerHoverDecrypt = useCallback(() => {
    if (isAnimating) return;
    setRevealedIndices(new Set());
    setIsDecrypted(false);
    setDisplayText(text);
    setDirection("forward");
    setIsAnimating(true);
  }, [isAnimating, text]);

  const resetToPlainText = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsAnimating(false);
    setRevealedIndices(new Set());
    setDisplayText(text);
    setIsDecrypted(true);
    setDirection("forward");
  }, [text]);

  useEffect(() => {
    if (reduceMotion) return;
    if (animateOn !== "view" && animateOn !== "inViewHover") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            triggerDecrypt();
            setHasAnimated(true);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.1 },
    );

    const currentRef = containerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [animateOn, hasAnimated, triggerDecrypt, reduceMotion]);

  /* eslint-disable react-hooks/set-state-in-effect --
     Initialises the display buffer from props. The scrambled frame must be in
     place before paint, so this cannot be deferred to a callback. */
  useEffect(() => {
    if (animateOn === "click" && !reduceMotion) {
      encryptInstantly();
    } else {
      setDisplayText(text);
      setIsDecrypted(true);
    }
    setRevealedIndices(new Set());
    setDirection("forward");
  }, [animateOn, text, encryptInstantly, reduceMotion]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const animateProps = reduceMotion
    ? {}
    : animateOn === "hover" || animateOn === "inViewHover"
      ? { onMouseEnter: triggerHoverDecrypt, onMouseLeave: resetToPlainText }
      : animateOn === "click"
        ? { onClick: handleClick }
        : {};

  return (
    <motion.span
      className={parentClassName}
      ref={containerRef}
      style={styles.wrapper}
      {...animateProps}
      {...props}
    >
      {/* Screen readers get the real string, never a scrambled frame. */}
      <span style={styles.srOnly}>{text}</span>

      <span aria-hidden="true">
        {displayText.split("").map((char, index) => {
          const revealed =
            revealedIndices.has(index) || (!isAnimating && isDecrypted);
          return (
            <span
              key={index}
              className={revealed ? className : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
    </motion.span>
  );
}
