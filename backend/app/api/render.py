from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.api.auth import require_active_user
from app.database import get_db
from app.models.generation import Generation
from app.models.user import User
from app.services.report_renderer import available_styles, render_generation_html


router = APIRouter(prefix="/render")


def _get_owned_generation(db: Session, gen_id: UUID, user: User) -> Generation:
    generation = db.get(Generation, gen_id)
    if not generation or generation.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found.")
    return generation


@router.get("/styles")
def report_styles(_: Annotated[User, Depends(require_active_user)]) -> dict[str, list[str]]:
    return {"styles": available_styles()}


@router.get("/{gen_id}")
def render_generation(
    gen_id: UUID,
    style: str = "classic",
    db: Session = Depends(get_db),
    current_user: User = Depends(require_active_user),
) -> Response:
    generation = _get_owned_generation(db, gen_id, current_user)
    if generation.status != "done":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Generation is not ready to render.")
    try:
        html = render_generation_html(generation, current_user, style)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc)) from exc
    return Response(content=html, media_type="text/html; charset=utf-8")
