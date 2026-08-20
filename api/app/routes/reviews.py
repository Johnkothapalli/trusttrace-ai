from __future__ import annotations

import math
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies import require_admin_key, require_read_access
from app.models import AuditEvent, Review, ReviewStatus, Trace
from app.schemas import FindingOut, ReviewListItem, ReviewPage, ReviewUpdate

router = APIRouter(prefix="/reviews", tags=["reviews"])
DbSession = Annotated[Session, Depends(get_db)]
SEVERITY_ORDER = {"low": 0, "medium": 1, "high": 2, "critical": 3}


def _review_item(review: Review) -> ReviewListItem:
    findings = review.trace.findings
    primary = (
        max(findings, key=lambda item: SEVERITY_ORDER.get(str(item.get("severity")), -1))
        if findings
        else None
    )
    return ReviewListItem(
        id=review.id,
        trace_id=review.trace_id,
        external_id=review.trace.external_id,
        model=review.trace.model,
        status=review.status,
        priority=review.priority,
        assignee=review.assignee,
        note=review.note,
        risk_score=review.trace.risk_score,
        finding_count=len(findings),
        primary_finding=FindingOut.model_validate(primary) if primary else None,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


@router.get(
    "",
    response_model=ReviewPage,
    summary="List human-review items",
    dependencies=[Depends(require_read_access)],
)
def list_reviews(
    request: Request,
    db: DbSession,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    review_status: ReviewStatus | None = Query(default=None, alias="status"),
) -> ReviewPage:
    filters = [Review.workspace_id == request.app.state.settings.demo_workspace_id]
    if review_status:
        filters.append(Review.status == review_status.value)
    total = db.scalar(select(func.count()).select_from(Review).where(*filters)) or 0
    reviews = db.scalars(
        select(Review)
        .where(*filters)
        .options(joinedload(Review.trace))
        .order_by(Review.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return ReviewPage(
        items=[_review_item(review) for review in reviews],
        page=page,
        page_size=page_size,
        total=total,
        pages=math.ceil(total / page_size) if total else 0,
    )


@router.patch(
    "/{review_id}",
    response_model=ReviewListItem,
    summary="Record a human-review decision",
    dependencies=[Depends(require_admin_key)],
)
def update_review(
    review_id: str,
    payload: ReviewUpdate,
    request: Request,
    db: DbSession,
) -> ReviewListItem:
    workspace_id = request.app.state.settings.demo_workspace_id
    review = db.scalar(
        select(Review)
        .join(Trace)
        .where(Review.id == review_id, Review.workspace_id == workspace_id)
        .options(joinedload(Review.trace))
    )
    if review is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found.")

    supplied = payload.model_fields_set
    changes: dict[str, object] = {}
    if "status" in supplied and payload.status is not None:
        changes["status"] = {"from": review.status, "to": payload.status.value}
        review.status = payload.status.value
    if "assignee" in supplied:
        changes["assignee"] = {"from": review.assignee, "to": payload.assignee}
        review.assignee = payload.assignee
    if "note" in supplied:
        changes["note_updated"] = True
        review.note = payload.note
    if not changes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Provide at least one review field to update.",
        )

    db.add(
        AuditEvent(
            workspace_id=workspace_id,
            actor="workspace-admin",
            action="review.updated",
            resource_type="review",
            resource_id=review.id,
            details=changes,
        )
    )
    db.commit()
    db.refresh(review)
    return _review_item(review)
