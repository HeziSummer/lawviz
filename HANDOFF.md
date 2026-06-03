# LawViz Handoff

> Updated: 2026-06-02  
> Workspace: `D:\lawviz`  
> Branch: `main`  
> Important: the working tree is intentionally dirty with Sprint 2.5 and report-template work. Do not reset or revert unrelated changes.

## Current Product Direction

LawViz is building AI-assisted legal case visualization reports for lawyers.

The generated report is not a formal legal document. It is a vertical PPT-style, A4-printable booklet for lawyer-to-client communication:

- one page / one idea;
- strong visual hierarchy;
- case facts, timelines, evidence boards, issue matrices, risk strategy, action plans;
- same case content can later support multiple visual styles.

The report generation architecture is now a hybrid:

1. Standardized "showroom" pages provide stable product quality.
2. Agent-created custom visual pages are core functionality, not a future add-on.
3. Both standard and Agent-created pages must use the same visual system.
4. The Agent should output structured page plans and visual intent, not uncontrolled raw HTML.
5. The renderer owns final HTML/CSS, escaping, page size, print rules, and visual consistency.

## Latest User Decisions

- Continue work on the current branch.
- First visual sample pack should start from the strongest/suitable Open Design direction.
- Chosen first style: `Knowledge Architecture Blueprint`.
- Use Open Design templates as source material, not as a runtime dependency.
- Convert Open Design `SKILL.md`, `open-design.json`, and `example.html` into LawViz-owned visual packs.
- Current template selection is aesthetic-first. After several packs, define a module/function baseline. Future packs must support the baseline; missing modules should be created in that pack's own aesthetic.
- Next session's immediate task: improve the first `lawviz-blueprint` sample pack and place lawyer personal intro / law firm intro in stable, appropriate fixed positions.

## Completed Backend/Auth/Credits Progress

Sprint 2.5 auth/credits/admin work was implemented before the current visual-template phase.

Implemented areas include:

- FastAPI auth endpoints: SMS send, register pending user, login, logout, `me`.
- SMS verification service with mainland China phone normalization, DB-backed code records, TTL, resend/hourly/daily limits, and max attempts.
- JWT/password security helpers using PyJWT and passlib.
- Admin routes for list users, activate, disable, and self-disable protection.
- Credits routes and service: balance, ledger, admin grant/adjust, generation deduction/refund helpers.
- Admin bootstrap script: `backend/scripts/create_admin.py`.
- User model additions: `email`, `role`, `status`, `is_verified`.
- New `SmsVerification` model.
- Migration file: `backend/sql/2026-06-01-sprint2_5_auth_credits.sql`.

Verified earlier:

- frontend build passed;
- backend py_compile passed for key files;
- local HTTP E2E passed for SMS register, pending user block, admin activate, credit grant, user login, generation confirmation, credit deduction/refund path;
- temporary local E2E users/SMS records were cleaned.

## NewAPI / LLM Progress

The user had LawViz-specific NewAPI credentials in their local personal information library. `.env` was populated locally and is gitignored. Do not print or commit secrets.

Validated gateway summary:

- `lawviz专用 gpt rightcode`: valid, using OpenAI-compatible API.
- Other candidate Claude/GPT entries timed out, rejected, or had no providers.

Implemented:

- `backend/app/services/llm.py` NewAPI/OpenAI-compatible chat adapter.
- Optional separate Claude config fields.
- `generate_report_json()` returns compact JSON fields:
  - `title`
  - `summary`
  - `timeline`
  - `evidence`
  - `issues`
  - `recommendations`
- `/api/generate/*` flow stores LLM output/token usage, deducts credits, and refunds on failure.

## Current Report Rendering Infrastructure

Implemented:

- `backend/app/services/report_renderer.py`
- `backend/app/api/render.py`
- `backend/app/report_templates/case_report.html`
- `backend/app/report_styles/classic.css`
- `backend/app/report_styles/minimal.css`
- `Jinja2` dependency added.

Routes:

- `GET /api/render/styles`
- `GET /api/render/{gen_id}?style=classic|minimal`

Important caveat:

- The user currently has `file:///D:/lawviz/backend/app/report_templates/case_report.html` open. That is raw Jinja source, not a rendered authenticated preview.
- The current backend report template/style is a placeholder and should not be treated as final visual quality.
- `report_renderer.py` and `case_report.html` contain visible Chinese mojibake in source. Fix this before wiring the new visual system into production rendering.

## Open Design Research / Docs

New planning and research docs created:

- `docs/report-template-research.md`
- `docs/report-generation-architecture.md`
- `docs/opendesign-adapter-spec.md`
- `docs/report-visual-pack-format.md`
- `docs/report-module-standardization-plan.md`

Key conclusions:

- Open Design examples are plugin folders, usually containing `SKILL.md`, `open-design.json`, and `example.html`.
- They are not a drop-in UI library for LawViz.
- LawViz should extract tokens, page modules, visual grammar, and Agent rules into its own visual packs.
- Production rendering should remain controlled through LawViz templates/CSS, not arbitrary Agent HTML.

Open Design references currently considered:

- `example-html-ppt-knowledge-arch-blueprint`
- `example-html-ppt-zhangzara-blue-professional`
- `example-html-ppt-zhangzara-long-table`
- `example-html-ppt-course-module`
- `example-html-ppt-pitch-deck`
- `example-data-report`
- `example-finance-report`
- `example-open-design-landing-deck`

