# LawViz Sprint 1 Private MVP Foundation Plan

> Date: 2026-05-31  
> Status: approved for private/internal MVP foundation development.  
> Boundary: build real product foundations now; defer ICP, public production deployment, public acquisition, and formal paid operation.

## Purpose

This plan defines the Sprint 1 foundation for a real private/internal MVP that can be used by the owner, trusted friends, and the team before public commercial infrastructure is ready.

Sprint 1 is not a fake demo and not a throwaway visual prototype. It establishes the running app, database, route structure, and product contracts needed for the complete LawViz workflow.

It does **not** cover:

- Aliyun production deployment.
- Public production OSS credentials.
- Live Hupijiao public checkout credentials.
- Production New API key handoff.
- Production Pkulaw MCP access handoff.
- Legal case-type question framework finalization.
- ICP, public acquisition, or formal public paid launch.

## Sprint 1 Acceptance Criteria

Sprint 1 private MVP foundation is complete when:

- Backend starts with Python 3.11.
- `GET /api/health` and `POST /api/health` return 200.
- Frontend starts with `npm run dev`.
- Local PostgreSQL 15 starts through Docker Compose.
- Four core tables exist: `users`, `generations`, `transactions`, `templates`.
- Five initial templates are seeded:
  - `contract_dispute`
  - `labor_dispute`
  - `divorce_family`
  - `traffic_accident`
  - `criminal_defense`
- `SELECT COUNT(*) FROM templates;` returns 5.
- No real secrets are committed.
- Git status is clean after commit and push.

## Implementation Lanes

| Lane | Owner | Write Surface | Can Run In Parallel | Acceptance |
|---|---|---|---|---|
| Repo hygiene | main agent or worker | `.gitignore`, `.env.example`, `README.md` | Yes | Secret-safe ignore rules and placeholder env documented |
| Local database | worker | `docker-compose.yml`, `backend/sql/schema.sql`, `backend/sql/seed_templates.sql` | Yes, after table contract is fixed | Postgres starts; 5 templates seeded |
| Backend foundation | worker | `backend/main.py`, `backend/requirements.txt`, `backend/app/**` | Yes, after DB names fixed | FastAPI app starts; health endpoint passes |
| Frontend foundation | worker | `frontend/**` | Yes | Next.js app starts; routes compile |
| Verification | main agent | commands only; docs updates | After lanes land | Health, DB, frontend checks pass |

## Sub-Agent Strategy

Use subagents only with disjoint write scopes:

1. **Backend worker**
   - Owns `backend/main.py`, `backend/requirements.txt`, `backend/app/**`.
   - Must not edit frontend.
   - Builds the backend foundation without inventing final legal question frameworks.
   - Must preserve the future real workflow contracts instead of reducing the backend to a fake health-only app.

2. **Database worker**
   - Owns `docker-compose.yml`, `backend/sql/schema.sql`, `backend/sql/seed_templates.sql`.
   - Must keep schema aligned with v1.2 data model.
   - Must not edit Python model files unless explicitly assigned.

3. **Frontend worker**
   - Owns `frontend/package.json`, `next.config.js`, `tailwind.config.js`, `postcss.config.js`, `tsconfig.json`, `app/**`, `lib/**`.
   - Must create usable private MVP route foundations, not marketing-only pages or empty placeholders.
   - Must fix dynamic route shape:
     - `frontend/app/generate/result/[genId]/page.tsx`
     - `frontend/app/share/[token]/page.tsx`

4. **Reviewer / verifier**
   - Runs after implementation lanes.
   - Checks compile/startup, secret leakage, route shape, schema and seed count.

## Backend File Plan

Add or fill:

- `backend/requirements.txt`
- `backend/main.py`
- `backend/app/__init__.py`
- `backend/app/api/__init__.py`
- `backend/app/api/health.py`
- `backend/app/config.py`
- `backend/app/database.py`
- `backend/app/models/__init__.py`
- `backend/app/models/user.py`
- `backend/app/models/generation.py`
- `backend/app/models/transaction.py`
- `backend/app/models/template.py`
- `backend/app/schemas/__init__.py`

Minimal dependencies:

```text
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
pydantic-settings
python-dotenv
```

Backend rules:

- Use Python 3.11 explicitly.
- Do not use real secrets.
- Add both GET and POST health routes to avoid plan inconsistency.
- Keep database setup simple SQLAlchemy, no Alembic yet unless explicitly approved.
- Keep API/module boundaries compatible with the full private MVP workflow: auth, generation, render/export, share, credits, and service adapters.

## Database File Plan

Add:

- `docker-compose.yml`
- `backend/sql/schema.sql`
- `backend/sql/seed_templates.sql`

Local database defaults:

```text
POSTGRES_DB=lawviz
POSTGRES_USER=lawviz
POSTGRES_PASSWORD=lawviz_dev_password
```

The password is local/private development only and must be marked non-production.

Schema must include:

- `users.lawyer_profile JSONB`
- `generations.conversation_history JSONB`
- `generations.model_switches JSONB`
- `generations.llm_output JSONB`
- `generations.token_usage JSONB`
- `generations.api_cost_estimate DECIMAL`
- `generations.law_refs JSONB`
- `generations.share_token`
- `templates.fields_schema JSONB`
- `templates.llm_output_schema JSONB`

## Frontend File Plan

Add or fill:

- `frontend/package.json`
- `frontend/next.config.js`
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`
- `frontend/tsconfig.json`
- `frontend/app/globals.css`
- `frontend/app/layout.tsx`
- `frontend/app/page.tsx`
- `frontend/app/auth/login/page.tsx`
- `frontend/app/auth/register/page.tsx`
- `frontend/app/dashboard/page.tsx`
- `frontend/app/generate/page.tsx`
- `frontend/app/generate/result/[genId]/page.tsx`
- `frontend/app/share/[token]/page.tsx`
- `frontend/lib/api.ts`
- `frontend/lib/utils.ts`

Remove or replace stale static routes after dynamic routes exist:

- `frontend/app/generate/result/page.tsx`
- `frontend/app/share/page.tsx`

Frontend rules:

- Keep pages minimal but usable.
- Use the Dawn/Scheme B color direction.
- Build route foundations that can grow into real auth, generation, result, share, and dashboard flows.
- Do not fake final legal outputs or public paid checkout.
- No marketing-only landing if the app shell can be shown.

## Root File Plan

Fill or add:

- `.gitignore`
- `.env.example`
- `README.md`

`.env.example` must contain placeholder names only.

## Verification Commands

Use PowerShell.

```powershell
cd D:\lawviz
git status --short --branch
docker compose up -d postgres
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

Database:

```powershell
docker exec lawviz-postgres psql -U lawviz -d lawviz -c "SELECT COUNT(*) FROM templates;"
```

Frontend:

```powershell
cd D:\lawviz\frontend
npm install
npm run dev
```

## Stop And Ask Conditions

Stop and ask the user if:

- Any implementation requires real production credentials.
- The private MVP foundation needs a different frontend/backend stack.
- Node 24 incompatibility blocks Next.js 14 setup and installing Node 20 is required.
- Python 3.11 path changes or cannot create venv.
- PostgreSQL Docker cannot start.
- There is pressure to implement legal case-type question frameworks before product/legal confirmation.
- Final pricing, refunds, public subscription rules, or live public Hupijiao activation are needed before the user confirms them.

## Current Decision

Proceed with Sprint 1 private MVP foundation development. Public commercial launch dependencies remain deferred, but real product functionality must not be removed from the plan.
