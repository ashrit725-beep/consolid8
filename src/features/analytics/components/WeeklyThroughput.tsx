import type { TokenSeriesPoint } from "@/types/analytics";
import { formatInt, formatPercent } from "@/lib/formatting";

/**
 * Exact weekly magnitudes behind the token chart. Fleet-scoped, and the only
 * place in the product that states tokens avoided per week as a figure.
 */
export function WeeklyThroughput({ series }: { series: TokenSeriesPoint[] }) {
  const totals = series.reduce(
    (acc, point) => ({
      original: acc.original + point.original,
      compiled: acc.compiled + point.compiled,
    }),
    { original: 0, compiled: 0 },
  );

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-line">
          <th className="label-xs py-1.5 text-left">Week</th>
          <th className="label-xs py-1.5 text-right">Canonical</th>
          <th className="label-xs py-1.5 text-right">Compiled</th>
          <th className="label-xs py-1.5 text-right">Avoided</th>
          <th className="label-xs py-1.5 text-right">Reduction</th>
        </tr>
      </thead>
      <tbody>
        {series.map((point) => (
          <tr key={point.label} className="border-b border-line/70">
            <td className="num py-1.5 text-[11px] text-fg-muted">
              {point.label}
            </td>
            <td className="num py-1.5 text-right text-[11.5px] text-fg-dim">
              {formatInt(point.original)}
            </td>
            <td className="num py-1.5 text-right text-[11.5px] text-fg">
              {formatInt(point.compiled)}
            </td>
            <td className="num py-1.5 text-right text-[11.5px] text-fg">
              {formatInt(point.original - point.compiled)}
            </td>
            <td className="num py-1.5 text-right text-[11.5px] text-signal">
              {formatPercent(
                (point.original - point.compiled) / point.original,
              )}
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td className="label-xs py-1.5 text-fg-muted">
            {series.length} weeks
          </td>
          <td className="num py-1.5 text-right text-[11.5px] text-fg-dim">
            {formatInt(totals.original)}
          </td>
          <td className="num py-1.5 text-right text-[11.5px] text-fg">
            {formatInt(totals.compiled)}
          </td>
          <td className="num py-1.5 text-right text-[11.5px] text-fg">
            {formatInt(totals.original - totals.compiled)}
          </td>
          <td className="num py-1.5 text-right text-[11.5px] text-signal">
            {totals.original > 0
              ? formatPercent(
                  (totals.original - totals.compiled) / totals.original,
                )
              : "—"}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
