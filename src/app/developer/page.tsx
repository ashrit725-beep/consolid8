import type { Metadata } from "next";
import { DeveloperIntegration } from "@/features/developer";

export const metadata: Metadata = { title: "Developer" };

export default function DeveloperPage() {
  return <DeveloperIntegration />;
}
