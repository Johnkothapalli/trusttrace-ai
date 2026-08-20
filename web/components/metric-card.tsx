import type { ReactNode } from "react";

export function MetricCard({
  label,
  value,
  change,
  trend,
  context,
  icon,
}: {
  label: string;
  value: string;
  change: string;
  trend: "positive" | "negative" | "neutral";
  context: string;
  icon: ReactNode;
}) {
  return (
    <article className="metric-card">
      <div className="metric-topline">
        <p>{label}</p>
        <span className="metric-icon">{icon}</span>
      </div>
      <p className="metric-value">{value}</p>
      <p className="metric-context">
        <span className={`metric-change ${trend}`}>{change}</span>
        <span>{context}</span>
      </p>
    </article>
  );
}
