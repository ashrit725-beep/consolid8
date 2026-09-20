"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "@/config/navigation";
import { BRAND } from "@/config/brand";
import { useRuntime } from "@/lib/state";
import { cn } from "@/lib/utils";
import { LogoMark, Wordmark } from "./Logo";

export function Sidebar() {
  const pathname = usePathname();
  const { mode, run } = useRuntime();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[216px] flex-col border-r border-line bg-surface lg:flex">
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4">
        <LogoMark className="text-fg" />
        <div className="min-w-0">
          <Wordmark />
          <p className="mt-0.5 truncate text-[10px] tracking-[0.04em] text-fg-dim">
            {BRAND.subtitle}
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3" aria-label="Primary">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id} className="mb-4 last:mb-0">
            <p className="label-xs px-2 pb-1.5">{section.label}</p>
            <ul className="space-y-px">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      title={item.description}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-sm px-2 py-1.5 text-[12.5px] transition-colors duration-150",
                        active
                          ? "bg-white/[0.055] text-fg"
                          : "text-fg-muted hover:bg-white/[0.03] hover:text-fg",
                      )}
                    >
                      {active ? (
                        <span
                          aria-hidden
                          className="absolute top-1/2 -left-2.5 h-4 w-[2px] -translate-y-1/2 rounded-r-full bg-signal"
                        />
                      ) : null}
                      <Icon
                        size={14}
                        className={cn(
                          "shrink-0",
                          active
                            ? "text-signal"
                            : "text-fg-faint group-hover:text-fg-dim",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-line px-3 py-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="label-xs">Runtime</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xs border px-1.5 py-px text-[10px] font-medium tracking-[0.08em]",
              mode === "demo"
                ? "border-info/25 bg-info/10 text-info"
                : "border-signal/25 bg-signal/10 text-signal",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                mode === "demo" ? "bg-info" : "animate-pulse-soft bg-signal",
              )}
            />
            {mode.toUpperCase()}
          </span>
        </div>
        <p className="num mt-1.5 truncate text-[10px] text-fg-faint">
          run {run.runId} · v0.1.0
        </p>
      </div>
    </aside>
  );
}
