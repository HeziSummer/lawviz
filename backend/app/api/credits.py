from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import require_active_user, require_admin
from app.database import get_db
from app.models.transaction import Transaction
from app.models.user import User
from app.services.credits import adjust_credits, grant_credits


router = APIRouter()


class CreditBalanceResponse(BaseModel):
    balance: Decimal
    available_balance: Decimal
    frozen_balance: Decimal = Decimal("0")


class CreditLedgerEntry(BaseModel):
    id: UUID
    user_id: UUID
    amount: Decimal
    balance_after: Decimal | None = None
    type: str
    reason: str | None = None
    created_at: str


class AdminCreditRequest(BaseModel):
    user_id: UUID
    amount: Decimal = Field(gt=Decimal("0"), max_digits=12, decimal_places=2)
    reason: str | None = Field(default=None, max_length=500)
    idempotency_key: str | None = Field(default=None, max_length=128)


def _ledger_entry(transaction: Transaction) -> CreditLedgerEntry:
    metadata = transaction.transaction_metadata or {}
    return CreditLedgerEntry(
        id=transaction.id,
        user_id=transaction.user_id,
        amount=transaction.credits,
        balance_after=metadata.get("balance_after"),
        type=transaction.type,
        reason=transaction.note,
        created_at=transaction.created_at.isoformat(),
    )


@router.get("/credits/balance", response_model=CreditBalanceResponse)
def credit_balance(current_user: User = Depends(require_active_user)) -> CreditBalanceResponse:
    return CreditBalanceResponse(
        balance=current_user.credits,
        available_balance=current_user.credits,
        frozen_balance=Decimal("0"),
    )


@router.get("/credits/ledger", response_model=list[CreditLedgerEntry])
def credit_ledger(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> list[CreditLedgerEntry]:
    entries = db.scalars(
        select(Transaction).where(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc()).limit(100)
    ).all()
    return [_ledger_entry(entry) for entry in entries]


@router.get("/admin/credits/ledger", response_model=list[CreditLedgerEntry])
def admin_credit_ledger(
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> list[CreditLedgerEntry]:
    entries = db.scalars(select(Transaction).order_by(Transaction.created_at.desc()).limit(200)).all()
    return [_ledger_entry(entry) for entry in entries]


@router.post("/admin/credits/grant", response_model=CreditLedgerEntry, status_code=status.HTTP_201_CREATED)
def admin_grant_credits(
    payload: AdminCreditRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> CreditLedgerEntry:
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    transaction = grant_credits(db, user, payload.amount, payload.reason, payload.idempotency_key)
    db.commit()
    db.refresh(transaction)
    return _ledger_entry(transaction)


@router.post("/admin/credits/adjust", response_model=CreditLedgerEntry, status_code=status.HTTP_201_CREATED)
def admin_adjust_credits(
    payload: AdminCreditRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> CreditLedgerEntry:
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    transaction = adjust_credits(db, user, payload.amount, payload.reason)
    db.commit()
    db.refresh(transaction)
    return _ledger_entry(transaction)
