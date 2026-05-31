# LawViz Enterprise-Deferred Development Boundary

> Date: 2026-05-31  
> Decision: first delivery is a real private/internal MVP for self-use, trusted friends, and internal team use. ICP, public production deployment, public acquisition, and formal paid public operation are deferred until an enterprise subject is available.  
> Purpose: clarify that product functionality continues now while public commercial operation waits.

## Operating Decision

LawViz can continue real product development before the enterprise subject is ready.

The first delivery target is private/internal use:

- self-use by the product owner;
- small-scope use by trusted friends;
- internal team use for workflow validation;
- no public paid acquisition;
- no live payment collection;
- no formal paid gray-test.

LawViz must not enter paid public operation under a personal server or personal commercial setup. Production server rental for public paid service, ICP production filing, live public payment activation, and paid public gray-test should wait until the enterprise subject and vendor accounts are ready.

This boundary does not mean building fake screens, static images, or a reduced toy. The private/internal MVP must preserve the real product workflow and all major product organs.

## First Delivery Definition

The first usable delivery should prove that the product workflow is valuable before public commercial infrastructure is activated.

### Included In First Delivery

- Local or private-server app access for a small trusted group.
- Login or access gate to prevent open public use.
- Case generation workflow with controlled model access or explicit local/private adapter mode.
- Report preview.
- PDF/PNG export.
- Lawyer profile/signature display.
- Basic history and result retrieval.
- Basic cost logging for internal estimation.
- Admin/manual controls for user access if needed.
- Service adapter boundaries for LLM, Pkulaw, storage, export, and payment so production credentials can be added later without redesigning the product.

### Excluded From First Delivery

- Public marketing launch.
- Paid subscription.
- Online top-up.
- Live Hupijiao checkout.
- Final pricing table.
- Public share links without access control.
- Enterprise ICP-dependent production operation.
- Formal commercial service terms.

### First Delivery Success Criteria

- The owner can complete a case report from intake to export.
- A trusted friend or team member can complete the same flow without developer help.
- Generated reports are usable enough for internal review and client-communication rehearsal.
- The system records enough cost/usage data to estimate future pricing.
- No real production secret is committed.
- Any external model or legal database usage is explicitly configured and can be disabled.

## Can Develop Now

These items do not require an enterprise subject, public production server, or live public payment credentials.

### Local Runtime And Project Foundation

- Local Docker Compose for PostgreSQL 15.
- FastAPI backend foundation.
- Next.js frontend foundation.
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
- Optional invite code or admin-created account flow for private/internal access.

Boundaries:

- Do not enable public paid user onboarding.
- Do not promise final commercial plans in UI.
- Keep access private until enterprise/public compliance is ready.

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

- Public pricing copy must remain internal-only, placeholder, or hidden until final commercial pricing is confirmed.
- Public share should stay disabled or login-protected until compliance is ready.
- The first screen should favor the actual workbench/dashboard over a marketing landing page for private users.

### Generation Workflow Without Real Commercial Launch

- Conversation state machine.
- Case-type selection.
- Agent question loop structure.
- Plan confirmation flow.
- Generation status model.
- HTML preview.
- PDF and PNG export mechanics.
- Local/private generation adapter.
- Optional New API adapter behind environment variables.

Boundaries:

- If legal question frameworks are unclear, stop and ask before finalizing them.
- Do not invent legal citations.
- Do not use real user cases as test data without explicit permission.

### External Service Interfaces

These should be coded as real adapter boundaries with safe local/private modes:

- LLM provider interface.
- Pkulaw MCP interface.
- Object storage interface.
- Payment provider interface.
- Webhook signature verification skeleton.

Boundaries:

- Use placeholder credentials, local adapters, or disabled fail-closed mode until proper credentials exist.
- Real credentials must not be committed or pasted into chat.
- Live public payment callbacks must not be activated before enterprise setup.

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

These items should not be completed as live public production operations under a personal server setup.

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

The following should be implemented with clear boundaries but not publicly activated:

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
- UI for deferred paid features should be hidden, disabled, or explicitly marked internal-only during first delivery, but the product architecture should still account for them.

## Updated Development Sequence

### Phase A: Local Product Core

Build now:

- Sprint 1 private MVP foundation.
- Database schema and seed templates.
- Auth and profile.
- Generate/result/share/settings UI.
- Private/internal generation pipeline with local/private adapter mode.
- Export pipeline.
- Local cost tracking.
- Private/internal access gate.

### Phase B: Integration-Ready Private MVP

Build after Phase A:

- LLM adapter with New API environment variables.
- Pkulaw adapter with disabled-by-default config.
- Storage adapter with local filesystem and cloud-compatible interface.
- Payment adapter skeleton with signature tests but no live merchant activation.
- Dockerized deployment package.
- Optional private test server deployment for trusted use only.

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

Use local development and, if necessary, a temporary private/internal server for self-use, trusted friends, and internal team testing. Treat any personal server as disposable private infrastructure, not as the public paid product host.
