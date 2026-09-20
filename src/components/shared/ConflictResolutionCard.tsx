import { ArrowDown } from "lucide-react";
import type { Conflict } from "@/types/verification";
import { CLASSIFICATION_STYLES } from "@/config/statusStyles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

const RESOLUTION_LABEL: Record<Conflict["resolvedBy"], string> = {
  recency: "Resolved by recency",
  authority: "Resolved by authority",
  explicit_override: "Resolved by explicit override",
};

/**
 * Two versions of the same fact, and which one Consolid8 kept.
 * Reused by the Inspector conflicts tab and the Verification page.
 */
export function ConflictResolutionCard({
  conflict,
  className,
}: {
  conflict: Conflict;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-md border border-line bg-surface-inset p-3.5",
        className,
      )}
    >
      <header className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-[12px] font-medium text-fg">{conflict.topic}</h3>
        <span className="label-xs">{RESOLUTION_LABEL[conflict.resolvedBy]}</span>
      </header>

      <div className="grid gap-2">
        <ValueRow
          eyebrow="Old"
          value={conflict.staleValue}
          ref_={conflict.staleRef}
          tone="stale"
        />
        <div className="flex items-center gap-2 pl-1">
          <ArrowDown size={11} className="text-fg-faint" aria-hidden />
          <span className="label-xs text-stale">Superseded</span>
          <span
            aria-hidden
            className="h-px flex-1 bg-[repeating-linear-gradient(90deg,var(--color-line-strong)_0_4px,transparent_4px_8px)]"
          />
        </div>
        <ValueRow
          eyebrow="Current"
          value={conflict.currentValue}
          ref_={conflict.currentRef}
          tone="pinned"
        />
      </div>

      <p className="mt-3 border-t border-line pt-2.5 text-[11.5px] leading-snug text-fg-muted">
        {conflict.reason}
      </p>
    </article>
  );
}

function ValueRow({
  eyebrow,
  value,
  ref_,
  tone,
}: {
  eyebrow: string;
  value: string;
  ref_: string;
  tone: "stale" | "pinned";
}) {
  const style = CLASSIFICATION_STYLES[tone];
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-sm border px-2.5 py-2",
        style.border,
        style.bg,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="label-xs w-14 shrink-0">{eyebrow}</span>
        <span
          className={cn(
            "num truncate text-[13px] font-medium",
            tone === "stale" ? "text-stale" : "text-pinned",
          )}
        >
          {value}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="num text-[10px] text-fg-faint">{ref_}</span>
        <StatusBadge tone={style} />
      </div>
    </div>
  );
}
