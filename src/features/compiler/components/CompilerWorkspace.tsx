"use client";

import { useEffect, useRef, useState } from "react";
import type { ContextUnit } from "@/types/context";
import { ContextDetailDrawer, ErrorState } from "@/components/shared";
import { Button } from "@/components/ui/Button";
import { useCompilation } from "../hooks/useCompilation";
import { CompilerHeader } from "./CompilerHeader";
import { CanonicalContextPanel } from "./CanonicalContextPanel";
import { CompilationPipeline } from "./CompilationPipeline";
import { CompiledContextPanel } from "./CompiledContextPanel";
import { ResultBar } from "./ResultBar";
import { CompilerDock } from "./CompilerDock";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Feature entry point. Composes four independent panels; each one can be
 * worked on without touching the others.
 */
export function CompilerWorkspace() {
  const compilation = useCompilation();
  const [selected, setSelected] = useState<ContextUnit | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const selectUnit = (unit: ContextUnit) => setSelected(unit);

  // The three panels are fixed-height so their internal lists scroll rather
  // than the page. Size them to what is actually left below the fold, so the
  // pipeline's failing stage is never cut off by the bottom of the viewport.
  useEffect(() => {
    const apply = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const top = grid.getBoundingClientRect().top + window.scrollY;
      const available = window.innerHeight - top - 24;
      const height = Math.round(Math.min(620, Math.max(380, available)));
      grid.style.setProperty("--panel-h", `${height}px`);
    };

    apply();
    window.addEventListener("resize", apply);
    const observer = new ResizeObserver(apply);
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      window.removeEventListener("resize", apply);
      observer.disconnect();
    };
  }, []);

  // On short viewports the panels still run past the fold. Bring the payoff
  // into view once, when the run starts, instead of mid-failure.
  useEffect(() => {
    if (compilation.phase !== "running") return;
    const grid = gridRef.current;
    if (!grid) return;
    const overflow = grid.getBoundingClientRect().bottom - window.innerHeight + 16;
    if (overflow <= 1) return;
    window.scrollTo({
      top: window.scrollY + overflow,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }, [compilation.phase]);

  // The header advertises ⌘↵, so it has to work wherever focus happens to be.
  const latest = useRef(compilation);
  useEffect(() => {
    latest.current = compilation;
  });
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key !== "Enter") return;
      const current = latest.current;
      if (current.phase === "running" || current.task.trim().length === 0) return;
      event.preventDefault();
      current.compile();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div ref={rootRef} className="flex flex-col gap-4">
      <CompilerHeader
        task={compilation.task}
        onTaskChange={compilation.setTask}
        phase={compilation.phase}
        onCompile={compilation.compile}
        onLoadDemo={compilation.loadDemo}
        onReset={compilation.reset}
      />

      {compilation.error ? (
        <ErrorState
          kind={compilation.error.kind}
          detail={compilation.error.detail}
          action={
            <Button size="sm" onClick={compilation.loadDemo}>
              Load demo context
            </Button>
          }
        />
      ) : null}

      {/* Both strips are always mounted — see ResultBar and CompilerDock — so
          the three panels do not shift by ~94px at the exact moment of the
          payoff, under the presenter's cursor. */}
      <ResultBar result={compilation.result} />

      <CompilerDock />

      <div
        ref={gridRef}
        className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.86fr)_minmax(0,1fr)]"
      >
        <CanonicalContextPanel
          units={compilation.units}
          onSelectUnit={selectUnit}
          selectedUnitId={selected?.id ?? null}
          onLoadDemo={compilation.loadDemo}
        />

        <CompilationPipeline
          phase={compilation.phase}
          stages={compilation.stages}
          progress={compilation.progress}
          liveTokens={compilation.liveTokens}
          result={compilation.result}
          failedAttempt={compilation.failedAttempt}
          recoveredRefs={compilation.recoveredRefs}
        />

        <CompiledContextPanel
          result={compilation.result}
          running={compilation.phase === "running"}
          onSelectUnit={selectUnit}
          selectedUnitId={selected?.id ?? null}
        />
      </div>

      <ContextDetailDrawer
        unit={selected}
        units={compilation.units}
        onClose={() => setSelected(null)}
        onSelectUnit={selectUnit}
      />
    </div>
  );
}
