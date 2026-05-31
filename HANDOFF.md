# LawViz Handoff

> Updated: 2026-05-31  
> Repository: `https://github.com/HeziSummer/lawviz.git`  
> Workspace: `D:\lawviz`

## Current State

LawViz is still before runnable product implementation.

Completed:

- GitHub repository connected and pushed.
- Product design v1.2 finalized.
- Sprint plan finalized.
- Long-running development control plan written.
- Sprint 0 documentation completed:
  - open-source recon
  - infrastructure checklist
  - ICP/vendor startup checklist
  - cost dashboard plan
  - cost dashboard SQL draft
- User external action checklist written.
- Enterprise-deferred development boundary written.
- Sprint 1 private MVP foundation plan written.
- First-delivery strategy changed to a real private/internal MVP first; public paid operation is deferred.

Not completed:

- Frontend is not implemented. Most files under `frontend/` are zero-byte placeholders.
- Backend is not implemented. Most files under `backend/app/` and `backend/main.py` are zero-byte placeholders.
- Deploy scripts are not implemented.
- Local PostgreSQL Docker Compose is not implemented.
- No runnable app URL exists yet.

Latest known Git state before handoff:

- Branch: `main`
- Remote tracking: `origin/main`
- Working tree should be clean after this handoff commit.

Recent commits:

- `2574f2c docs: define enterprise-deferred development boundary`
- `5d71493 docs: add user external action checklist`
- `6c0463d docs: prior Sprint 1 planning commit` (superseded by private MVP foundation wording)
- `54fc159 docs: audit M0 status and Sprint 1 readiness`
- `94c8302 docs: add Sprint 0 infrastructure and cost plans`
- `38b4b69 docs: add Sprint 0 open source recon`
- `f626510 docs: add long-running development control plan`

## Source Of Truth

Read these first:

1. `docs/2026-05-31-lawviz-design-v1.2-FINAL.md`
2. `docs/2026-05-31-lawviz-sprint-plan-FINAL.md`
3. `docs/2026-05-31-lawviz-development-control.md`
4. `docs/2026-05-31-enterprise-deferred-development-boundary.md`
5. `docs/2026-05-31-sprint1-private-mvp-foundation-plan.md`
6. `docs/2026-05-31-m0-status-and-sprint1-readiness.md`

Supporting docs:

- `docs/what-to-copy.md`
- `docs/infrastructure-checklist.md`
- `docs/icp-and-vendor-startup.md`
- `docs/2026-05-31-user-external-action-checklist.md`
- `docs/cost-dashboard-plan.md`
- `backend/sql/cost_dashboard.sql`
- `docs/lawviz-design-spec-b.html`
- `docs/scheme-b-dawn.html`

## New Strategic Decision

The user decided that the first delivery should target self-use, trusted friends, and the user's own team.

The first release must be a real private/internal MVP with the product workflow intact. It is not a fake demo, not a picture toy, and not just empty scaffolding.

The user also decided not to run public paid service on a personal server. ICP, production server purchase, public acquisition, and formal paid public operation are deferred until the enterprise setup is ready.

Development should continue toward a complete private/internal product. External integrations should be implemented behind configuration gates and local/private adapters where credentials or formal vendor activation are not yet available. Missing production credentials must not remove the feature from the product design.

Do now:

- Real private/internal product core.
- Login/access gate for friends and team use.
- Case intake, conversational follow-up, plan confirmation, generation, preview, export, and history flows.
- Service adapter interfaces with local/private implementations and fail-closed production switches.
- Database schema.
- UI and generation workflow.
- Export pipeline.
- Docker/deploy packaging.
- Security and verification work.
- Private/internal access control.
- Manual credits or admin-managed usage entitlement.

Do later:

- Public paid operation.
- Production server for public service.
- Enterprise ICP.
- Live Hupijiao.
- Production New API key handoff.
- Production Pkulaw token handoff.
- Production cloud storage credentials handoff.
- Final pricing/refund/compliance docs.

## Immediate Next Step

Start Sprint 1 private MVP foundation.

The user has accepted the strategy that development continues before enterprise infrastructure, with all real product functions preserved for private/internal use. Only ICP, public production deployment, public acquisition, and formal paid operation move later.

Implement according to:

- `docs/2026-05-31-sprint1-private-mvp-foundation-plan.md`
- `docs/2026-05-31-enterprise-deferred-development-boundary.md`

Sprint 1 private MVP foundation acceptance criteria:

- Backend starts with Python 3.11.
- `GET /api/health` returns 200.
- `POST /api/health` returns 200.
- Frontend starts with `npm run dev`.
- Local PostgreSQL 15 starts through Docker Compose.
- Four core tables exist:
  - `users`
  - `generations`
  - `transactions`
  - `templates`
