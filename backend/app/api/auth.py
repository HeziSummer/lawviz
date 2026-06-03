from datetime import UTC, datetime
from decimal import Decimal
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from pydantic import BaseModel, Field
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.security import create_access_token, decode_access_token, hash_password, verify_password
from app.services.sms import consume_sms_code, create_sms_code, normalize_phone


router = APIRouter(prefix="/auth")
security = HTTPBearer(auto_error=False)


class SmsSendRequest(BaseModel):
    phone: str
    purpose: str = Field(default="register", pattern="^(register|login)$")


class SmsSendResponse(BaseModel):
    sent: bool


class RegisterRequest(BaseModel):
    phone: str
    sms_code: str = Field(min_length=4, max_length=8)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=1, max_length=100)
    law_firm: str = Field(min_length=1, max_length=200)


class LoginRequest(BaseModel):
    identifier: str
    password: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    phone: str
    role: str
    status: str
    is_active: bool
    is_verified: bool
    credits: Decimal
    subscription_tier: str
    lawyer_profile: dict
    full_name: str | None = None
    law_firm: str | None = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


def _serialize_user(user: User) -> UserResponse:
    profile = user.lawyer_profile or {}
    return UserResponse(
        id=user.id,
        email=user.email,
        phone=user.phone,
        role=user.role,
        status=user.status,
        is_active=user.status == "active",
        is_verified=user.is_verified,
        credits=user.credits,
        subscription_tier=user.subscription_tier,
        lawyer_profile=profile,
        full_name=profile.get("full_name") or profile.get("name"),
        law_firm=profile.get("law_firm") or profile.get("firm"),
    )


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
    db: Annotated[Session, Depends(get_db)],
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    try:
        payload = decode_access_token(credentials.credentials)
        subject = payload.get("sub")
        if not subject:
            raise InvalidTokenError()
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.") from exc

    user = db.get(User, UUID(str(subject)))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token.")
    return user


def require_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    if current_user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active.")
    return current_user


def require_admin(current_user: Annotated[User, Depends(require_active_user)]) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access is required.")
    return current_user


@router.post("/sms/send", response_model=SmsSendResponse)
def send_sms_code(payload: SmsSendRequest, request: Request, db: Annotated[Session, Depends(get_db)]) -> SmsSendResponse:
    create_sms_code(db, request, payload.phone, payload.purpose)
    return SmsSendResponse(sent=True)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Annotated[Session, Depends(get_db)]) -> UserResponse:
    normalized_phone = consume_sms_code(db, payload.phone, "register", payload.sms_code)
    normalized_email = payload.email.strip().lower()

    existing = db.scalar(
        select(User).where(or_(User.phone == normalized_phone, func.lower(User.email) == normalized_email))
    )
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone or email already registered.")

    user = User(
        phone=normalized_phone,
        email=normalized_email,
        password_hash=hash_password(payload.password),
        status="pending",
        role="lawyer",
        is_verified=True,
        credits=Decimal("0"),
        lawyer_profile={"full_name": payload.full_name.strip(), "law_firm": payload.law_firm.strip()},
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _serialize_user(user)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Annotated[Session, Depends(get_db)]) -> LoginResponse:
    identifier = payload.identifier.strip()
    lookup_phone = None
    if identifier.replace("+", "").replace("-", "").replace(" ", "").isdigit():
        try:
            lookup_phone = normalize_phone(identifier)
        except HTTPException:
            lookup_phone = None
    normalized_email = identifier.lower()

    user = db.scalar(
        select(User).where(or_(User.phone == lookup_phone, func.lower(User.email) == normalized_email))
    )
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials.")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active.")

    user.last_login = datetime.now(UTC)
    db.commit()
    db.refresh(user)
    token = create_access_token(str(user.id), {"role": user.role})
    return LoginResponse(access_token=token, user=_serialize_user(user))


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout() -> Response:
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserResponse)
def me(current_user: Annotated[User, Depends(get_current_user)]) -> UserResponse:
    return _serialize_user(current_user)
