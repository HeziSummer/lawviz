from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.transaction import Transaction
    from app.models.user import User


class Generation(Base):
    __tablename__ = "generations"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    template_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("templates.id"), index=True)
    case_type: Mapped[str] = mapped_column(String(80), nullable=False)
    model_used: Mapped[str | None] = mapped_column(String(100))
    model_switches: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False, default=list)
    use_pkulaw: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    conversation_history: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False, default=list)
    plan_text: Mapped[str | None] = mapped_column(Text)
    llm_output: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    token_usage: Mapped[dict[str, Any]] = mapped_column(JSONB, nullable=False, default=dict)
    api_cost_estimate: Mapped[Decimal] = mapped_column(Numeric(12, 4), nullable=False, default=0)
    credits_cost: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="draft", index=True)
    html_oss_key: Mapped[str | None] = mapped_column(String(500))
    law_refs: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False, default=list)
    share_token: Mapped[str | None] = mapped_column(String(128), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="generations")
    transactions: Mapped[list["Transaction"]] = relationship(back_populates="generation")
