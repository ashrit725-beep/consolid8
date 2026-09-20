"use client";

import { Cpu, Play, RotateCcw, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { CompilerPhase } from "../types";

export function CompilerHeader({
  task,
  onTaskChange,
  phase,
  onCompile,
  onLoadDemo,
  onReset,
}: {
  task: string;
  onTaskChange: (task: string) => void;
  phase: CompilerPhase;
  onCompile: () => void;
  onLoadDemo: () => void;
  onReset: () => void;
}) {
  const running = phase === "running";

  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Runtime mode lives in the global Topbar. One toggle per app. */}
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-sm border border-line bg-surface-inset text-fg-dim">
            <Cpu size={14} />
          </span>
          <h2 className="text-[14px] leading-tight font-medium text-fg">
            Compile context
          </h2>
        </div>
      </div>

      <div className="mt-3.5">
        <label htmlFor="compiler-task" className="label-xs mb-1.5 block">
          Task
        </label>
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-stretch">
          <textarea
            id="compiler-task"
            value={task}
            rows={2}
            disabled={running}
            onChange={(event) => onTaskChange(event.target.value)}
            placeholder="Describe what the model needs to do, e.g. Prepare the production deployment plan and identify required approvals."
            className="min-h-[58px] flex-1 resize-none rounded-md border border-line bg-surface-inset px-3 py-2 text-[13px] leading-relaxed text-fg placeholder:text-fg-faint focus:border-line-strong focus:outline-none disabled:opacity-60"
          />

          <div className="flex shrink-0 flex-wrap items-end gap-2 lg:flex-col lg:items-stretch lg:justify-between">
            <Button
              variant="primary"
              onClick={onCompile}
              disabled={running || task.trim().length === 0}
              icon={running ? <Zap size={12} /> : <Play size={12} />}
              hint="⌘↵"
              className="lg:w-full"
            >
              {running ? "Compiling" : "Compile"}
            </Button>
            <div className="flex gap-2 lg:w-full">
              <Button
                onClick={onLoadDemo}
                disabled={running}
                size="sm"
                className="flex-1 whitespace-nowrap"
              >
                Load demo
              </Button>
              <Button
                onClick={onReset}
                disabled={running}
                size="sm"
                variant="ghost"
                icon={<RotateCcw size={11} />}
                className="flex-1 whitespace-nowrap"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
