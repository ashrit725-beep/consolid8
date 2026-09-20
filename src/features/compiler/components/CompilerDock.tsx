"use client";

import { useRouter } from "next/navigation";
import { BarChart3, FlaskConical, ScanSearch, ShieldCheck } from "lucide-react";
import Dock from "@/components/ui/Dock";

/**
 * Resting height of the dock panel, which the slot below reserves exactly.
 * Mirrors Dock's own minimum — a 32px item plus its persistent label (11px),
 * the 2px gap between them and 8px of panel padding.
 */
const PANEL_HEIGHT = 53;

/**
 * Jump bar to the evidence routes.
 *
 * Deliberately does NOT repeat Compile / Load demo / Reset — those sit in the
 * header, two inches above. What the header cannot do is take you to the
 * evidence for the run, which is the next step in the walkthrough.
 *
 * Always live, never a decorative strip: the four routes read the run held in
 * the runtime store, which is populated before the first compile and replaced
 * by it, so there is nothing to disable and nothing that appears mid-demo to
 * shift the three panels underneath.
 */
export function CompilerDock() {
  const router = useRouter();

  return (
    <nav
      aria-label="Evidence routes"
      className="hidden flex-col items-center gap-2 lg:flex"
    >
      <span className="label-xs">Evidence</span>

      {/* Dock centres its panel absolutely and sizes it to its contents, so
          the slot is full width — a label beside it would be overlapped the
          moment the items get wider. The slot pins its own height and anchors
          the panel to the bottom, so the magnification on hover grows upward
          instead of pushing the three panels below it down. */}
      <div className="relative w-full" style={{ height: `${PANEL_HEIGHT}px` }}>
        <div className="absolute inset-x-0 bottom-0">
          <Dock
            baseItemSize={32}
            magnification={44}
            panelHeight={PANEL_HEIGHT}
            distance={140}
            items={[
              {
                icon: <ScanSearch size={14} />,
                label: "Inspector",
                onClick: () => router.push("/inspector"),
              },
              {
                icon: <ShieldCheck size={14} />,
                label: "Verification",
                onClick: () => router.push("/verification"),
              },
              {
                icon: <FlaskConical size={14} />,
                label: "Stress test",
                onClick: () => router.push("/stress-test"),
              },
              {
                icon: <BarChart3 size={14} />,
                label: "Analytics",
                onClick: () => router.push("/analytics"),
              },
            ]}
          />
        </div>
      </div>
    </nav>
  );
}
