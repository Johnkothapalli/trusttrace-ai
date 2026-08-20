import {
  demoExperiment,
  demoOverview,
  demoReviews,
  demoTraces,
  demoTrend,
} from "@/lib/demo-data";
import type {
  ApiResult,
  EvaluationExperiment,
  GuardrailSignal,
  OverviewMetrics,
  ReviewItem,
  ReviewStatus,
  RiskLevel,
  Severity,
  Trace,
  TrendPoint,
} from "@/lib/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const timeoutMs = 2500;

type ApiOverview = {
  total_traces: number;
  passed_traces: number;
  flagged_traces: number;
  pending_reviews: number;
  pass_rate: number;
  average_latency_ms: number;
  p95_latency_ms: number;
  estimated_cost_usd: number;
  trend: Array<{ date: string; traces: number; flagged: number; pass_rate: number }>;
};

type ApiFinding = {
  code: string;
  category: string;
  severity: Severity;
  location: "prompt" | "response";
  message: string;
  evidence: string;
  confidence: number;
};

type ApiTraceListItem = {
  id: string;
  external_id: string;
  provider: string;
  model: string;
  environment: string;
  prompt_preview: string;
  response_preview: string;
  latency_ms: number;
  estimated_cost_usd: number;
  risk_score: number;
  risk_level: RiskLevel;
  evaluation_passed: boolean;
  finding_count: number;
  review_status: string | null;
  created_at: string;
};

type ApiTraceDetail = ApiTraceListItem & {
  prompt: string;
  response: string;
  input_tokens: number;
  output_tokens: number;
  findings: ApiFinding[];
  metadata: Record<string, unknown>;
};

type ApiReview = {
  id: string;
  trace_id: string;
  external_id: string;
  model: string;
  status: "pending" | "in_review" | "resolved" | "dismissed";
  priority: RiskLevel;
  assignee: string | null;
  note: string | null;
  risk_score: number;
  finding_count: number;
  primary_finding: ApiFinding | null;
  created_at: string;
};

async function request<T>(path: string): Promise<T> {
  if (!apiBaseUrl) throw new Error("API URL is not configured");
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 30 },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`TrustTrace API returned ${response.status}`);
  return (await response.json()) as T;
}

async function withDemoFallback<TPayload, TResult>(
  path: string,
  fallback: TResult,
  select: (payload: TPayload) => TResult,
): Promise<ApiResult<TResult>> {
  if (!apiBaseUrl) return { data: fallback, source: "demo" };
  try {
    return { data: select(await request<TPayload>(path)), source: "api" };
  } catch (error) {
    return {
      data: fallback,
      source: "demo",
      warning: error instanceof Error ? error.message : "The API is temporarily unavailable",
    };
  }
}

function titleFromExternalId(value: string): string {
  const words = value.replace(/^demo-/, "").replace(/-\d+$/, "").replaceAll(/[-_]/g, " ");
  return words.replace(/\b\w/g, (letter) => letter.toUpperCase()) || "Model trace";
}

function traceStatus(passed: boolean, findingCount: number): Trace["status"] {
  if (passed) return "passed";
  return findingCount > 0 ? "flagged" : "failed";
}

function stagesFor(latencyMs: number, blocked: boolean): Trace["stages"] {
  const input = Math.max(12, Math.round(latencyMs * 0.04));
  const output = Math.max(18, Math.round(latencyMs * 0.06));
  const evaluation = Math.max(24, Math.round(latencyMs * 0.1));
  return [
    { label: "Input received", durationMs: 8, status: "complete" },
    { label: "Input guardrail", durationMs: input, status: "complete" },
    { label: "Model generation", durationMs: Math.max(1, latencyMs - input - output - evaluation - 8), status: "complete" },
    { label: "Output guardrail", durationMs: output, status: blocked ? "blocked" : "complete" },
    { label: "Evaluation", durationMs: evaluation, status: "complete" },
  ];
}

function mapFinding(finding: ApiFinding): GuardrailSignal {
  const knownCategories: GuardrailSignal["category"][] = ["prompt_injection", "pii", "secret", "unsafe_output"];
  const category = knownCategories.includes(finding.category as GuardrailSignal["category"])
    ? finding.category as GuardrailSignal["category"]
    : "unsafe_output";
  return {
    id: finding.code,
    category,
    label: finding.message,
    severity: finding.severity,
    confidence: finding.confidence,
    detector: "deterministic_pattern",
    evidence: `${finding.location === "prompt" ? "Input" : "Output"}: ${finding.evidence}`,
    recommendation: category === "prompt_injection"
      ? "Block the request and keep retrieved content isolated from trusted instructions."
      : category === "pii"
        ? "Redact the detected field or require an approved processing purpose."
        : category === "secret"
          ? "Block delivery, rotate exposed credentials, and review the source context."
          : "Route the response to a human reviewer before delivery.",
  };
}

