import type { Metadata } from "next";
import { AnalyticsDashboard } from "@/features/analytics";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}
