from __future__ import annotations

from pathlib import Path
from typing import Any

from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.models.generation import Generation
from app.models.user import User


BASE_DIR = Path(__file__).resolve().parents[1]
TEMPLATE_DIR = BASE_DIR / "report_templates"
STYLE_DIR = BASE_DIR / "report_styles"
DEFAULT_TEMPLATE = "case_report.html"
ALLOWED_STYLES = {"classic", "minimal"}


env = Environment(
    loader=FileSystemLoader(str(TEMPLATE_DIR)),
    autoescape=select_autoescape(("html", "xml")),
)


def available_styles() -> list[str]:
    return sorted(ALLOWED_STYLES)


def _items(value: Any) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [_stringify(item) for item in value]
    return [_stringify(value)]


def _stringify(value: Any) -> str:
    if isinstance(value, dict):
        parts = [f"{key}: {item}" for key, item in value.items() if item is not None and item != ""]
        return "；".join(parts)
    return str(value)


def _report_context(generation: Generation, user: User, style_key: str) -> dict[str, Any]:
    output = generation.llm_output or {}
    profile = user.lawyer_profile or {}
    sections = [
        {"title": "时间线", "list_items": _items(output.get("timeline"))},
        {"title": "证据清单", "list_items": _items(output.get("evidence"))},
        {"title": "争议焦点", "list_items": _items(output.get("issues"))},
        {"title": "沟通建议", "list_items": _items(output.get("recommendations"))},
    ]
    return {
        "report": {
            "title": output.get("title") or f"{generation.case_type}可视化报告",
            "summary": output.get("summary") or "",
        },
        "sections": sections,
        "case_type": generation.case_type,
        "model_used": generation.model_used or "",
        "credits_cost": generation.credits_cost,
        "lawyer_card": {
            "full_name": profile.get("full_name") or profile.get("name") or "",
            "law_firm": profile.get("law_firm") or profile.get("firm") or "",
        },
        "style_css": (STYLE_DIR / f"{style_key}.css").read_text(encoding="utf-8"),
    }


def render_generation_html(generation: Generation, user: User, style_key: str = "classic") -> str:
    if style_key not in ALLOWED_STYLES:
        raise ValueError(f"Unknown report style: {style_key}")
    template = env.get_template(DEFAULT_TEMPLATE)
    return template.render(**_report_context(generation, user, style_key))
