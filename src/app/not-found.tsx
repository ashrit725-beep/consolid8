import Link from "next/link";
import { DEFAULT_ROUTE } from "@/config/navigation";
import { EmptyState } from "@/components/shared";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      description="That route does not exist in this build of Consolid8."
      action={
        <Link
          href={DEFAULT_ROUTE}
          className="rounded-sm border border-line-strong bg-surface-raised px-3 py-1.5 text-[11px] font-medium tracking-[0.06em] text-fg uppercase transition-colors hover:border-fg-faint"
        >
          Back to Overview
        </Link>
      }
    />
  );
}
