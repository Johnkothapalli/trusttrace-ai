import type { RiskLevel, Trace, TrendPoint } from "@/lib/types";

export function formatCurrency(value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(value);
}

export function formatCompactCurrency(value: number): string {
  return formatCurrency(value, value < 1 ? 4 : 2);
}

export function formatLatency(value: number): string {
  return value >= 1000 ? `${(value / 1000).toFixed(2)}s` : `${value}ms`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function titleCase(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function buildTrendPath(
  points: TrendPoint[],
  key: "blocked" | "monitored",
  width = 640,
  height = 190,
  padding = 14,
): string {
  if (points.length === 0) return "";
  const max = Math.max(...points.flatMap((point) => [point.blocked, point.monitored]), 1);
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return points
    .map((point, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * usableWidth;
      const y = height - padding - (point[key] / max) * usableHeight;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function filterTraces(
  traces: Trace[],
  query: string,
  risk: RiskLevel | "all",
): Trace[] {
  const normalized = query.trim().toLowerCase();
  return traces.filter((trace) => {
    const matchesRisk = risk === "all" || trace.riskLevel === risk;
    const matchesQuery =
      !normalized ||
      [trace.id, trace.name, trace.useCase, trace.model, trace.provider]
        .join(" ")
        .toLowerCase()
        .includes(normalized);
    return matchesRisk && matchesQuery;
  });
}
