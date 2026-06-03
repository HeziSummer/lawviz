from decimal import Decimal
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import func, or_, select

from app.database import SessionLocal
from app.models.user import User
from app.security import hash_password
from app.services.sms import normalize_phone


def require_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"{name} is required")
    return value


def main() -> None:
    phone = normalize_phone(require_env("ADMIN_PHONE"))
    email = require_env("ADMIN_EMAIL").strip().lower()
    password = require_env("ADMIN_PASSWORD")
    full_name = os.getenv("ADMIN_FULL_NAME", "LawViz Admin").strip()
    law_firm = os.getenv("ADMIN_LAW_FIRM", "LawViz").strip()

    with SessionLocal() as db:
        user = db.scalar(select(User).where(or_(User.phone == phone, func.lower(User.email) == email)))
        if user is None:
            user = User(
                phone=phone,
                email=email,
                password_hash=hash_password(password),
                role="admin",
                status="active",
                is_verified=True,
                credits=Decimal("0"),
                lawyer_profile={"full_name": full_name, "law_firm": law_firm},
            )
            db.add(user)
        else:
            user.email = email
            user.phone = phone
            user.password_hash = hash_password(password)
            user.role = "admin"
            user.status = "active"
            user.is_verified = True
            user.lawyer_profile = {**(user.lawyer_profile or {}), "full_name": full_name, "law_firm": law_firm}

        db.commit()
        db.refresh(user)
        print(f"Admin account ready: {user.email} / {user.phone}")


if __name__ == "__main__":
    main()
