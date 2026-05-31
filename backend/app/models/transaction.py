from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from app.models.generation import Generation
    from app.models.user import User


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid(), index=True)
    user_id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    generation_id: Mapped[UUID | None] = mapped_column(PG_UUID(as_uuid=True), ForeignKey("generations.id"), index=True)
    type: Mapped[str] = mapped_column(String(30), nullable=False, index=True)
    credits: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    amount_yuan: Mapped[Decimal | None] = mapped_column(Numeric(12, 2))
    subscription_tier: Mapped[str | None] = mapped_column(String(50))
    subscription_months: Mapped[int | None] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending", index=True)
    provider: Mapped[str | None] = mapped_column(String(50))
    provider_order_id: Mapped[str | None] = mapped_column(String(128), index=True)
    out_trade_no: Mapped[str | None] = mapped_column(String(128), unique=True, index=True)
    transaction_metadata: Mapped[dict[str, Any]] = mapped_column("metadata", JSONB, nullable=False, default=dict)
    note: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    paid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="transactions")
    generation: Mapped["Generation | None"] = relationship(back_populates="transactions")
