from __future__ import annotations

import math
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.database import get_db
from app.dependencies import require_ingest_key, require_read_access
from app.guardrails import scan_trace
from app.models import AuditEvent, Review, RiskLevel, Trace
from app.schemas import TraceCreate, TraceDetail, TraceListItem, TracePage

router = APIRouter(prefix="/traces", tags=["traces"])
DbSession = Annotated[Session, Depends(get_db)]


def _preview(value: str, length: int = 92) -> str:
    clean = " ".join(value.split())
    return clean if len(clean) <= length else f"{clean[: length - 1]}…"


def _list_item(trace: Trace) -> TraceListItem:
    return TraceListItem(
        id=trace.id,
        external_id=trace.external_id,
        provider=trace.provider,
        model=trace.model,
        environment=trace.environment,
        prompt_preview=_preview(trace.prompt),
        response_preview=_preview(trace.response),
        latency_ms=trace.latency_ms,
        estimated_cost_usd=trace.estimated_cost_usd,
        risk_score=trace.risk_score,
        risk_level=trace.risk_level,
        evaluation_passed=trace.evaluation_passed,
        finding_count=len(trace.findings),
        review_status=trace.review.status if trace.review else None,
        created_at=trace.created_at,
    )


def _detail(trace: Trace) -> TraceDetail:
    return TraceDetail(
        id=trace.id,
        external_id=trace.external_id,
        provider=trace.provider,
        model=trace.model,
        environment=trace.environment,
        prompt=trace.prompt,
        response=trace.response,
        input_tokens=trace.input_tokens,
        output_tokens=trace.output_tokens,
        latency_ms=trace.latency_ms,
        estimated_cost_usd=trace.estimated_cost_usd,
        risk_score=trace.risk_score,
        risk_level=trace.risk_level,
        evaluation_passed=trace.evaluation_passed,
        findings=trace.findings,
        metadata=trace.metadata_json,
        review_status=trace.review.status if trace.review else None,
        created_at=trace.created_at,
    )


@router.get(
    "",
    response_model=TracePage,
    summary="List workspace traces",
    dependencies=[Depends(require_read_access)],
)
def list_traces(
    request: Request,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    risk_level: RiskLevel | None = None,
    model: Annotated[str | None, Query(max_length=128)] = None,
    search: Annotated[str | None, Query(max_length=200)] = None,
) -> TracePage:
    workspace_id = request.app.state.settings.demo_workspace_id
    filters = [Trace.workspace_id == workspace_id]
    if risk_level:
        filters.append(Trace.risk_level == risk_level.value)
    if model:
        filters.append(Trace.model == model)
    if search:
        needle = f"%{search.strip()}%"
        filters.append(
            or_(
                Trace.external_id.ilike(needle),
                Trace.model.ilike(needle),
                Trace.prompt.ilike(needle),
                Trace.response.ilike(needle),
            )
        )

    total = db.scalar(select(func.count()).select_from(Trace).where(*filters)) or 0
    traces = db.scalars(
        select(Trace)
        .where(*filters)
        .options(selectinload(Trace.review))
        .order_by(Trace.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return TracePage(
        items=[_list_item(trace) for trace in traces],
        page=page,
        page_size=page_size,
        total=total,
        pages=math.ceil(total / page_size) if total else 0,
    )


@router.get(
    "/{trace_id}",
    response_model=TraceDetail,
    summary="Get one complete trace",
    dependencies=[Depends(require_read_access)],
)
def get_trace(trace_id: str, request: Request, db: DbSession) -> TraceDetail:
    trace = db.scalar(
        select(Trace)
        .where(
            Trace.id == trace_id,
            Trace.workspace_id == request.app.state.settings.demo_workspace_id,
        )
        .options(selectinload(Trace.review))
    )
    if trace is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trace not found.")
    return _detail(trace)


@router.post(
    "",
    response_model=TraceDetail,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest and evaluate a trace",
    dependencies=[Depends(require_ingest_key)],
)
def create_trace(payload: TraceCreate, request: Request, db: DbSession) -> TraceDetail:
    settings = request.app.state.settings
    result = scan_trace(payload.prompt, payload.response)
    trace = Trace(
        workspace_id=settings.demo_workspace_id,
        external_id=payload.external_id,
        provider=payload.provider,
        model=payload.model,
        environment=payload.environment,
        prompt=payload.prompt,
        response=payload.response,
        input_tokens=payload.input_tokens,
        output_tokens=payload.output_tokens,
        latency_ms=payload.latency_ms,
        estimated_cost_usd=payload.estimated_cost_usd,
        risk_score=result.risk_score,
        risk_level=result.risk_level,
        evaluation_passed=result.passed,
        findings=result.findings_as_dicts(),
        metadata_json=payload.metadata,
    )
    db.add(trace)
    try:
        db.flush()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="external_id already exists in this workspace.",
        ) from error

    if not result.passed:
        review = Review(
            workspace_id=settings.demo_workspace_id,
            trace_id=trace.id,
            priority=result.risk_level,
        )
        db.add(review)
        trace.review = review

    db.add(
        AuditEvent(
            workspace_id=settings.demo_workspace_id,
            actor="api-client",
            action="trace.ingested",
            resource_type="trace",
            resource_id=trace.id,
            details={
                "external_id": trace.external_id,
                "risk_score": result.risk_score,
                "finding_count": len(result.findings),
            },
        )
    )
    db.commit()
    db.refresh(trace)
    return _detail(trace)
