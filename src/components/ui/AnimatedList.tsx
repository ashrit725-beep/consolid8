"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

function AnimatedItem({
  children,
  delay = 0,
  index,
  onMouseEnter,
  onClick,
}: {
  children: ReactNode;
  delay?: number;
  index: number;
  onMouseEnter?: () => void;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // `once` is load-bearing: without it a row fades back out the moment it
  // scrolls past the 40% threshold, so the list flickers while the user
  // scrolls and rows that were already read disappear again.
  const inView = useInView(ref, { amount: 0.4, once: true });
  const reduceMotion = useReducedMotion() ?? false;
  const settled = reduceMotion || inView;

  return (
    <motion.div
      ref={ref}
      data-index={index}
      role="presentation"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      initial={reduceMotion ? false : { scale: 0.985, opacity: 0 }}
      animate={settled ? { scale: 1, opacity: 1 } : { scale: 0.985, opacity: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.18, delay, ease: [0.22, 1, 0.36, 1] }
      }
      className="cursor-pointer"
    >
      {children}
    </motion.div>
  );
}

export interface AnimatedListProps<T> {
  items: T[];
  onItemSelect?: (item: T, index: number) => void;
  /** Fade masks at the top and bottom of the scroll area. */
  showGradients?: boolean;
  /** Arrow-key navigation, scoped to this list (never hijacks Tab). */
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  /** Custom row renderer. Falls back to `String(item)`. */
  renderItem?: (item: T, index: number, selected: boolean) => ReactNode;
  getKey?: (item: T, index: number) => string;
  emptyState?: ReactNode;
}

/**
 * Scrollable list with staggered row entrance (ported from React Bits).
 *
 * Two deliberate changes from the reference implementation:
 *  - it is generic and takes a `renderItem`, so it can host real context units
 *    instead of plain strings;
 *  - arrow navigation is bound to the list element rather than `window`, and
 *    Tab is left alone, so it cannot steal focus from the rest of the app.
 */
export default function AnimatedList<T>({
  items,
  onItemSelect,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
  renderItem,
  getKey,
  emptyState,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    (item: T, index: number) => {
      setSelectedIndex(index);
      onItemSelect?.(item, index);
    },
    [onItemSelect],
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      setTopGradientOpacity(Math.min(scrollTop / 50, 1));
      const bottomDistance = scrollHeight - (scrollTop + clientHeight);
      setBottomGradientOpacity(
        scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
      );
    },
    [],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!enableArrowNavigation) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "Enter") {
        const item = items[selectedIndex];
        if (item !== undefined) {
          event.preventDefault();
          onItemSelect?.(item, selectedIndex);
        }
      }
    },
    [enableArrowNavigation, items, onItemSelect, selectedIndex],
  );

  useEffect(() => {
    if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
    const container = listRef.current;
    const selected = container.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`,
    );
    if (selected) {
      const margin = 50;
      const itemTop = selected.offsetTop;
      const itemBottom = itemTop + selected.offsetHeight;
      if (itemTop < container.scrollTop + margin) {
        container.scrollTo({ top: itemTop - margin, behavior: "smooth" });
      } else if (
        itemBottom >
        container.scrollTop + container.clientHeight - margin
      ) {
        container.scrollTo({
          top: itemBottom - container.clientHeight + margin,
          behavior: "smooth",
        });
      }
    }
    setKeyboardNav(false);
  }, [selectedIndex, keyboardNav]);

  return (
    <div className={cn("relative min-h-0", className)}>
      <div
        ref={listRef}
        role="listbox"
        aria-label="Context units"
        tabIndex={0}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-full space-y-1.5 overflow-y-auto px-3 py-3 outline-none",
          !displayScrollbar && "hide-scrollbar",
        )}
      >
        {items.length === 0
          ? emptyState
          : items.map((item, index) => (
              <AnimatedItem
                key={getKey?.(item, index) ?? index}
                delay={Math.min(index, 8) * 0.012}
                index={index}
                onMouseEnter={() => handleItemMouseEnter(index)}
                onClick={() => handleItemClick(item, index)}
              >
                <div
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={itemClassName}
                >
                  {renderItem
                    ? renderItem(item, index, selectedIndex === index)
                    : String(item)}
                </div>
              </AnimatedItem>
            ))}
      </div>

      {showGradients ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-surface to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-surface to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      ) : null}
    </div>
  );
}
