from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import UserResponse, _serialize_user, require_admin
from app.database import get_db
from app.models.user import User


router = APIRouter(prefix="/admin")


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> list[UserResponse]:
    users = db.scalars(select(User).order_by(User.created_at.desc()).limit(200)).all()
    return [_serialize_user(user) for user in users]


@router.post("/users/{user_id}/activate", response_model=UserResponse)
def activate_user(
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_admin)],
) -> UserResponse:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.status = "active"
    db.commit()
    db.refresh(user)
    return _serialize_user(user)


@router.post("/users/{user_id}/disable", response_model=UserResponse)
def disable_user(
    user_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_admin: Annotated[User, Depends(require_admin)],
) -> UserResponse:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if user.id == current_admin.id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admins cannot disable their own account.")
    user.status = "disabled"
    db.commit()
    db.refresh(user)
    return _serialize_user(user)
