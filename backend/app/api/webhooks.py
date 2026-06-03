from hashlib import md5
from typing import Annotated
from urllib.parse import parse_qsl

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db


router = APIRouter(prefix="/webhooks")


def _verify_hupijiao_signature(payload: dict[str, str], secret: str) -> bool:
    provided = payload.get("sign", "")
    unsigned = {key: value for key, value in payload.items() if key != "sign" and value not in {None, ""}}
    raw = "&".join(f"{key}={unsigned[key]}" for key in sorted(unsigned))
    expected = md5(f"{raw}{secret}".encode("utf-8")).hexdigest()
    return provided.lower() == expected.lower()


@router.post("/hupijiao")
async def hupijiao_notify(
    request: Request,
    db: Annotated[Session, Depends(get_db)],
) -> dict[str, str]:
    settings = get_settings()
    if not settings.enable_live_payment:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Live payment is disabled.")
    if not settings.hupijiao_secret:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Payment secret is not configured.")

    body = (await request.body()).decode("utf-8")
    payload = {key: value for key, value in parse_qsl(body, keep_blank_values=True)}
    if not _verify_hupijiao_signature(payload, settings.hupijiao_secret):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid payment signature.")

    # Live crediting stays disabled until the payment product is explicitly approved.
    db.rollback()
    return {"status": "ignored"}
