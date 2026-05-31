# LawViz

LawViz is a private/internal MVP for lawyers to generate AI-assisted case visualization reports. The first delivery is for self-use, trusted friends, and team validation. Public acquisition, ICP-dependent production deployment, and live public payment are deferred.

## Current Scope

- Real private MVP workflow foundations.
- FastAPI backend, Next.js frontend, PostgreSQL 15.
- Case workflow, report preview/export, auth/access control, usage/cost records, and service adapters are part of the product plan.
- No real production secrets should be committed.

## Local Services

Start PostgreSQL after `docker-compose.yml` is present:

```powershell
docker compose up -d postgres
```

Verify seed data:

```powershell
docker exec lawviz-postgres psql -U lawviz -d lawviz -c "SELECT COUNT(*) FROM templates;"
```

## Backend

Use Python 3.11 explicitly.

```powershell
cd D:\lawviz\backend
& "C:\Users\夏季\AppData\Local\Programs\Python\Python311\python.exe" -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Health checks:

```powershell
Invoke-RestMethod -Method Get http://127.0.0.1:8000/api/health
Invoke-RestMethod -Method Post http://127.0.0.1:8000/api/health
```

## Frontend

```powershell
cd D:\lawviz\frontend
npm install
npm run dev
```

Open `http://127.0.0.1:3000`.

## Boundaries

- Build real private/internal product functionality.
- Keep public payment, final pricing, public share, public production deployment, and ICP-dependent launch disabled until explicitly approved.
- Use local/private adapters or fail-closed behavior when production credentials are absent.
