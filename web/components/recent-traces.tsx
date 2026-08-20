import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { formatCompactCurrency, formatDate, formatLatency } from "@/lib/format";
import type { Trace } from "@/lib/types";
import { RiskBadge, StatusBadge } from "@/components/ui";

export function RecentTraces({ traces }: { traces: Trace[] }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th scope="col">Trace</th>
            <th scope="col">Status</th>
            <th scope="col">Risk</th>
            <th scope="col">Model</th>
            <th scope="col">Latency</th>
            <th scope="col">Cost</th>
            <th scope="col"><span className="sr-only">Open</span></th>
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => (
            <tr key={trace.id}>
              <td>
                <Link href={`/traces/${trace.id}`} className="trace-primary-link">
                  <strong>{trace.name}</strong>
                  <span>{formatDate(trace.startedAt)} · {trace.id}</span>
                </Link>
              </td>
              <td><StatusBadge status={trace.status} /></td>
              <td><RiskBadge risk={trace.riskLevel} /></td>
              <td><span className="model-name">{trace.model}</span></td>
              <td className="tabular">{formatLatency(trace.latencyMs)}</td>
              <td className="tabular">{formatCompactCurrency(trace.costUsd)}</td>
              <td><Link href={`/traces/${trace.id}`} className="row-action" aria-label={`View ${trace.name}`}><ArrowIcon /></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
