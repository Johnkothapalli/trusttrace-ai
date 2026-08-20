import { buildTrendPath } from "@/lib/format";
import type { TrendPoint } from "@/lib/types";

export function RiskTrendChart({ points }: { points: TrendPoint[] }) {
  const monitoredPath = buildTrendPath(points, "monitored");
  const blockedPath = buildTrendPath(points, "blocked");

  return (
    <div className="trend-chart-wrap">
      <div className="chart-legend" aria-hidden="true">
        <span><i className="legend-monitored" /> Monitored</span>
        <span><i className="legend-blocked" /> Blocked</span>
      </div>
      <svg
        className="trend-chart"
        viewBox="0 0 640 220"
        role="img"
        aria-labelledby="risk-chart-title risk-chart-desc"
      >
        <title id="risk-chart-title">Guardrail activity over the last seven days</title>
        <desc id="risk-chart-desc">
          Monitored signals peaked at 27 on August 17. Blocked signals peaked at 14 on the same day.
        </desc>
        <defs>
          <linearGradient id="monitored-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#746cff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#746cff" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[44, 88, 132, 176].map((y) => (
          <line key={y} x1="14" y1={y} x2="626" y2={y} className="chart-gridline" />
        ))}
        <path d={`${monitoredPath} L626,206 L14,206 Z`} fill="url(#monitored-fill)" />
        <path d={monitoredPath} className="chart-line monitored-line" />
        <path d={blockedPath} className="chart-line blocked-line" />
        {points.map((point, index) => {
          const x = 14 + (index / Math.max(points.length - 1, 1)) * 612;
          return <text key={point.label} x={x} y="219" textAnchor={index === 0 ? "start" : index === points.length - 1 ? "end" : "middle"} className="chart-label">{point.label.replace("Aug ", "")}</text>;
        })}
      </svg>
    </div>
  );
}
