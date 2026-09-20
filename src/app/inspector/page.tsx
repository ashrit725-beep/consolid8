import type { Metadata } from "next";
import { ContextInspector } from "@/features/inspector";

export const metadata: Metadata = { title: "Inspector" };

export default function InspectorPage() {
  return <ContextInspector />;
}
