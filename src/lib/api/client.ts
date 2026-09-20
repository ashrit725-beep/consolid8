import { Consolid8ApiError, toApiError } from "./errors";

/** Base URL of the Consolid8 runtime. Empty string = same-origin /api. */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_CONSOLID8_API_URL?.replace(/\/$/, "") ?? "";

export const LIVE_BACKEND_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_CONSOLID8_API_URL,
);

const DEFAULT_TIMEOUT_MS = 30_000;

/**
 * The only place in the app that calls `fetch`. Feature code goes through
 * `lib/api/consolid8.ts`, never through here directly.
 */
export async function request<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    init?.timeoutMs ?? DEFAULT_TIMEOUT_MS,
  );

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Consolid8ApiError(
        response.status === 404 ? "not_found" : "compilation_failed",
        `Runtime responded ${response.status}`,
        body.slice(0, 400) || undefined,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    throw toApiError(error);
  } finally {
    clearTimeout(timeout);
  }
}
