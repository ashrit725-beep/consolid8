import { Check, X } from "lucide-react";
import type { ConstraintOutcome } from "@/types/stress-test";
import { cn } from "@/lib/utils";

/**
 * Per-constraint outcome for one variant. Lost constraints are listed first —
 * that is the whole point of the comparison.
 */
export function ConstraintDiff({
  constraints,
  emphasizeLosses = true,
}: {
  constraints: ConstraintOutcome[];
  emphasizeLosses?: boolean;
}) {
  const lost = constraints.filter((c) => !c.preserved);
  const kept = constraints.filter((c) => c.preserved);
  const ordered = emphasizeLosses ? [...lost, ...kept] : constraints;

  return (
    <ul className="space-y-px">
      {ordered.map((constraint) => (
        <li
          key={constraint.id}
          className={cn(
            "flex items-start gap-2 rounded-sm px-2 py-1.5",
            !constraint.preserved && "bg-danger/[0.07]",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "mt-px flex size-3.5 shrink-0 items-center justify-center rounded-[3px] border",
              constraint.preserved
                ? "border-signal/35 bg-signal/10 text-signal"
                : "border-danger/45 bg-danger/15 text-danger",
            )}
          >
            {constraint.preserved ? (
              <Check size={9} strokeWidth={3} />
            ) : (
              <X size={9} strokeWidth={3} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block text-[11.5px] leading-snug",
                constraint.preserved ? "text-fg-muted" : "text-fg",
              )}
            >
              {constraint.statement}
            </span>
            {!constraint.preserved ? (
              <span className="mt-0.5 block text-[10.5px] leading-snug text-danger/85">
                {constraint.note}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
