import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid-texture flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-line px-6 py-10 text-center",
        className,
      )}
    >
      {icon ? <span className="text-fg-faint">{icon}</span> : null}
      <div>
        <p className="text-[13px] font-medium text-fg-muted">{title}</p>
        {description ? (
          <p className="mx-auto mt-1 max-w-[46ch] text-[12px] text-fg-dim">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
