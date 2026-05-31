# LawViz Sprint 0: Infrastructure Checklist

> Date: 2026-05-31  
> Scope: gray-test infrastructure for LawViz v1.2.  
> Principle: document the purchase/configuration checklist, not final prices. Prices must be checked live before purchase.

## Target Architecture

```text
User browser
  -> lawviz domain
  -> Nginx on Aliyun ECS
     -> Next.js frontend process
     -> FastAPI backend process
        -> PostgreSQL on Aliyun RDS
        -> Aliyun OSS private bucket
        -> New API gateway
        -> Pkulaw MCP
        -> Hupijiao payment
```

## Must Purchase Or Prepare

| Item | Sprint 0 Decision | Why | Owner |
|---|---|---|---|
| Domain 1 | Main product domain | Main LawViz app and ICP | User |
| Domain 2 | Render/share subdomain or separate domain | Future HTML isolation / sharing | User |
| Aliyun ECS | 2 vCPU / 4 GiB, Linux | Matches v1.2 deployment plan | User |
| Aliyun RDS PostgreSQL | PostgreSQL 15-compatible instance | Persistent users, generations, transactions, templates | User |
| Aliyun OSS | Private-read bucket | Store generated HTML/PDF/PNG without public object exposure | User |
| SSL certificates | For app domain and render/share domain | HTTPS required for auth/payment/share | User |
| Hupijiao account | Payment account + PID/secret | Subscription/top-up payments | User |
| New API instance | User-owned AI gateway | GPT/Claude calls per v1.2 | User |
| Pkulaw MCP access | HTTP MCP credential/access path | Legal database access for paid tiers | User |

## ECS Baseline

Recommended initial server:

- Linux distribution: Ubuntu LTS or Alibaba Cloud Linux.
- Size: 2 vCPU / 4 GiB.
- Runtime:
  - Python 3.11
  - Node.js 20
  - PM2
  - Nginx
  - Playwright browser dependencies
- Open ports:
  - 80 / 443 public
  - SSH restricted by IP when possible
  - Backend/Next internal ports not exposed publicly

Official reference: [Alibaba Cloud ECS documentation](https://help.aliyun.com/zh/ecs/).

## RDS PostgreSQL

Initial requirements:

- PostgreSQL 15-compatible version if available in the selected region.
- Same region/VPC as ECS.
- Daily backup enabled.
- Public access disabled unless required for local migration work.
- Create one application database and least-privilege app user.

Initial database name:

```text
lawviz
```

Tables required by Sprint 1:

- `users`
- `generations`
- `transactions`
- `templates`

Official reference: [Alibaba Cloud RDS PostgreSQL documentation](https://help.aliyun.com/zh/rds/apsaradb-rds-for-postgresql/).

## OSS

Bucket policy:

- Private-read only.
- No public object URLs for generated reports.
- Backend serves report HTML through `GET /api/render/{gen_id}` after permission checks.
- PDF/PNG exports should also be generated or served through authenticated endpoints.

Suggested object layout:

```text
lawviz/
  generated/
    {user_id}/
      {generation_id}/
        report.html
        report.pdf
        report.png
        metadata.json
  uploads/
    {user_id}/
      profile/
```

Official references:

- [Alibaba Cloud OSS documentation](https://help.aliyun.com/zh/oss/)
- [OSS bucket ACL documentation](https://help.aliyun.com/zh/oss/user-guide/bucket-acl)

## Nginx Routing

Target gray-test routing:

```text
https://app-domain/
  -> Next.js frontend

https://app-domain/api/
  -> FastAPI backend

https://render-domain/
  -> FastAPI render/share endpoints
```

If a second domain is not ready in Sprint 1, keep the implementation ready for subdomain isolation but run same-origin locally.

## Environment Variables

Minimum `.env` categories:

```text
DATABASE_URL=
JWT_SECRET=
APP_BASE_URL=
RENDER_BASE_URL=

NEW_API_BASE_URL=
NEW_API_KEY=

PKULAW_MCP_URL=
PKULAW_MCP_TOKEN=

ALIYUN_OSS_ENDPOINT=
ALIYUN_OSS_BUCKET=
ALIYUN_ACCESS_KEY_ID=
ALIYUN_ACCESS_KEY_SECRET=

HUPIJIAO_PID=
HUPIJIAO_SECRET=
HUPIJIAO_NOTIFY_URL=
```

Never commit real values.

## Purchase Checklist

- [ ] Choose and buy main domain.
- [ ] Choose and buy render/share domain or subdomain plan.
- [ ] Start ICP filing immediately.
- [ ] Buy ECS 2C4G in target region.
- [ ] Buy or create PostgreSQL RDS in same region/VPC.
- [ ] Create OSS private bucket.
- [ ] Prepare SSL certificates.
- [ ] Register Hupijiao merchant account.
- [ ] Confirm New API endpoint and models.
- [ ] Confirm Pkulaw MCP access path.

## Open Questions For User

- Main domain name.
- Render/share isolation domain or subdomain.
- Aliyun region preference.
- Whether the RDS instance should be public for local administration, or private only.
- Hupijiao account registration status.
- New API endpoint and supported model IDs.
- Pkulaw MCP credential/status.

## Do Not Do Yet

- Do not expose generated HTML directly from OSS.
- Do not hard-code production secrets.
- Do not choose final pricing from infrastructure estimates.
- Do not deploy gray-test publicly before ICP and legal copy are ready.
