import {
  ChartColumn,
  CodeXml,
  Cpu,
  FlaskConical,
  LayoutDashboard,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  /** Stable key — used for active-state matching and analytics. */
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Shown in the sidebar tooltip / command palette. */
  description: string;
  /** Optional right-aligned hint, e.g. a live status dot. */
  badge?: "live";
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Adding a feature = adding one entry here + one thin page file.
 * Nothing else in the shell needs to change.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "runtime",
    label: "Runtime",
    items: [
      {
        id: "overview",
        label: "Overview",
        href: "/overview",
        icon: LayoutDashboard,
        description: "Runtime health and the latest compilation",
      },
      {
        id: "compiler",
        label: "Compiler",
        href: "/compiler",
        icon: Cpu,
        description: "Compile a task down to its minimum context",
        badge: "live",
      },
      {
        id: "inspector",
        label: "Inspector",
        href: "/inspector",
        icon: ScanSearch,
        description: "Every decision, unit by unit",
      },
      {
        id: "verification",
        label: "Verification",
        href: "/verification",
        icon: ShieldCheck,
        description: "Requirements, evidence and recovery passes",
      },
    ],
  },
  {
    id: "evidence",
    label: "Evidence",
    items: [
      {
        id: "stress-test",
        label: "Stress Test",
        href: "/stress-test",
        icon: FlaskConical,
        description: "Full vs naive optimization vs Consolid8",
      },
      {
        id: "analytics",
        label: "Analytics",
        href: "/analytics",
        icon: ChartColumn,
        description: "Reduction, pass rate and estimated impact",
      },
    ],
  },
  {
    id: "build",
    label: "Build",
    items: [
      {
        id: "developer",
        label: "Developer",
        href: "/developer",
        icon: CodeXml,
        description: "SDK, REST API and response contracts",
      },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export const DEFAULT_ROUTE = "/overview";

export function findNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}
