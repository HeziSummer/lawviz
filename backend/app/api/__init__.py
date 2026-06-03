from fastapi import APIRouter

from app.api.admin import router as admin_router
from app.api.auth import router as auth_router
from app.api.credits import router as credits_router
from app.api.generate import router as generate_router
from app.api.health import router as health_router
from app.api.render import router as render_router
from app.api.webhooks import router as webhooks_router


api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(auth_router, tags=["auth"])
api_router.include_router(credits_router, tags=["credits"])
api_router.include_router(admin_router, tags=["admin"])
api_router.include_router(generate_router, tags=["generate"])
api_router.include_router(render_router, tags=["render"])
api_router.include_router(webhooks_router, tags=["webhooks"])
