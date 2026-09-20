import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

/**
 * Shell = sidebar + header + a content well. Features render inside the well
 * and own nothing outside it.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="lg:pl-[216px]">
        <Topbar />
        <MobileNav />
        {/* overflow-x-clip: decorative glow layers extend past their card and
            would otherwise create a horizontal scrollbar at tablet widths.
            `clip` (not `hidden`) keeps sticky positioning working. */}
        <main className="mx-auto w-full max-w-[1560px] overflow-x-clip px-4 py-5 lg:px-6 lg:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
