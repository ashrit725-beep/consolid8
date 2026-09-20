import { CircleCheck, CircleX, LoaderCircle, RotateCcw } from "lucide-react";
import type { VerificationResult } from "@/types/verification";
import { VERIFICATION_STYLES } from "@/config/statusStyles";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Meter } from "@/components/ui/TokenBar";
import { cn } from "@/lib/utils";
import { formatRatio } from "@/lib/formatting";

/**
 * Verification rollup. Designed to be dropped into Overview, Compiler,
 * Verification and Stress Test without a per-page variant.
 */
export function VerificationSummary({
  verification,
  variant = "detailed",
  className,
}: {
  verification: VerificationResult;
  variant?: "compact" | "detailed";
  className?: string;
}) {
  const tone = VERIFICATION_STYLES[verification.status];
  const Glyph =
    verification.status === "pass"
      ? CircleCheck
      : verification.status === "fail"
        ? CircleX
        : LoaderCircle;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Glyph
            size={15}
            className={cn(
              tone.text,
              verification.status === "running" && "animate-spin",
            )}
            aria-hidden
          />
          <div>
            <p className={cn("text-[13px] font-medium", tone.text)}>
              Verification {tone.label}
            </p>
            <p className="num text-[10px] text-fg-dim">
              {formatRatio(verification.satisfied, verification.total)}{" "}
              requirements satisfied
            </p>
          </div>
        </div>
        {verification.recoveryPasses > 0 ? (
          <StatusBadge
            tone={{
              ...VERIFICATION_STYLES.pass,
              label: `${verification.recoveryPasses} RECOVERY PASS`,
              text: "text-warn",
              bg: "bg-warn/10",
              border: "border-warn/25",
            }}
            glyph={<RotateCcw size={9} />}
            title="Context was restored automatically after a failed verification pass"
          />
        ) : null}
      </div>

      {variant === "detailed" ? (
        <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {verification.groups.map((group) => {
            const complete = group.passed === group.total;
            return (
              <li
                key={group.category}
                className="rounded-md border border-line bg-surface-inset px-2.5 py-2"
              >
                <p className="label-xs truncate">{group.label}</p>
                <p
                  className={cn(
                    "num mt-1 text-[15px] leading-none",
                    complete ? "text-fg" : "text-danger",
                  )}
                >
                  {group.passed}
                  <span className="text-fg-faint"> / {group.total}</span>
                </p>
                <Meter
                  className="mt-2"
                  value={group.total === 0 ? 0 : group.passed / group.total}
                  tone={complete ? "#3fd98b" : "#ff5d5d"}
                />
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
