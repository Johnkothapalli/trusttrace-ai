from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import __version__
from app.database import get_db
from app.schemas import HealthResponse

router = APIRouter(tags=["system"])
DbSession = Annotated[Session, Depends(get_db)]


@router.get("/health", response_model=HealthResponse, summary="Check service readiness")
def health(db: DbSession) -> HealthResponse:
    db.execute(text("SELECT 1"))
    return HealthResponse(
        status="ok",
        database="connected",
        version=__version__,
        evaluation_engine="deterministic-rules-v1",
    )
