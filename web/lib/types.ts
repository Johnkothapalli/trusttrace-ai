export type DataSource = "api" | "demo";
export type RiskLevel = "critical" | "high" | "medium" | "low";
export type TraceStatus = "passed" | "flagged" | "failed";
export type ReviewStatus = "open" | "in_review" | "resolved";
export type Severity = "critical" | "high" | "medium" | "low";

export interface GuardrailSignal {
  id: string;
  category: "prompt_injection" | "pii" | "secret" | "unsafe_output";
  label: string;
  severity: Severity;
  confidence: number;
  detector: "deterministic_pattern";
  evidence: string;
  recommendation: string;
}

export interface TraceStage {
  label: string;
  durationMs: number;
  status: "complete" | "blocked";
}

export interface Trace {
  id: string;
  name: string;
  useCase: string;
  startedAt: string;
  provider: string;
  model: string;
  environment: "production" | "staging" | "demo";
  status: TraceStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  latencyMs: number;
  costUsd: number;
  inputTokens: number;
  outputTokens: number;
  evaluationScore: number;
  input: string;
  output: string;
  signals: GuardrailSignal[];
  stages: TraceStage[];
}

export interface ReviewItem {
  id: string;
  traceId: string;
  traceName: string;
  reason: string;
  priority: "urgent" | "high" | "normal";
  status: ReviewStatus;
  createdAt: string;
  assignee: string | null;
  riskScore: number;
}

export interface TrendPoint {
  label: string;
  blocked: number;
  monitored: number;
}

export interface OverviewMetrics {
  passRate: number;
  safetyFlags: number;
  p95LatencyMs: number;
  estimatedCostUsd: number;
  totalTraces: number;
  changes: {
    passRate: number;
    safetyFlags: number;
    p95LatencyMs: number;
    estimatedCostUsd: number;
  };
}

export interface EvaluationVariant {
  id: string;
  name: string;
  model: string;
  promptVersion: string;
  quality: number;
  safety: number;
  p95LatencyMs: number;
  avgCostUsd: number;
  sampleSize: number;
}

export interface EvaluationExperiment {
  id: string;
  name: string;
  description: string;
  status: "complete" | "running";
  updatedAt: string;
  winnerId: string;
  variants: EvaluationVariant[];
}

export interface ApiResult<T> {
  data: T;
  source: DataSource;
  warning?: string;
}
