from __future__ import annotations

import math
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_read_access
from app.models import AuditEvent
from app.schemas import AuditEventOut, AuditPage

router = APIRouter(prefix="/audit-events", tags=["audit"])
DbSession = Annotated[Session, Depends(get_db)]


@router.get(
    "",
    response_model=AuditPage,
    summary="List immutable audit events",
    dependencies=[Depends(require_read_access)],
)
def list_audit_events(
    request: Request,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
) -> AuditPage:
    workspace_id = request.app.state.settings.demo_workspace_id
    total = (
        db.scalar(
            select(func.count())
            .select_from(AuditEvent)
            .where(AuditEvent.workspace_id == workspace_id)
        )
        or 0
    )
    events = db.scalars(
        select(AuditEvent)
        .where(AuditEvent.workspace_id == workspace_id)
        .order_by(AuditEvent.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return AuditPage(
        items=[AuditEventOut.model_validate(event) for event in events],
        page=page,
        page_size=page_size,
        total=total,
        pages=math.ceil(total / page_size) if total else 0,
    )
