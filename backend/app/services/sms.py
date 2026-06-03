from datetime import UTC, datetime, timedelta
import hashlib
import hmac
import secrets
import re

from fastapi import HTTPException, Request, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.sms_verification import SmsVerification


CHINA_PHONE_PATTERN = re.compile(r"^(?:\+?86)?1[3-9]\d{9}$")


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if digits.startswith("86") and len(digits) == 13:
        digits = digits[2:]
    if not CHINA_PHONE_PATTERN.match(digits):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Invalid mainland China phone number.")
    return f"+86{digits}"


def _hash_code(phone: str, purpose: str, code: str) -> str:
    settings = get_settings()
    message = f"{phone}:{purpose}:{code}".encode("utf-8")
    return hmac.new(settings.sms_code_secret.encode("utf-8"), message, hashlib.sha256).hexdigest()


def _client_ip(request: Request) -> str | None:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", 1)[0].strip()
    return request.client.host if request.client else None


def create_sms_code(db: Session, request: Request, phone: str, purpose: str) -> None:
    settings = get_settings()
    normalized_phone = normalize_phone(phone)
    request_ip = _client_ip(request)
    now = datetime.now(UTC)

    if settings.sms_provider == "disabled":
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="SMS provider is not configured.")
    if settings.sms_provider == "console" and settings.environment not in {"local", "development", "test"}:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="SMS provider is not configured.")

    recent = db.scalar(
        select(SmsVerification)
        .where(
            SmsVerification.phone == normalized_phone,
            SmsVerification.purpose == purpose,
            SmsVerification.created_at > now - timedelta(seconds=settings.sms_resend_seconds),
        )
        .order_by(SmsVerification.created_at.desc())
    )
    if recent:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Please wait before requesting another code.")

    hourly_count = db.scalar(
        select(func.count())
        .select_from(SmsVerification)
        .where(
            SmsVerification.phone == normalized_phone,
            SmsVerification.created_at > now - timedelta(hours=1),
        )
    )
    daily_count = db.scalar(
        select(func.count())
        .select_from(SmsVerification)
        .where(
            SmsVerification.phone == normalized_phone,
            SmsVerification.created_at > now - timedelta(days=1),
        )
    )
    if int(hourly_count or 0) >= settings.sms_hourly_limit or int(daily_count or 0) >= settings.sms_daily_limit:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="SMS request limit reached.")

    code = settings.sms_dev_code if settings.sms_provider == "console" and settings.sms_dev_code else f"{secrets.randbelow(1_000_000):06d}"
    verification = SmsVerification(
        phone=normalized_phone,
        purpose=purpose,
        code_hash=_hash_code(normalized_phone, purpose, code),
        request_ip=request_ip,
        expires_at=now + timedelta(minutes=settings.sms_code_ttl_minutes),
    )
    db.add(verification)
    db.commit()

    if settings.sms_provider == "console":
        print(f"[lawviz:sms] {purpose} code for {normalized_phone}: {code}")
        return

    raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="SMS provider adapter is not implemented.")


def consume_sms_code(db: Session, phone: str, purpose: str, code: str) -> str:
    settings = get_settings()
    normalized_phone = normalize_phone(phone)
    now = datetime.now(UTC)
    verification = db.scalar(
        select(SmsVerification)
        .where(
            SmsVerification.phone == normalized_phone,
            SmsVerification.purpose == purpose,
            SmsVerification.consumed_at.is_(None),
            SmsVerification.expires_at >= now,
        )
        .order_by(SmsVerification.created_at.desc())
    )
    if not verification:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired SMS code.")
    if verification.attempts >= settings.sms_max_attempts:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="SMS verification attempts exceeded.")

    verification.attempts += 1
    expected_hash = _hash_code(normalized_phone, purpose, code)
    if not hmac.compare_digest(verification.code_hash, expected_hash):
        db.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired SMS code.")

    verification.consumed_at = now
    db.commit()
    return normalized_phone
