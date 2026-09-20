import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The container every surface in Consolid8 is built from.
 * One border treatment, one radius, one header height — everywhere.
 */
export function Panel({
  children,
  className,
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "aside";
}) {
  return (
    <Tag
      className={cn(
        "relative flex min-w-0 flex-col overflow-hidden rounded-md border border-line bg-surface",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelHeader({
  title,
  subtitle,
  icon,
  actions,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex min-h-11 shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        {icon ? <span className="shrink-0 text-fg-dim">{icon}</span> : null}
        <div className="min-w-0">
          <h2 className="label-xs truncate text-fg-muted">{title}</h2>
          {subtitle ? (
            <p className="truncate text-2xs text-fg-dim">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-1.5">{actions}</div>
      ) : null}
    </header>
  );
}

export function PanelBody({
  children,
  className,
  scroll = false,
}: {
  children: ReactNode;
  className?: string;
  scroll?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 p-4",
        scroll && "overflow-y-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "flex shrink-0 items-center gap-3 border-t border-line bg-surface-inset/60 px-4 py-2.5",
        className,
      )}
    >
      {children}
    </footer>
  );
}
