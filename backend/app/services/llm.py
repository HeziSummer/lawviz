from __future__ import annotations

import json
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.config import get_settings


class LLMError(RuntimeError):
    pass


def _chat_endpoint(base_url: str) -> str:
    clean = base_url.rstrip("/")
    if clean.endswith("/v1") or clean.endswith("/codex/v1"):
        return f"{clean}/chat/completions"
    return f"{clean}/v1/chat/completions"


def _provider_for_model(model_used: str) -> tuple[str | None, str | None, str]:
    settings = get_settings()
    if "claude" in model_used.lower():
        return (
            settings.new_api_claude_base_url or settings.new_api_base_url,
            settings.new_api_claude_key or settings.new_api_key,
            settings.new_api_claude_model,
        )
    return settings.new_api_base_url, settings.new_api_key, model_used or settings.new_api_default_model


def chat_completion(
    model_used: str,
    messages: list[dict[str, str]],
    response_format: dict[str, Any] | None = None,
    max_tokens: int = 1200,
) -> dict[str, Any]:
    settings = get_settings()
    base_url, api_key, model = _provider_for_model(model_used)
    if not base_url or not api_key:
        raise LLMError("NewAPI is not configured.")

    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
        "max_tokens": max_tokens,
    }
    if response_format:
        payload["response_format"] = response_format

    request = Request(
        _chat_endpoint(base_url),
        data=json.dumps(payload).encode("utf-8"),
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urlopen(request, timeout=settings.new_api_timeout_seconds) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise LLMError(f"NewAPI request failed ({exc.code}): {body[:500]}") from exc
    except (URLError, TimeoutError) as exc:
        raise LLMError(f"NewAPI request failed: {exc}") from exc


def generate_report_json(case_type: str, plan_text: str, model_used: str) -> dict[str, Any]:
    system_prompt = "你是 LawViz 的法律可视化报告生成助手。只输出紧凑 JSON，不要输出 markdown。"
    user_prompt = (
        f"案件类型：{case_type}\n\n"
        f"方案：\n{plan_text}\n\n"
        "请生成中文报告结构。字段必须为 title、summary、timeline、evidence、issues、recommendations。每个字段内容简短。"
    )
    data = chat_completion(
        model_used,
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        response_format={"type": "json_object"},
        max_tokens=600,
    )
    content = data["choices"][0]["message"]["content"]
    parsed = json.loads(content)
    parsed["_usage"] = data.get("usage", {})
    return parsed
