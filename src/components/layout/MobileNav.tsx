"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/config/navigation";
import { cn } from "@/lib/utils";

/** Horizontal fallback nav for tablet widths. Desktop uses the sidebar. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Sections"
      className="hide-scrollbar sticky top-14 z-10 flex gap-1 overflow-x-auto border-b border-line bg-canvas/85 px-4 py-2 backdrop-blur-md lg:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-sm px-2.5 py-1 text-[11px] font-medium tracking-[0.06em] uppercase transition-colors",
              active
                ? "bg-white/[0.06] text-fg"
                : "text-fg-dim hover:text-fg-muted",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