## First Visual Sample Pack

Created:

`docs/report-style-samples/lawviz-blueprint/`

Files:

- `README.md`
- `visual-kit.json`
- `style.css`
- `showroom.html`
- `agent-sandbox.html`

Purpose:

- first A4 portrait LawViz visual pack sample;
- based primarily on Open Design Knowledge Architecture Blueprint;
- supports a cream paper, grid, rust accent, hard-card, blueprint-like visual system;
- tests whether standard pages and Agent-created custom pages can look like the same report.

Current sample structure:

- `showroom.html`: 8 standard pages:
  - cover;
  - executive summary;
  - timeline;
  - evidence board;
  - issue matrix;
  - risk strategy;
  - action checklist;
  - lawyer card / closing.
- `agent-sandbox.html`: 5 Agent-style custom visual pages:
  - contradiction map;
  - payment flow;
  - evidence heatmap;
  - litigation path tree;
  - damages calculation board.

Important fix already made:

- The first version used rough absolute-positioned `.arrow` divs, which let arrows cross into text cards.
- This was corrected to SVG `connector-layer` paths, closer to the original Open Design approach.
- A1 contradiction page now uses a non-directional "冲突对照" connector for contrast, not a misleading one-way arrow.
- A4 litigation path tree uses directed arrows from "律师函发出" to the three response paths.

Verification:

- `showroom.html`: 8 A4 pages checked with Playwright, no overflow detected.
- `agent-sandbox.html`: 5 A4 pages checked with Playwright, no overflow detected.
- A1/A4 connector visuals were screenshot-checked after the fix.

Local preview service:

- A temporary static server was started on `http://127.0.0.1:8765/`.
- Preview URLs while that process remains alive:
  - `http://127.0.0.1:8765/lawviz-blueprint/showroom.html`
  - `http://127.0.0.1:8765/lawviz-blueprint/agent-sandbox.html`
- If the session changes and the server is gone, restart with:

```powershell
$py='C:\Users\夏季\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
Start-Process -WindowStyle Hidden -FilePath $py -ArgumentList '-m','http.server','8765','--bind','127.0.0.1','--directory','D:\lawviz\docs\report-style-samples' -WorkingDirectory 'D:\lawviz'
```

## Immediate Next Task

Continue improving `lawviz-blueprint` before starting another style pack.

Required focus:

1. Polish the visual sample pages to "样板间" quality.
2. Decide fixed placement rules for lawyer personal introduction and law firm introduction.
3. Add lawyer/law-firm content in a way that does not feel like random marketing copy.
4. Keep the report's primary purpose: explain the case to the client.
5. Maintain A4 portrait page fit and no-overflow discipline.

Recommended placement approach to explore:

- Cover page:
  - compact firm/lawyer identity in metadata area, not a large marketing block.
- Persistent footer:
  - small law firm or lawyer name can appear as a trust signal.
- Closing page:
  - full lawyer card with name, title, practice area, contact, and next-action framing.
- Optional near-end fixed page:
  - "律师与律所说明" page, if content is important enough.
  - Should be concise and trust-building, not a landing-page-style pitch.
- Lawyer/law-firm info should be part of the fixed standard page set, not left to arbitrary Agent generation.

Specific next implementation steps:

1. Review `showroom.html` page by page and decide where lawyer/law firm identity belongs.
2. Add a fixed "lawyer profile / firm profile" module in `style.css`.
3. Update `showroom.html` closing page and possibly cover/footer.
4. Add one Agent page consistency check if lawyer/firms appear in custom pages.
5. Re-run Playwright overflow checks for all 13 pages.

## Current Git / Worktree Notes

Branch:

- `main`

The worktree is dirty and contains both previous Sprint 2.5 implementation files and current report-template docs/samples.

Do not revert these changes unless the user explicitly requests it.

Known untracked/modified areas include:

- auth/admin/credits/generate backend/frontend files;
- report renderer files;
- report style sample files;
- Open Design research docs;
- local browser test artifacts under `.playwright-mcp/`.

Also note:

- `.env` exists locally and contains secrets. It is gitignored. Do not print it.
- `blue-professional.png` may exist as an earlier temporary screenshot artifact; it can be removed if not needed.

## Stop And Ask Rules

Stop and ask before:

- finalizing case-type-specific legal frameworks;
- choosing final report module baseline after sample review;
- deciding lawyer/law-firm marketing copy tone;
- enabling public registration/payment/share;
- committing or printing secrets;
- changing public product/compliance claims.

Do not ask the user to paste secrets into chat.

## Useful Checks

PowerShell:

```powershell
cd D:\lawviz
git status --short
```

Static preview:

```powershell
Invoke-WebRequest -Uri 'http://127.0.0.1:8765/lawviz-blueprint/showroom.html' -UseBasicParsing
Invoke-WebRequest -Uri 'http://127.0.0.1:8765/lawviz-blueprint/agent-sandbox.html' -UseBasicParsing
```

Playwright overflow check pattern:

```js
await page.$$eval('.page', els => els.map((el, i) => {
  const r = el.getBoundingClientRect();
  return {
    index: i + 1,
    width: Math.round(r.width),
    height: Math.round(r.height),
    scrollHeight: el.scrollHeight,
    overflowing: el.scrollHeight > r.height + 2
  };
}));
```

