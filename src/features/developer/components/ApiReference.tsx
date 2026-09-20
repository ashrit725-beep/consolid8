import { Panel, PanelHeader } from "@/components/ui/Panel";
import { cn } from "@/lib/utils";

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  summary: string;
  returns: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "POST",
    path: "/api/compile",
    summary: "Compile a conversation down to the minimum context for a task.",
    returns: "CompilationResponse",
  },
  {
    method: "GET",
    path: "/api/compilations",
    summary: "List recent compilation runs for the workspace.",
    returns: "CompilationRun[]",
  },
  {
    method: "GET",
    path: "/api/compilations/:runId",
    summary: "Fetch a single run with its full context and decisions.",
    returns: "CompilationResponse",
  },
  {
    method: "POST",
    path: "/api/compilations/:runId/verify",
    summary: "Re-run verification against a stored compilation.",
    returns: "VerificationResult",
  },
  {
    method: "POST",
    path: "/api/stress-test",
    summary: "Compare full, naive and Consolid8 context for one task.",
    returns: "StressTestResult",
  },
  {
    method: "GET",
    path: "/api/analytics",
    summary: "Workspace rollups: reduction, pass rate, recovery rate.",
    returns: "AnalyticsSnapshot",
  },
];

/**
 * Endpoints the live adapter in lib/api/consolid8.ts calls. This table and
 * that file are the only places the backend surface is described.
 */
export function ApiReference() {
  return (
    <Panel>
      <PanelHeader
        title="API surface"
        subtitle="What lib/api/consolid8.ts calls in live mode"
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-line">
              {["Method", "Path", "Summary", "Returns"].map((heading) => (
                <th key={heading} scope="col" className="label-xs px-4 py-2 font-medium">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENDPOINTS.map((endpoint) => (
              <tr
                key={endpoint.path + endpoint.method}
                className="border-b border-line/60 last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-2.5">
                  <span
                    className={cn(
                      "num rounded-xs border px-1.5 py-px text-[10px] font-semibold",
                      endpoint.method === "POST"
                        ? "border-info/30 bg-info/10 text-info"
                        : "border-signal/25 bg-signal/10 text-signal",
                    )}
                  >
                    {endpoint.method}
                  </span>
                </td>
                <td className="num px-4 py-2.5 text-[12px] whitespace-nowrap text-fg">
                  {endpoint.path}
                </td>
                <td className="px-4 py-2.5 text-[12px] text-fg-muted">
                  {endpoint.summary}
                </td>
                <td className="num px-4 py-2.5 text-[11.5px] whitespace-nowrap text-cacheable">
                  {endpoint.returns}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
