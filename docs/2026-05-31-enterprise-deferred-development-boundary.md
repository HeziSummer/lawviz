# LawViz Enterprise-Deferred Development Boundary

> Date: 2026-05-31  
> Decision: paid public operation and production server rental are deferred until an enterprise subject is available.  
> Purpose: clarify what can be developed now and what must wait.

## Operating Decision

LawViz can continue local and non-paid product development before the enterprise subject is ready.

LawViz must not enter paid public operation under a personal server or personal commercial setup. Production server rental, ICP production filing, payment activation, and paid gray-test should wait until the enterprise subject and vendor accounts are ready.

## Can Develop Now

These items do not require an enterprise subject, production server, or real payment credentials.

### Local Runtime And Project Foundation

- Local Docker Compose for PostgreSQL 15.
- FastAPI backend scaffold.
- Next.js frontend scaffold.
- `.env.example` with placeholder names only.
- `.gitignore`, README, startup docs.
- Health checks and local verification scripts.
- Dockerfile and Compose files for repeatable deployment packaging.

Acceptance evidence:

- Backend starts locally.
- Frontend starts locally.
- Local PostgreSQL starts locally.
- No real secrets are committed.

### Data Model And Database Schema

- `users`, `generations`, `transactions`, `templates` tables.
- Local schema SQL.
- Local seed data for five initial templates.
- Cost tracking fields:
  - `token_usage`
  - `api_cost_estimate`
  - `credits_cost`
  - `model_used`
  - `model_switches`
  - `use_pkulaw`

Acceptance evidence:

- Schema applies locally.
- `SELECT COUNT(*) FROM templates;` returns 5.

### Authentication And Local User Flow

- Register/login API.
- JWT session flow.
- Local user dashboard.
- Lawyer profile fields.
- Local-only account settings.

Boundaries:

- Do not enable real paid user onboarding.
- Do not promise final commercial plans in UI.

### Product UI

- App shell.
- Dashboard.
- Generate page.
- Result page.
- Share page shape.
- Settings/profile page.
- Responsive layout.
- Visual system based on the approved design direction.

Boundaries:

- Pricing copy must remain placeholder or hidden.
- Public share should stay disabled or login-protected until compliance is ready.

### Generation Workflow Without Real Commercial Launch

- Conversation state machine.
- Case-type selection.
- Agent question loop structure.
- Plan confirmation flow.
- Generation status model.
- HTML preview.
- PDF and PNG export mechanics.
- Local mock generation adapter.
- Optional New API adapter behind environment variables.

Boundaries:

- If legal question frameworks are unclear, stop and ask before finalizing them.
- Do not invent legal citations.
- Do not use real user cases as test data without explicit permission.

### External Service Interfaces

These can be coded as adapters with fake/local implementations:

- LLM provider interface.
- Pkulaw MCP interface.
- Object storage interface.
- Payment provider interface.
- Webhook signature verification skeleton.

Boundaries:

- Use fake credentials and local stubs.
- Real credentials must not be committed or pasted into chat.
- Real payment callbacks must not be activated before enterprise setup.

### Quality, Security, And Ops Preparation

- Unit tests.
- API contract tests.
- Frontend route checks.
- Secret leakage checks.
- Security rules for private object storage.
- Sandbox iframe strategy for generated HTML.
- Input sanitization strategy.
- Deployment scripts that require explicit env vars.
- Low-privilege maintenance-agent design.

Boundaries:

- Deployment scripts may be prepared but should not be used for paid production until enterprise infra exists.

## Must Wait For Enterprise Subject Or Formal Vendor Setup

These items should not be completed as live production operations under a personal server setup.

### Paid Public Operation

- Real paid subscriptions.
- Real top-up/credits purchase.
- Final package pricing.
- Public paid gray-test.
- Refund and billing rules.
- Invoicing or enterprise payment handling.

### Production Infrastructure

- Production cloud server rental for paid service.
- Production RDS/PostgreSQL.
- Production object storage bucket.
- Production DNS and SSL tied to the enterprise service.
- Production backup and disaster recovery policy.

### Compliance And Filing

- Enterprise ICP filing.
- Final website/app name used in filing.
- Final public product description for filing.
- Public report sharing policy.
- Terms of service.
- Privacy policy.
- Commercial legal database usage terms.

### Real Vendor Activation

- Hupijiao live merchant credentials.
- New API live key for production traffic.
- Pkulaw MCP live token for paid-tier users.
- Cloud provider RAM/AccessKey for production.
- Any callback URL used by real payment.

## Can Be Designed Now But Activated Later

The following can be implemented as disabled or mock-backed features:

- Subscription plans page.
- Credits ledger model.
- Order table and transaction status machine.
- Hupijiao payment adapter.
- Pkulaw paid-tier switch.
- OSS/COS storage adapter.
- Production deployment scripts.
- Maintenance-agent container.
- Admin cost dashboard.

Required rule:

- Every later-activated feature must have a clear `enabled` switch or missing-env failure mode.
- If the required production credential is missing, the feature must fail closed.

## Updated Development Sequence

### Phase A: Local Product Core

Build now:

- Sprint 1 local scaffold.
- Database schema and seed templates.
- Auth and profile.
- Generate/result/share/settings UI.
- Mock generation pipeline.
- Export pipeline.
- Local cost tracking.

### Phase B: Integration-Ready But Non-Paid

Build after Phase A:

- LLM adapter with New API environment variables.
- Pkulaw adapter with disabled-by-default config.
- Storage adapter with local filesystem and cloud-compatible interface.
- Payment adapter skeleton with signature tests but no live merchant activation.
- Dockerized deployment package.

### Phase C: Enterprise Production Readiness

Wait for enterprise subject:

- Production server purchase.
- Enterprise ICP filing.
- Production database and object storage.
- Live payment account.
- Legal terms, privacy policy, public compliance pages.
- Production secrets handoff.
- Paid gray-test.

## Current Practical Recommendation

Do not buy a personal production server for paid LawViz operation.

Use local development and, if necessary, a temporary non-paid development server only for private testing. Treat any personal server as disposable development infrastructure, not as the paid product host.

