from decimal import Decimal
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.transaction import Transaction
from app.models.user import User


def estimate_generation_credits(model_used: str, use_pkulaw: bool) -> Decimal:
    normalized_model = model_used.lower()
    base = Decimal("2.00") if "claude" in normalized_model else Decimal("1.00")
    pkulaw_cost = Decimal("1.00") if use_pkulaw else Decimal("0.00")
    return base + pkulaw_cost


def grant_credits(
    db: Session,
    user: User,
    amount: Decimal,
    reason: str | None = None,
    idempotency_key: str | None = None,
) -> Transaction:
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Credit amount must be positive.")
    if idempotency_key:
        existing = db.scalar(select(Transaction).where(Transaction.out_trade_no == idempotency_key))
        if existing:
            return existing

    user.credits += amount
    transaction = Transaction(
        user_id=user.id,
        type="grant",
        credits=amount,
        status="succeeded",
        out_trade_no=idempotency_key,
        note=reason,
        transaction_metadata={"balance_after": str(user.credits)},
    )
    db.add(transaction)
    return transaction


def adjust_credits(db: Session, user: User, amount: Decimal, reason: str | None = None) -> Transaction:
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Credit amount must be positive.")
    if user.credits - amount < 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Credit balance cannot become negative.")

    user.credits -= amount
    transaction = Transaction(
        user_id=user.id,
        type="adjust",
        credits=-amount,
        status="succeeded",
        note=reason,
        transaction_metadata={"balance_after": str(user.credits)},
    )
    db.add(transaction)
    return transaction


def deduct_generation_credits(db: Session, user: User, generation_id: UUID, amount: Decimal) -> Transaction:
    if amount <= 0:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Credit cost must be positive.")
    existing = db.scalar(
        select(Transaction).where(
            Transaction.user_id == user.id,
            Transaction.generation_id == generation_id,
            Transaction.type == "deduct",
            Transaction.status == "succeeded",
        )
    )
    if existing:
        return existing
    if user.credits < amount:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Insufficient credits.")

    user.credits -= amount
    transaction = Transaction(
        user_id=user.id,
        generation_id=generation_id,
        type="deduct",
        credits=-amount,
        status="succeeded",
        note="Report generation",
        transaction_metadata={"balance_after": str(user.credits)},
    )
    db.add(transaction)
    return transaction


def refund_generation_credits(db: Session, user: User, generation_id: UUID, amount: Decimal, reason: str) -> Transaction:
    existing = db.scalar(
        select(Transaction).where(
            Transaction.user_id == user.id,
            Transaction.generation_id == generation_id,
            Transaction.type == "refund",
            Transaction.status == "succeeded",
        )
    )
    if existing:
        return existing

    user.credits += amount
    transaction = Transaction(
        user_id=user.id,
        generation_id=generation_id,
        type="refund",
        credits=amount,
        status="succeeded",
        note=reason,
        transaction_metadata={"balance_after": str(user.credits)},
    )
    db.add(transaction)
    return transaction
