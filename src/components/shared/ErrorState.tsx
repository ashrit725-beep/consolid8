import type { ReactNode } from "react";
import { CircleAlert, TriangleAlert } from "lucide-react";
import type { ApiErrorKind } from "@/lib/api";
import { cn } from "@/lib/utils";

const COPY: Record<ApiErrorKind, { title: string; description: string }> = {
  backend_unavailable: {
    title: "Runtime unreachable",
    description:
      "The Consolid8 runtime did not respond. Switch to Demo mode to continue the walkthrough.",
  },
  compilation_failed: {
    title: "Compilation failed",
    description:
      "The runtime could not compile this context. The canonical context is unchanged.",
  },
  verification_failed: {
    title: "Verification failed after recovery",
    description:
      "Consolid8 could not restore every critical constraint. The full context was returned instead of an unsafe compilation.",
  },
  invalid_context: {
    title: "Invalid context",
    description:
      "The supplied conversation could not be parsed into context units.",
  },
  context_too_large: {
    title: "Context too large",
    description:
      "This conversation exceeds the ingestion limit. Split it or raise the limit on the runtime.",
  },
  timeout: {
    title: "Request timed out",
    description: "The runtime did not finish within the configured budget.",
  },
  missing_task: {
    title: "No task supplied",
    description:
      "Consolid8 selects context relative to a task. Describe what the model needs to do.",
  },
  not_found: {
    title: "Run not found",
    description: "That compilation is no longer available.",
  },
  unknown: {
    title: "Something went wrong",
    description: "An unexpected error occurred.",
  },
};

export function ErrorState({
  kind = "unknown",
  title,
  description,
  detail,
  action,
  severity = "error",
  className,
}: {
  kind?: ApiErrorKind;
  title?: string;
  description?: string;
  detail?: string;
  action?: ReactNode;
  severity?: "error" | "warning";
  className?: string;
}) {
  const copy = COPY[kind];
  const Icon = severity === "warning" ? TriangleAlert : CircleAlert;

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-md border px-3.5 py-3",
        severity === "warning"
          ? "border-warn/25 bg-warn/[0.05]"
          : "border-danger/25 bg-danger/[0.05]",
        className,
      )}
    >
      <Icon
        size={15}
        className={cn(
          "mt-px shrink-0",
          severity === "warning" ? "text-warn" : "text-danger",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[12.5px] font-medium",
            severity === "warning" ? "text-warn" : "text-danger",
          )}
        >
          {title ?? copy.title}
        </p>
        <p className="mt-0.5 text-[12px] leading-snug text-fg-muted">
          {description ?? copy.description}
        </p>
        {detail ? (
          <p className="num mt-1.5 truncate text-[10.5px] text-fg-faint">
            {detail}
          </p>
        ) : null}
        {action ? <div className="mt-2.5">{action}</div> : null}
      </div>
    </div>
  );
}
