import type { Metadata } from "next";
import { VerificationDashboard } from "@/features/verification";

export const metadata: Metadata = { title: "Verification" };

export default function VerificationPage() {
  return <VerificationDashboard />;
}
