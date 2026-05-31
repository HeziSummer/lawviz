# LawViz M0 Status And Sprint 1 Readiness

> Date: 2026-05-31  
> Purpose: current evidence audit for M0 and Sprint 1 entry.  
> Source of truth: `docs/2026-05-31-lawviz-development-control.md`.

## M0 Gate Audit

| Requirement | Evidence | Status |
|---|---|---|
| `docs/what-to-copy.md` produced | `docs/what-to-copy.md` exists and contains 8-project open-source recon plus LawViz copy strategy | Done |
| Infrastructure purchase checklist completed | `docs/infrastructure-checklist.md` exists | Done |
| ICP filing started or blocker stated | `docs/icp-and-vendor-startup.md` lists ICP preparation and vendor board shows `Not started` | Blocked on user action |
| Hupijiao registration started | Vendor board shows `Not started` | Blocked on user action |
| Cost dashboard SQL/CSV draft completed | `docs/cost-dashboard-plan.md` and `backend/sql/cost_dashboard.sql` exist | Done |

## M0 Decision

M0 is **locally documented but not externally complete**.

The project may continue with real private/internal MVP development. It must not claim that ICP, public production infrastructure, live public payment, Aliyun production resources, New API production keys, or Pkulaw production access are active until the user provides evidence or credentials.

External M0 gaps block public commercial operation. They do not block building the product workflow for self-use, trusted friends, or internal team use.

## External User Actions

Required before public gray-test or public paid operation:

- Buy/confirm main domain.
- Buy/confirm render/share domain or subdomain plan.
- Start Aliyun ICP filing.
- Provision Aliyun ECS.
- Provision Aliyun RDS PostgreSQL.
- Create private-read Aliyun OSS bucket.
- Register Hupijiao merchant account.
- Provide New API base URL and model IDs.
- Provide Pkulaw MCP access path.

Do not ask for secrets in chat unless the user explicitly chooses a secure handoff method. Real secrets must stay out of Git.

## Sprint 1 Readiness Audit

| Check | Evidence | Status |
|---|---|---|
| Git clean | `git status --short --branch` shows `main...origin/main` | Ready |
| Node available | `node --version` -> `v24.14.1` | Available but version differs |
| npm available | `npm --version` -> `11.11.0` | Available |
| Docker available | `docker --version` -> `29.4.1` | Available |
| Python 3.11 available | `C:\Users\夏季\AppData\Local\Programs\Python\Python311\python.exe --version` -> `Python 3.11.9` | Ready if explicit path is used |
| `python` command usable | `python --version` fails due WindowsApps path issue | Not ready |
| `py` default version | `py --version` -> `Python 3.13.2` | Not suitable for project runtime |
| `docker-compose.yml` | Missing | Not ready |
| Frontend `tsconfig.json` | Missing | Not ready |
| Frontend `app/globals.css` | Missing | Not ready |
| Backend package init | `backend/app/__init__.py` missing | Not ready |
| Backend health route | `backend/app/api/health.py` missing | Not ready |
| Existing source files | Most frontend/backend files are zero-byte placeholders | Not ready |

## Sprint 1 Entry Decision

Sprint 1 should proceed as a private MVP foundation while external vendor tasks remain pending.

This is not a fake UI or a health-check-only scaffold. The purpose is to build the running foundation for the real LawViz product: access control, case workflow, generation/export contracts, database model, and future integration boundaries.

ICP, production server purchase, public acquisition, and formal paid public operation remain deferred.

## Recommended Sprint 1 Private MVP Foundation Scope

This scope does not require production credentials:

- Fill `.gitignore`.
- Fill `.env.example` with placeholder names only.
- Add `docker-compose.yml` for local PostgreSQL 15.
- Add FastAPI app foundation and `/api/health` with both GET and POST.
- Add SQLAlchemy models for `users`, `generations`, `transactions`, `templates`.
- Add SQL schema/seed for 5 initial templates.
- Add usable Next.js 14 private MVP route foundation.
- Fix dynamic routes:
  - `frontend/app/generate/result/[genId]/page.tsx`
  - `frontend/app/share/[token]/page.tsx`
- Add README startup instructions.

## Stop Point

Stop only if development would require production credentials, public paid activation, ICP-dependent public deployment, final legal question framework decisions, or final commercial pricing/refund/subscription rules.
