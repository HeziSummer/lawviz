from datetime import UTC, datetime
from decimal import Decimal
import json
from typing import Annotated, Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.auth import require_active_user
from app.database import get_db
from app.models.generation import Generation
from app.models.user import User
from app.services.credits import deduct_generation_credits, estimate_generation_credits, refund_generation_credits
from app.services.llm import LLMError, generate_report_json


router = APIRouter(prefix="/generate")


class GenerationStartRequest(BaseModel):
    case_type: str = Field(min_length=1, max_length=80)
    initial_message: str = Field(min_length=1, max_length=5000)
    model_used: str = Field(default="gpt", max_length=100)
    use_pkulaw: bool = False


class GenerationMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=5000)


class GenerationResponse(BaseModel):
    id: UUID
    status: str
    case_type: str
    model_used: str | None
    use_pkulaw: bool
    plan_text: str | None
    credits_cost: Decimal
    html_oss_key: str | None
    share_token: str | None
    llm_output: dict[str, Any] | None = None
    error: str | None = None


class GenerationMessageResponse(BaseModel):
    generation: GenerationResponse
    questions: list[str]


def _serialize_generation(generation: Generation, error: str | None = None) -> GenerationResponse:
    return GenerationResponse(
        id=generation.id,
        status=generation.status,
        case_type=generation.case_type,
        model_used=generation.model_used,
        use_pkulaw=generation.use_pkulaw,
        plan_text=generation.plan_text,
        credits_cost=generation.credits_cost,
        html_oss_key=generation.html_oss_key,
        share_token=generation.share_token,
        llm_output=generation.llm_output,
        error=error,
    )


def _get_owned_generation(db: Session, gen_id: UUID, user: User) -> Generation:
    generation = db.get(Generation, gen_id)
    if not generation or generation.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Generation not found.")
    return generation


def _draft_plan(case_type: str, message: str, model_used: str, use_pkulaw: bool, credits_cost: Decimal) -> str:
    pkulaw_line = "将引用法宝检索结果作为辅助材料。" if use_pkulaw else "暂不启用法宝检索。"
    return (
        f"案件类型：{case_type}\n"
        f"模型：{model_used}\n"
        f"预计消耗：{credits_cost} credits\n"
        f"{pkulaw_line}\n\n"
        "拟生成报告结构：\n"
        "1. 案件事实摘要\n"
        "2. 时间线与关键节点\n"
        "3. 证据清单与证明目的\n"
        "4. 争议焦点与风险提示\n"
        "5. 律师沟通建议\n\n"
        f"初始案情：{message}"
    )


@router.post("/start", response_model=GenerationResponse, status_code=status.HTTP_201_CREATED)
def start_generation(
    payload: GenerationStartRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> GenerationResponse:
    credits_cost = estimate_generation_credits(payload.model_used, payload.use_pkulaw)
    generation = Generation(
        user_id=current_user.id,
        case_type=payload.case_type,
        model_used=payload.model_used,
        use_pkulaw=payload.use_pkulaw,
        status="plan",
        conversation_history=[{"role": "user", "content": payload.initial_message}],
        model_switches=[{"model": payload.model_used, "at": datetime.now(UTC).isoformat()}],
        credits_cost=credits_cost,
        plan_text=_draft_plan(payload.case_type, payload.initial_message, payload.model_used, payload.use_pkulaw, credits_cost),
        token_usage={},
        api_cost_estimate=Decimal("0"),
    )
    db.add(generation)
    db.commit()
    db.refresh(generation)
    return _serialize_generation(generation)


@router.post("/{gen_id}/message", response_model=GenerationMessageResponse)
def add_generation_message(
    gen_id: UUID,
    payload: GenerationMessageRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> GenerationMessageResponse:
    generation = _get_owned_generation(db, gen_id, current_user)
    if generation.status not in {"draft", "qa", "plan"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Generation is no longer editable.")

    history: list[dict[str, Any]] = list(generation.conversation_history or [])
    history.append({"role": "user", "content": payload.message})
    history.append({"role": "assistant", "content": "已更新方案，请确认后生成报告。"})
    generation.conversation_history = history
    generation.status = "plan"
    generation.plan_text = _draft_plan(
        generation.case_type,
        "\n".join(item["content"] for item in history if item.get("role") == "user"),
        generation.model_used or "gpt",
        generation.use_pkulaw,
        generation.credits_cost,
    )
    generation.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(generation)
    return GenerationMessageResponse(
        generation=_serialize_generation(generation),
        questions=["争议金额或核心诉求是什么？", "目前有哪些证据材料？", "是否需要补充关键时间节点？"],
    )


@router.post("/{gen_id}/confirm", response_model=GenerationResponse)
def confirm_generation(
    gen_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> GenerationResponse:
    generation = _get_owned_generation(db, gen_id, current_user)
    if generation.status == "done":
        return _serialize_generation(generation)
    if generation.status not in {"plan", "confirmed", "failed"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Generation must have a confirmed plan first.")

    generation.status = "generating"
    db.flush()
    try:
        deduct_generation_credits(db, current_user, generation.id, generation.credits_cost)
        llm_output = generate_report_json(generation.case_type, generation.plan_text or "", generation.model_used or "gpt")
        usage = llm_output.pop("_usage", {})
        generation.status = "done"
        generation.completed_at = datetime.now(UTC)
        generation.updated_at = generation.completed_at
        generation.llm_output = llm_output
        generation.token_usage = usage
        generation.html_oss_key = f"local/generated/{generation.id}.html"
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except (LLMError, ValueError, KeyError, json.JSONDecodeError) as exc:
        db.rollback()
        generation = _get_owned_generation(db, gen_id, current_user)
        generation.status = "failed"
        if generation.credits_cost > 0:
            refund_generation_credits(db, current_user, generation.id, generation.credits_cost, "Generation failed")
        db.commit()
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc
    db.refresh(generation)
    return _serialize_generation(generation)


@router.get("/{gen_id}/status", response_model=GenerationResponse)
def generation_status(
    gen_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> GenerationResponse:
    return _serialize_generation(_get_owned_generation(db, gen_id, current_user))


@router.get("/history", response_model=list[GenerationResponse])
def generation_history(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> list[GenerationResponse]:
    generations = db.scalars(
        select(Generation).where(Generation.user_id == current_user.id).order_by(Generation.created_at.desc()).limit(50)
    ).all()
    return [_serialize_generation(generation) for generation in generations]


@router.get("/{gen_id}/export")
def export_generation(
    gen_id: UUID,
    format: str,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(require_active_user)],
) -> Response:
    generation = _get_owned_generation(db, gen_id, current_user)
    if generation.status != "done":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Generation is not ready for export.")
    if format not in {"pdf", "png", "html"}:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unsupported export format.")
    return Response(
        content=f"LawViz export placeholder for {generation.id} ({format})",
        media_type="text/plain; charset=utf-8",
    )
