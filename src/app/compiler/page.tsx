import type { Metadata } from "next";
import { CompilerWorkspace } from "@/features/compiler";

export const metadata: Metadata = { title: "Compiler" };

export default function CompilerPage() {
  return <CompilerWorkspace />;
}
