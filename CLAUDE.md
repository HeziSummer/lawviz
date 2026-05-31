# Project Instructions

## Project
LawViz is an AI-assisted legal case visualization product for lawyers. It generates case presentation reports through a conversational workflow, then exports HTML, PDF, and PNG.

## Source Of Truth
- Primary spec: `docs/2026-05-31-lawviz-design-v1.2-FINAL.md`
- Sprint plan: `docs/2026-05-31-lawviz-sprint-plan-FINAL.md`
- Long-running development control plan: `docs/2026-05-31-lawviz-development-control.md`
- Handoff notes: `HANDOFF.md`
- Web UI visual references: `docs/lawviz-design-spec-b.html` and `docs/scheme-b-dawn.html`

Do not revive older design decisions when they conflict with v1.2.

## Current State
- The repo is a scaffold: most frontend/backend source files are placeholders.
- Sprint 0 is next: GitHub recon, infrastructure checklist, ICP start, and cost analytics SQL prototype.
- The first planned code milestone is Sprint 1: runnable local frontend, backend, PostgreSQL schema, seeded templates, and `/api/health`.

## Tech Stack
- Frontend: Next.js 14, TypeScript, Tailwind CSS.
- Backend: Python 3.11, FastAPI.
- Database: PostgreSQL 15.
- Storage: private Aliyun OSS with authenticated proxy access.
- PDF/PNG export: Playwright headless browser rendering.
- Deployment target: Aliyun ECS 2C4G, Nginx reverse proxy, PM2.

## Product Flow
1. User selects a case type and sends the initial description together.
2. Agent asks structured follow-up questions for at most 5 rounds.
3. User may switch model between GPT and Claude during conversation; preserve full context.
4. Agent produces plain text plan.
5. Lawyer confirms the plan.
6. System generates validated JSON, fills Jinja2 HTML, then renders PDF and PNG.

## Core Constraints
- PDF and PNG downloads are primary output actions; sharing is secondary.
- There is no case-type permission gate. All subscription tiers can use all case types; credits drive usage.
- Share pages require login during gray testing.
- Prices in docs are gray-test placeholders, not final pricing.
- ICP filing starts in Sprint 0 and should not block local development.

## Security
- OSS must be private-read only.
- Rendered HTML is served through `GET /api/render/{gen_id}` with permission checks.
- Use sandboxed iframe isolation for generated HTML.
- Sanitize user input before storage and sanitize edited HTML before saving.
- Only editable text nodes should support inline editing in generated reports.

## Data Model
Use the four core tables from the v1.2 spec:
- `users`
- `generations`
- `transactions`
- `templates`

Track token usage, model used, model switches, API cost estimate, credit cost, status, OSS key, share token, and law references on generations.

## Initial Case Types
- `contract_dispute`
- `labor_dispute`
- `divorce_family`
- `traffic_accident`
- `criminal_defense`

## API Surface
Implement the API list from spec section 9. Important endpoints include:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/subscriptions/plans`
- `POST /api/subscriptions/subscribe`
- `POST /api/webhooks/hupijiao`
- `POST /api/generate/start`
- `POST /api/generate/{gen_id}/message`
- `POST /api/generate/{gen_id}/confirm`
- `GET /api/generate/{gen_id}/status`
- `GET /api/generate/{gen_id}/export?format=pdf|png`
- `PATCH /api/generate/{gen_id}/html`
- `GET /api/render/{gen_id}`
- `GET /api/share/{share_token}`

## Visual Direction
- Use the Dawn/Scheme B direction from the docs.
- Base palette uses warm near-white surfaces, dark cool foreground, purple accent, and coral action highlight.
- UI should feel calm, precise, and professional for legal work.
- Generated report HTML is separate from the web app UI design.

## Git
- Main branch: `main`
- Remote: `https://github.com/HeziSummer/lawviz.git`
- Use concise conventional-style commits, for example `chore: add project instructions`.
