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

The project may continue with planning and local preflight work. It must not claim that ICP, Hupijiao, Aliyun resources, New API, or Pkulaw are active until the user provides evidence or credentials.

## External User Actions

Required before public gray-test:

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

## Sprint 1 Entry Guard

Before writing Sprint 1 code, confirm one of these paths:

1. Strict path: wait until ICP and Hupijiao are actually started.
2. Local-only path: user explicitly approves starting Sprint 1 local scaffolding while external vendor tasks remain pending.

Without that confirmation, only documentation, preflight, and planning work should continue.

## Recommended Local-Only Sprint 1 Scope If Approved

This scope does not require production credentials:

- Fill `.gitignore`.
- Fill `.env.example` with placeholder names only.
- Add `docker-compose.yml` for local PostgreSQL 15.
- Add FastAPI minimal app and `/api/health` with both GET and POST.
- Add SQLAlchemy models for `users`, `generations`, `transactions`, `templates`.
- Add SQL schema/seed for 5 initial templates.
- Add minimal Next.js 14 app scaffold.
- Fix dynamic routes:
  - `frontend/app/generate/result/[genId]/page.tsx`
  - `frontend/app/share/[token]/page.tsx`
- Add README startup instructions.

## Stop Point

Because `docs/2026-05-31-lawviz-development-control.md` says only M0 Gate completion permits Sprint 1, and M0 external actions are not started, the next implementation step requires user confirmation.

Question to resolve:

```text
Should Sprint 1 local-only scaffolding start now while ICP/Hupijiao/Aliyun/New API/Pkulaw remain pending, or should development pause until those external tasks are started?
```