function mapListTrace(item: ApiTraceListItem): Trace {
  return {
    id: item.id,
    name: titleFromExternalId(item.external_id),
    useCase: "API ingestion",
    startedAt: item.created_at,
    provider: item.provider,
    model: item.model,
    environment: item.environment === "staging" || item.environment === "demo" ? item.environment : "production",
    status: traceStatus(item.evaluation_passed, item.finding_count),
    riskLevel: item.risk_level,
    riskScore: item.risk_score,
    latencyMs: item.latency_ms,
    costUsd: item.estimated_cost_usd,
    inputTokens: 0,
    outputTokens: 0,
    evaluationScore: item.evaluation_passed ? 100 : Math.max(0, 100 - item.risk_score),
    input: item.prompt_preview,
    output: item.response_preview,
    signals: [],
    stages: stagesFor(item.latency_ms, !item.evaluation_passed),
  };
}

function mapDetailTrace(item: ApiTraceDetail): Trace {
  const scenario = typeof item.metadata.scenario === "string" ? item.metadata.scenario : null;
  return {
    ...mapListTrace({ ...item, prompt_preview: item.prompt, response_preview: item.response, finding_count: item.findings.length }),
    name: scenario ? `${titleFromExternalId(scenario)} workflow` : titleFromExternalId(item.external_id),
    useCase: scenario ? `${titleFromExternalId(scenario)} operations` : "API ingestion",
    inputTokens: item.input_tokens,
    outputTokens: item.output_tokens,
    input: item.prompt,
    output: item.response,
    signals: item.findings.map(mapFinding),
  };
}

function mapOverview(payload: ApiOverview): OverviewMetrics {
  return {
    passRate: payload.pass_rate,
    safetyFlags: payload.flagged_traces,
    p95LatencyMs: payload.p95_latency_ms,
    estimatedCostUsd: payload.estimated_cost_usd,
    totalTraces: payload.total_traces,
    changes: { passRate: 0, safetyFlags: 0, p95LatencyMs: 0, estimatedCostUsd: 0 },
  };
}

function mapTrend(payload: ApiOverview): TrendPoint[] {
  return payload.trend.map((point) => ({
    label: new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${point.date}T00:00:00Z`)),
    monitored: point.traces,
    blocked: point.flagged,
  }));
}

function mapReviewStatus(status: ApiReview["status"]): ReviewStatus {
  if (status === "pending") return "open";
  if (status === "in_review") return "in_review";
  return "resolved";
}

function mapReview(item: ApiReview): ReviewItem {
  return {
    id: item.id,
    traceId: item.trace_id,
    traceName: titleFromExternalId(item.external_id),
    reason: item.primary_finding?.message ?? `${item.finding_count} deterministic finding${item.finding_count === 1 ? "" : "s"}`,
    priority: item.priority === "critical" ? "urgent" : item.priority === "high" ? "high" : "normal",
    status: mapReviewStatus(item.status),
    createdAt: item.created_at,
    assignee: item.assignee,
    riskScore: item.risk_score,
  };
}

export function getOverview(): Promise<ApiResult<OverviewMetrics>> {
  return withDemoFallback<ApiOverview, OverviewMetrics>("/api/v1/overview", demoOverview, mapOverview);
}

export function getRiskTrend(): Promise<ApiResult<TrendPoint[]>> {
  return withDemoFallback<ApiOverview, TrendPoint[]>("/api/v1/overview", demoTrend, mapTrend);
}

export function getTraces(): Promise<ApiResult<Trace[]>> {
  return withDemoFallback<{ items: ApiTraceListItem[] }, Trace[]>("/api/v1/traces?page_size=100", demoTraces, (payload) => payload.items.map(mapListTrace));
}

export function getTrace(id: string): Promise<ApiResult<Trace | null>> {
  const fallback = demoTraces.find((trace) => trace.id === id) ?? null;
  return withDemoFallback<ApiTraceDetail, Trace | null>(`/api/v1/traces/${encodeURIComponent(id)}`, fallback, mapDetailTrace);
}

export function getReviews(): Promise<ApiResult<ReviewItem[]>> {
  return withDemoFallback<{ items: ApiReview[] }, ReviewItem[]>("/api/v1/reviews?page_size=100", demoReviews, (payload) => payload.items.map(mapReview));
}

export async function getExperiment(): Promise<ApiResult<EvaluationExperiment>> {
  // The comparison endpoint is POST-only. Keep the public view read-only and explicitly demo-labeled.
  return { data: demoExperiment, source: "demo" };
}
