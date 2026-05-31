from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter

from app.config import get_settings


router = APIRouter()


def health_payload() -> dict[str, Any]:
    settings = get_settings()
    return {
        "status": "ok",
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/health")
def get_health() -> dict[str, Any]:
    return health_payload()


@router.post("/health")
def post_health() -> dict[str, Any]:
    return health_payload()
