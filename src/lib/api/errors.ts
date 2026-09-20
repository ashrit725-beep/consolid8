export type ApiErrorKind =
  | "backend_unavailable"
  | "compilation_failed"
  | "verification_failed"
  | "invalid_context"
  | "context_too_large"
  | "timeout"
  | "missing_task"
  | "not_found"
  | "unknown";

export class Consolid8ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly detail?: string;

  constructor(kind: ApiErrorKind, message: string, detail?: string) {
    super(message);
    this.name = "Consolid8ApiError";
    this.kind = kind;
    this.detail = detail;
  }
}

export function toApiError(error: unknown): Consolid8ApiError {
  if (error instanceof Consolid8ApiError) return error;
  if (error instanceof DOMException && error.name === "AbortError") {
    return new Consolid8ApiError(
      "timeout",
      "The compilation request timed out.",
      "The runtime did not respond within the configured budget.",
    );
  }
  return new Consolid8ApiError(
    "backend_unavailable",
    "Could not reach the Consolid8 runtime.",
    error instanceof Error ? error.message : String(error),
  );
}
