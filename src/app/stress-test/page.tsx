import type { Metadata } from "next";
import { StressTestComparison } from "@/features/stress-test";

export const metadata: Metadata = { title: "Stress Test" };

export default function StressTestPage() {
  return <StressTestComparison />;
}
