from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import (
    JSON,
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utc_now() -> datetime:
    return datetime.now(UTC)


def new_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:20]}"


class RiskLevel(StrEnum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class ReviewStatus(StrEnum):
    pending = "pending"
    in_review = "in_review"
    resolved = "resolved"
    dismissed = "dismissed"


class Trace(Base):
    __tablename__ = "traces"
    __table_args__ = (
        UniqueConstraint("workspace_id", "external_id", name="uq_trace_workspace_external"),
        Index("ix_trace_workspace_created", "workspace_id", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: new_id("tr"))
    workspace_id: Mapped[str] = mapped_column(String(64), index=True)
    external_id: Mapped[str] = mapped_column(String(128))
    provider: Mapped[str] = mapped_column(String(64))
    model: Mapped[str] = mapped_column(String(128), index=True)
    environment: Mapped[str] = mapped_column(String(32), default="production")
    prompt: Mapped[str] = mapped_column(Text)
    response: Mapped[str] = mapped_column(Text)
    input_tokens: Mapped[int] = mapped_column(Integer, default=0)
    output_tokens: Mapped[int] = mapped_column(Integer, default=0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    estimated_cost_usd: Mapped[float] = mapped_column(Float, default=0.0)
    risk_score: Mapped[int] = mapped_column(Integer, default=0, index=True)
    risk_level: Mapped[str] = mapped_column(String(16), default=RiskLevel.low.value, index=True)
    evaluation_passed: Mapped[bool] = mapped_column(Boolean, default=True, index=True)
    findings: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, index=True
    )

    review: Mapped[Review | None] = relationship(
        back_populates="trace", cascade="all, delete-orphan", uselist=False
    )


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: new_id("rv"))
    workspace_id: Mapped[str] = mapped_column(String(64), index=True)
    trace_id: Mapped[str] = mapped_column(
        ForeignKey("traces.id", ondelete="CASCADE"), unique=True, index=True
    )
    status: Mapped[str] = mapped_column(String(20), default=ReviewStatus.pending.value, index=True)
    priority: Mapped[str] = mapped_column(String(16), default=RiskLevel.medium.value)
    assignee: Mapped[str | None] = mapped_column(String(128), nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now
    )

    trace: Mapped[Trace] = relationship(back_populates="review")


class AuditEvent(Base):
    __tablename__ = "audit_events"
    __table_args__ = (Index("ix_audit_workspace_created", "workspace_id", "created_at"),)

    id: Mapped[str] = mapped_column(String(32), primary_key=True, default=lambda: new_id("au"))
    workspace_id: Mapped[str] = mapped_column(String(64), index=True)
    actor: Mapped[str] = mapped_column(String(128))
    action: Mapped[str] = mapped_column(String(64), index=True)
    resource_type: Mapped[str] = mapped_column(String(32))
    resource_id: Mapped[str] = mapped_column(String(64))
    details: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
