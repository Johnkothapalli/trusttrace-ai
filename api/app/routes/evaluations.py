from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_ingest_key, require_read_access
from app.guardrails import ScanResult, scan_trace
from app.models import Trace
from app.schemas import (
    EvaluationCompareRequest,
    EvaluationCompareResponse,
    EvaluationDelta,
    EvaluationSide,
    ScanRequest,
    ScanResponse,
)

router = APIRouter(prefix="/evaluations", tags=["evaluations"])
DbSession = Annotated[Session, Depends(get_db)]


def _side(model: str, traces: list[Trace]) -> EvaluationSide:
    sample_size = len(traces)
    passed = sum(trace.evaluation_passed for trace in traces)
    return EvaluationSide(
        model=model,
        sample_size=sample_size,
        pass_rate=round((passed / sample_size) * 100, 1),
        average_risk_score=round(sum(t.risk_score for t in traces) / sample_size, 1),
        average_latency_ms=round(sum(t.latency_ms for t in traces) / sample_size, 1),
        estimated_cost_usd=round(
            sum(t.estimated_cost_usd for t in traces) / sample_size,
            6,
        ),
    )


def _scan_response(result: ScanResult) -> ScanResponse:
    return ScanResponse(
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        passed=result.passed,
        findings=result.findings_as_dicts(),
        engine=result.engine,
    )


@router.post(
    "/compare",
    response_model=EvaluationCompareResponse,
    summary="Compare two models using stored traces",
    dependencies=[Depends(require_read_access)],
)
def compare_models(
    payload: EvaluationCompareRequest,
    request: Request,
    db: DbSession,
) -> EvaluationCompareResponse:
    workspace_id = request.app.state.settings.demo_workspace_id
    models = [payload.left_model, payload.right_model]
    filters = [Trace.workspace_id == workspace_id, Trace.model.in_(models)]
    if payload.environment:
        filters.append(Trace.environment == payload.environment)
    traces = list(db.scalars(select(Trace).where(*filters)).all())
    grouped = {model: [trace for trace in traces if trace.model == model] for model in models}
    missing = [model for model, values in grouped.items() if not values]
    if missing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No traces found for: {', '.join(missing)}.",
        )

    left = _side(payload.left_model, grouped[payload.left_model])
    right = _side(payload.right_model, grouped[payload.right_model])
    return EvaluationCompareResponse(
        left=left,
        right=right,
        delta_right_minus_left=EvaluationDelta(
            pass_rate_points=round(right.pass_rate - left.pass_rate, 1),
            average_risk_score=round(right.average_risk_score - left.average_risk_score, 1),
            average_latency_ms=round(right.average_latency_ms - left.average_latency_ms, 1),
            estimated_cost_usd=round(right.estimated_cost_usd - left.estimated_cost_usd, 4),
        ),
    )


@router.post(
    "/scan",
    response_model=ScanResponse,
    summary="Preview deterministic guardrail results without persisting",
    dependencies=[Depends(require_ingest_key)],
)
def scan(payload: ScanRequest) -> ScanResponse:
    return _scan_response(scan_trace(payload.prompt, payload.response))