- Five initial templates are seeded:
  - `contract_dispute`
  - `labor_dispute`
  - `divorce_family`
  - `traffic_accident`
  - `criminal_defense`
- `SELECT COUNT(*) FROM templates;` returns 5.
- No real secrets are committed.
- Git status is clean after commit and push.

Private/internal first-delivery priorities after Sprint 1:

- Login-gated access.
- Admin/manual user access control or invite-only registration.
- Manual credits or internal entitlement until live paid checkout is enabled.
- Generate-to-export workflow.
- History and result retrieval.
- Payment, pricing, subscriptions, and public marketing must not be publicly activated, but their data boundaries and future adapters should be designed intentionally.

## Recommended Sprint 1 Work Breakdown

Main agent:

- Own planning, integration, final verification, commits, and push.
- Stop and ask when requirements are unclear.
- Preserve the full private MVP product scope while keeping public paid/production activation disabled.

Backend lane:

- Own `backend/main.py`, `backend/requirements.txt`, `backend/app/**`.
- Add FastAPI app and health router.
- Add config/database foundation.
- Add SQLAlchemy model files for the four core tables.
- Do not invent final legal question frameworks without user confirmation, but do not shrink the intended generation workflow.

Database lane:

- Own `docker-compose.yml`, `backend/sql/schema.sql`, `backend/sql/seed_templates.sql`.
- PostgreSQL 15 local setup.
- Seed the five templates.
- Keep schema aligned with v1.2 data model.

Frontend lane:

- Own `frontend/**`.
- Fill a usable Next.js 14 private MVP foundation.
- Add `tsconfig.json`, `postcss.config.js`, `app/globals.css`.
- Use dynamic routes:
  - `frontend/app/generate/result/[genId]/page.tsx`
  - `frontend/app/share/[token]/page.tsx`
- Remove or replace stale static routes:
  - `frontend/app/generate/result/page.tsx`
  - `frontend/app/share/page.tsx`

Repo hygiene lane:

- Add `.gitignore`.
- Add `.env.example` with placeholder names only.
- Add README startup instructions.

Verification lane:

- Run backend health checks.
- Run frontend startup/compile check.
- Run database seed count check.
- Check secret leakage.
- Confirm clean Git status.

## Stop And Ask Rules

Stop and ask the user before:

- Finalizing legal case-type question frameworks.
- Writing final GPT/Claude marketing/model introduction copy.
- Choosing final prices, packages, refunds, paid credits, or subscription rules.
- Enabling live payment.
- Turning on public registration or paid onboarding.
- Using or requesting real production secrets.
- Enabling public sharing before compliance is ready.
- Changing app name, ICP description, or public compliance wording.
- Deciding Pkulaw commercial usage terms.
- Buying or configuring production server resources.

Do not ask the user to paste secrets into chat.

## Technical Direction

Frontend:

- Next.js 14
- TypeScript
- Tailwind CSS
- App Router
- Visual direction: Scheme B / Dawn style from the docs

Backend:

- Python 3.11
- FastAPI
- SQLAlchemy
- PostgreSQL 15

External services:

- New API gateway: build adapter boundary; fail closed without env vars or use explicit local/private mode.
- Pkulaw MCP: build adapter boundary; fail closed without env vars or use explicit local/private mode.
- Hupijiao: design payment adapter/signature boundary; do not activate live public payment before enterprise setup.
- Cloud storage: build storage interface; production OSS/COS credentials later.

Generated report rendering:

- HTML preview.
- PDF/PNG export via Playwright later.
- Sandbox and sanitization rules must remain part of the design.

## Product Rules To Preserve

- LawViz is for lawyers generating AI-assisted case visualization reports.
- The user flow is conversational, not a static long form.
- Case type is required before first message.
- Agent may ask structured follow-up questions.
- Lawyer confirms the plan before final HTML/PDF/PNG generation.
- PDF and PNG export are primary outputs.
- Share link is secondary and should be login-protected during gray-test.
- Do not invent legal citations.
- Do not describe the product as a legal consultation or legal opinion platform.

## Useful Local Checks

Use PowerShell.

```powershell
cd D:\lawviz
git status --short --branch
```

After Sprint 1 implementation:

```powershell
docker compose up -d postgres
docker exec lawviz-postgres psql -U lawviz -d lawviz -c "SELECT COUNT(*) FROM templates;"
```

Backend:

```powershell
cd D:\lawviz\backend
& "C:\Users\夏季\AppData\Local\Programs\Python\Python311\python.exe" -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Health:

```powershell
Invoke-RestMethod -Method Get http://127.0.0.1:8000/api/health
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/health
```

Frontend:

```powershell
cd D:\lawviz\frontend
npm install
npm run dev
```

## Important Caveat

Several existing markdown files may show mojibake in PowerShell output because of encoding display issues. Treat the latest clean handoff and the named source-of-truth docs as the navigation map, then inspect files carefully before editing.
