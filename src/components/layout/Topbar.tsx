"use client";

import { usePathname } from "next/navigation";
import { CircleCheck, CircleX, LoaderCircle } from "lucide-react";
import { findNavItem } from "@/config/navigation";
import { BRAND } from "@/config/brand";
import { VERIFICATION_STYLES } from "@/config/statusStyles";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { LIVE_BACKEND_CONFIGURED } from "@/lib/api";
import { useRuntime } from "@/lib/state";
import { cn } from "@/lib/utils";
import { formatInt, formatPercent } from "@/lib/formatting";
import { LogoMark, Wordmark } from "./Logo";

/**
 * Global header. Page identity comes from config/navigation.ts, so adding a
 * feature never means editing this file.
 */
export function Topbar() {
  const pathname = usePathname();
  const { mode, setMode, run, runPhase } = useRuntime();
  const item = findNavItem(pathname);
  const tone = VERIFICATION_STYLES[run.verification.status];
  const passed = run.verification.status === "pass";
  const running = runPhase === "running";

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <LogoMark size={20} className="text-fg" />
            <Wordmark />
          </div>
          <div className="hidden min-w-0 lg:block">
            <h1 className="truncate text-[14px] leading-tight font-medium text-fg">
              {item?.label ?? BRAND.name}
            </h1>
            <p className="truncate text-[11.5px] text-fg-dim">
              {item?.description ?? BRAND.descriptor}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-3 border-r border-line pr-3 md:flex">
            {runPhase === "seeded" ? (
              <span className="label-xs text-fg-dim">Last run {run.runId}</span>
            ) : null}
            <Readout
              label="Original"
              value={running ? EMPTY : formatInt(run.metrics.originalTokens)}
              tone={running ? "text-fg-faint" : undefined}
            />
            <Readout
              label="Compiled"
              value={running ? EMPTY : formatInt(run.metrics.compiledTokens)}
              tone={running ? "text-fg-faint" : "text-fg"}
            />
            <Readout
              label="Reduction"
              value={running ? EMPTY : formatPercent(run.metrics.tokenReduction)}
              tone={running ? "text-fg-faint" : "text-signal"}
            />
          </div>

          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-[10px] font-semibold tracking-[0.08em]",
              running
                ? "bg-surface-raised border-line-strong text-fg-muted"
                : [tone.bg, tone.border, tone.text],
            )}
            title={
              running
                ? "Compilation in progress — verification has not run yet"
                : `${run.verification.satisfied} of ${run.verification.total} requirements satisfied`
            }
          >
            {running ? (
              <LoaderCircle size={11} className="animate-spin" />
            ) : passed ? (
              <CircleCheck size={11} />
            ) : (
              <CircleX size={11} />
            )}
            {running ? "RUNNING" : tone.label}
          </span>

          <SegmentedControl
            label="Runtime mode"
            value={mode}
            onChange={setMode}
            options={[
              { value: "demo", label: "Demo", hint: "Deterministic fixture data" },
              {
                value: "live",
                label: "Live",
                disabled: !LIVE_BACKEND_CONFIGURED,
                hint: LIVE_BACKEND_CONFIGURED
                  ? "Calls the configured Consolid8 runtime"
                  : "Set NEXT_PUBLIC_CONSOLID8_API_URL to enable live mode",
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

/** Em dash placeholder shown while a compilation is in flight. */
const EMPTY = "\u2014";

function Readout({
  label,
  value,
  tone = "text-fg-muted",
}: {
  label: string;
  value: string;
  tone?: string | undefined;
}) {
  return (
    <div className="text-right">
      <p className="label-xs leading-none">{label}</p>
      <p className={cn("num mt-1 text-[12px] leading-none", tone)}>{value}</p>
    </div>
  );
}
