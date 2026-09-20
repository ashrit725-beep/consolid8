import { ShieldAlert, ShieldCheck } from "lucide-react";
import type { AuthorityLevel, SourceTrust } from "@/types/context";
import { AUTHORITY_LABELS, TRUST_STYLES } from "@/config/statusStyles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn } from "@/lib/utils";

/**
 * Trust and authority of a context origin. Untrusted sources may supply data
 * but never instructions — this badge is how that rule becomes visible.
 */
export function SourceTrustBadge({
  trust,
  authority,
  showAuthority = true,
  className,
}: {
  trust: SourceTrust;
  authority?: AuthorityLevel;
  showAuthority?: boolean;
  className?: string;
}) {
  const tone = TRUST_STYLES[trust];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <StatusBadge
        tone={tone}
        glyph={
          trust === "untrusted" ? (
            <ShieldAlert size={9} />
          ) : trust === "trusted" ? (
            <ShieldCheck size={9} />
          ) : null
        }
      />
      {showAuthority && authority ? (
        <span className="truncate text-[11px] text-fg-muted">
          {AUTHORITY_LABELS[authority]}
        </span>
      ) : null}
    </span>
  );
}

/** Legend explaining the trust ladder. Used on the Inspector page. */
export function SourceTrustLegend({ className }: { className?: string }) {
  const rows: Array<{ source: string; trust: SourceTrust }> = [
    { source: "System", trust: "trusted" },
    { source: "Policy", trust: "trusted" },
    { source: "User", trust: "standard" },
    { source: "Tool output", trust: "limited" },
    { source: "Document", trust: "untrusted" },
    { source: "Web", trust: "untrusted" },
  ];

  return (
    <ul className={cn("grid gap-1", className)}>
      {rows.map((row) => (
        <li
          key={row.source}
          className="flex items-center justify-between gap-3 rounded-sm px-1.5 py-1 text-[11px] odd:bg-white/[0.015]"
        >
          <span className="text-fg-muted">{row.source}</span>
          <StatusBadge tone={TRUST_STYLES[row.trust]} />
        </li>
      ))}
    </ul>
  );
}
