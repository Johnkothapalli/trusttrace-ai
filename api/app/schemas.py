from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models import ReviewStatus, RiskLevel


class ApiModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class FindingOut(ApiModel):
    code: str
    category: str
    severity: Literal["low", "medium", "high", "critical"]
    location: Literal["prompt", "response"]
    message: str
    evidence: str
    confidence: float = Field(ge=0, le=1)


class TraceCreate(BaseModel):
    external_id: str = Field(min_length=1, max_length=128)
    provider: str = Field(min_length=1, max_length=64)
    model: str = Field(min_length=1, max_length=128)
    environment: str = Field(default="production", min_length=1, max_length=32)
    prompt: str = Field(min_length=1, max_length=100_000)
    response: str = Field(min_length=1, max_length=100_000)
    input_tokens: int = Field(default=0, ge=0, le=10_000_000)
    output_tokens: int = Field(default=0, ge=0, le=10_000_000)
    latency_ms: int = Field(default=0, ge=0, le=86_400_000)
    estimated_cost_usd: float = Field(default=0, ge=0, le=1_000_000)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("external_id", "provider", "model", "environment")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must contain at least one non-whitespace character")
        return cleaned


class TraceListItem(ApiModel):
    id: str
    external_id: str
    provider: str
    model: str
    environment: str
    prompt_preview: str
    response_preview: str
    latency_ms: int
    estimated_cost_usd: float = Field(description="Estimated provider cost for this trace.")
    risk_score: int
    risk_level: RiskLevel
    evaluation_passed: bool
    finding_count: int
    review_status: ReviewStatus | None
    created_at: datetime


class TraceDetail(ApiModel):
    id: str
    external_id: str
    provider: str
    model: str
    environment: str
    prompt: str
    response: str
    input_tokens: int
    output_tokens: int
    latency_ms: int
    estimated_cost_usd: float = Field(description="Estimated provider cost for this trace.")
    risk_score: int
    risk_level: RiskLevel
    evaluation_passed: bool
    findings: list[FindingOut]
    metadata: dict[str, Any]
    review_status: ReviewStatus | None
    created_at: datetime


class TracePage(ApiModel):
    items: list[TraceListItem]
    page: int
    page_size: int
    total: int
    pages: int


class ReviewListItem(ApiModel):
    id: str
    trace_id: str
    external_id: str
    model: str
    status: ReviewStatus
    priority: RiskLevel
    assignee: str | None
    note: str | None
    risk_score: int
    finding_count: int
    primary_finding: FindingOut | None
    created_at: datetime
    updated_at: datetime


class ReviewPage(ApiModel):
    items: list[ReviewListItem]
    page: int
    page_size: int
    total: int
    pages: int


class ReviewUpdate(BaseModel):
    status: ReviewStatus | None = None
    assignee: str | None = Field(default=None, max_length=128)
    note: str | None = Field(default=None, max_length=2_000)

    @field_validator("assignee", "note")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class RiskBucket(ApiModel):
    level: RiskLevel
    count: int


class ModelMetric(ApiModel):
    model: str
    traces: int
    pass_rate: float
    average_latency_ms: float
    estimated_cost_usd: float


class TrendPoint(ApiModel):
    date: str
    traces: int
    flagged: int
    pass_rate: float


class Overview(ApiModel):
    total_traces: int
    passed_traces: int
    flagged_traces: int
    pending_reviews: int
    pass_rate: float
    average_latency_ms: float
    p95_latency_ms: int
    estimated_cost_usd: float
    risk_distribution: list[RiskBucket]
    model_breakdown: list[ModelMetric]
    trend: list[TrendPoint]
    last_trace_at: datetime | None
    evaluation_engine: Literal["deterministic-rules-v1"] = "deterministic-rules-v1"


class EvaluationCompareRequest(BaseModel):
    left_model: str = Field(min_length=1, max_length=128)
    right_model: str = Field(min_length=1, max_length=128)
    environment: str | None = Field(default=None, max_length=32)


class EvaluationSide(ApiModel):
    model: str
    sample_size: int
    pass_rate: float
    average_risk_score: float
    average_latency_ms: float
    estimated_cost_usd: float = Field(
        description="Average estimated cost per trace in this comparison sample."
    )


class EvaluationDelta(ApiModel):
    pass_rate_points: float
    average_risk_score: float
    average_latency_ms: float
    estimated_cost_usd: float = Field(
        description="Right-minus-left difference in average estimated cost per trace."
    )


class EvaluationCompareResponse(ApiModel):
    left: EvaluationSide
    right: EvaluationSide
    delta_right_minus_left: EvaluationDelta
    note: str = (
        "Comparison uses stored synthetic/demo or user-ingested traces and deterministic rules; "
        "it is not a general model benchmark."
    )


class ScanRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=100_000)
    response: str = Field(min_length=1, max_length=100_000)


class ScanResponse(ApiModel):
    risk_score: int
    risk_level: RiskLevel
    passed: bool
    findings: list[FindingOut]
    engine: Literal["deterministic-rules-v1"]


class AuditEventOut(ApiModel):
    id: str
    actor: str
    action: str
    resource_type: str
    resource_id: str
    details: dict[str, Any]
    created_at: datetime


class AuditPage(ApiModel):
    items: list[AuditEventOut]
    page: int
    page_size: int
    total: int
    pages: int


class HealthResponse(ApiModel):
    status: Literal["ok"]
    database: Literal["connected"]
    version: str
    evaluation_engine: Literal["deterministic-rules-v1"]
