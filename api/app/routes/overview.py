from __future__ import annotations

import math
from collections import defaultdict
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_read_access
from app.models import Review, ReviewStatus, RiskLevel, Trace
from app.schemas import ModelMetric, Overview, RiskBucket, TrendPoint

router = APIRouter(tags=["overview"])
DbSession = Annotated[Session, Depends(get_db)]


def _percent(numerator: int, denominator: int) -> float:
    return round((numerator / denominator) * 100, 1) if denominator else 0.0


def _percentile_95(values: list[int]) -> int:
    if not values:
        return 0
    ordered = sorted(values)
    return ordered[max(0, math.ceil(len(ordered) * 0.95) - 1)]


@router.get(
    "/overview",
    response_model=Overview,
    summary="Get dashboard metrics",
    dependencies=[Depends(require_read_access)],
)
def get_overview(request: Request, db: DbSession) -> Overview:
    workspace_id = request.app.state.settings.demo_workspace_id
    traces = list(
        db.scalars(
            select(Trace).where(Trace.workspace_id == workspace_id).order_by(Trace.created_at.asc())
        ).all()
    )
    total = len(traces)
    passed = sum(trace.evaluation_passed for trace in traces)
    pending_reviews = len(
        db.scalars(
            select(Review.id).where(
                Review.workspace_id == workspace_id,
                Review.status.in_([ReviewStatus.pending.value, ReviewStatus.in_review.value]),
            )
        ).all()
    )

    by_model: dict[str, list[Trace]] = defaultdict(list)
    for trace in traces:
        by_model[trace.model].append(trace)
    model_breakdown = []
    for model, model_traces in sorted(by_model.items()):
        model_passed = sum(trace.evaluation_passed for trace in model_traces)
        model_breakdown.append(
            ModelMetric(
                model=model,
                traces=len(model_traces),
                pass_rate=_percent(model_passed, len(model_traces)),
                average_latency_ms=round(
                    sum(trace.latency_ms for trace in model_traces) / len(model_traces), 1
                ),
                estimated_cost_usd=round(
                    sum(trace.estimated_cost_usd for trace in model_traces), 4
                ),
            )
        )

    today = datetime.now(UTC).date()
    trend: list[TrendPoint] = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        day_traces = [trace for trace in traces if trace.created_at.date() == day]
        day_passed = sum(trace.evaluation_passed for trace in day_traces)
        trend.append(
            TrendPoint(
                date=day.isoformat(),
                traces=len(day_traces),
                flagged=len(day_traces) - day_passed,
                pass_rate=_percent(day_passed, len(day_traces)),
            )
        )

    risk_distribution = [
        RiskBucket(level=level, count=sum(trace.risk_level == level.value for trace in traces))
        for level in RiskLevel
    ]
    return Overview(
        total_traces=total,
        passed_traces=passed,
        flagged_traces=total - passed,
        pending_reviews=pending_reviews,
        pass_rate=_percent(passed, total),
        average_latency_ms=round(sum(t.latency_ms for t in traces) / total, 1) if total else 0,
        p95_latency_ms=_percentile_95([trace.latency_ms for trace in traces]),
        estimated_cost_usd=round(sum(t.estimated_cost_usd for t in traces), 4),
        risk_distribution=risk_distribution,
        model_breakdown=model_breakdown,
        trend=trend,
        last_trace_at=traces[-1].created_at if traces else None,
    )
