# LawViz Sprint 0: What To Copy

> Date: 2026-05-31  
> Goal: evaluate open-source Agent/form/document-generation projects and decide what LawViz should copy, adapt, or avoid.

## Executive Decision

Do not copy a whole framework. Copy four narrow patterns:

1. **Structured intake + verifier loop** from [manalkaff/opendesign](https://github.com/manalkaff/opendesign).
2. **Tool pipeline + critic trajectory** from [EthanGuo2022/OpenDesign](https://github.com/EthanGuo2022/OpenDesign).
3. **Slot-filling state model** from [Flowform](https://github.com/kayossouza/flowform) and [Rasa Forms](https://github.com/RasaHQ/rasa/blob/3.6.x/docs/docs/forms.mdx).
4. **Legal template catalog + JSON-to-report output** from [OpenAgreements](https://github.com/open-agreements/open-agreements) and [pdfme](https://github.com/pdfme/pdfme).

For LawViz, the first implementation should be small:

```text
case_type
  -> intake schema
  -> conversation state
  -> missing-field detector
  -> next question generator
  -> plan text
  -> lawyer confirmation
  -> strict JSON output
  -> Jinja2 HTML
  -> Playwright PDF/PNG
```

Avoid adopting LangGraph/CrewAI-style general agent orchestration in Sprint 1-3a unless a specific bottleneck proves it is needed.

## Scoring

Scale: 1 low, 5 high.

| Project | License | Latest evidence checked | Simplicity | Stability | Copyability | HTML/output quality | Verdict |
|---|---|---:|---:|---:|---:|---:|---|
| [manalkaff/opendesign](https://github.com/manalkaff/opendesign) | MIT | pushed 2026-05-07 | 5 | 3 | 5 | 4 | Copy the workflow shape, not code wholesale |
| [EthanGuo2022/OpenDesign](https://github.com/EthanGuo2022/OpenDesign) | MIT | pushed 2026-04-29 | 3 | 3 | 4 | 5 | Copy pipeline contract and critic loop |
| [nexu-io/open-design](https://github.com/nexu-io/open-design) | Apache-2.0 | pushed 2026-05-31 | 2 | 3 | 4 | 5 | Copy discovery form and artifact lint ideas |
| [kayossouza/flowform](https://github.com/kayossouza/flowform) | MIT | pushed 2026-03-17 | 4 | 3 | 5 | 2 | Copy pure orchestrator + typed session model |
| [Rasa Forms](https://github.com/RasaHQ/rasa/blob/3.6.x/docs/docs/forms.mdx) | Apache-2.0 | pushed 2026-05-22 | 3 | 5 | 4 | 1 | Copy slot-filling concepts, not framework |
| [open-agreements/open-agreements](https://github.com/open-agreements/open-agreements) | MIT for tooling; templates vary | pushed 2026-05-31 | 4 | 3 | 5 | 3 | Copy legal template catalog and field workflow |
| [pdfme/pdfme](https://github.com/pdfme/pdfme) | MIT | pushed 2026-05-28 | 4 | 5 | 4 | 5 | Keep as PDF fallback / future template designer |
| [jhpyle/docassemble](https://github.com/jhpyle/docassemble) | MIT | pushed 2026-05-19 | 2 | 5 | 3 | 4 | Study legal interview patterns; do not embed |

## Project Notes

### 1. manalkaff/opendesign

Primary source: [README](https://github.com/manalkaff/opendesign/blob/main/README.md), [LICENSE](https://github.com/manalkaff/opendesign/blob/main/LICENSE).

Relevant structure:

- Front-door skill scans for existing systems.
- If work is new, it runs structured intake.
- It routes to a specialist skill.
- It forks a verifier subagent to review against the brief.

Copy to LawViz:

- Replace "design system discovery" with "case type/template discovery".
- Replace "structured intake for design" with "case-type legal intake".
- Replace "verifier checks output against brief" with "report verifier checks against confirmed plan, schema, and safety rules".

Do not copy:

- Design-specific specialist skills.
- Any assumption that verifier is a real runtime service; in LawViz it must become explicit backend validation plus optional LLM review.

### 2. EthanGuo2022/OpenDesign

Primary source: [Architecture](https://github.com/EthanGuo2022/OpenDesign/blob/main/docs/ARCHITECTURE.md).

Relevant structure:

- `ChatREPL -> PipelineRunner -> PlannerLoop -> tools -> Critic -> Trajectory`.
- Tool context acts as a shared blackboard.
- Tools return observations instead of throwing control back to the planner.
- Critic loop runs after composition.
- Trajectory records prompt, spec, artifacts, critique, cost, and metadata.

Copy to LawViz:

```text
GenerateRunner
  -> ToolContext
  -> IntakeLoop
  -> LegalVizPipeline
  -> ReportVerifier
  -> GenerationTrace
```

Suggested LawViz tools:

- `detect_case_template`
- `extract_case_facts`
- `ask_next_question`
- `draft_plan`
- `confirm_plan`
- `search_pkulaw`
- `generate_report_json`
- `validate_report_json`
- `render_html`
- `export_pdf_png`
- `finalize_generation`

Do not copy:

- Image generation / deck / PSD complexity.
- Heavy trajectory format until Sprint 3a; start with a compact `generation_trace` JSONB field or `conversation_history`.

### 3. nexu-io/open-design

Primary sources: [discovery prompt](https://github.com/nexu-io/open-design/blob/main/apps/daemon/src/prompts/discovery.ts), [LICENSE](https://github.com/nexu-io/open-design/blob/main/LICENSE).

Relevant structure:

- First turn emits a `question-form`.
- Form answers drive branch logic.
- Todo plan is shown live.
- Artifact lint and checklist run before handoff.
- Sandboxed preview is treated as a first-class product surface.

Copy to LawViz:

- Use a machine-readable question object for each Agent question:

```json
{
  "type": "question",
  "round": 2,
  "question": {
    "id": "contract_amount",
    "label": "争议金额大约是多少？",
    "kind": "number",
    "required": true,
    "allow_skip": true,
    "help": "没有准确数字可以填估算值。"
  }
}
```

- Keep a live checklist for generation status: intake, plan, confirmation, JSON validation, HTML render, export.
- Use sandbox preview for generated HTML.

Do not copy:

- Full design/plugin surface.
- Large prompt stack; LawViz prompts must stay case-type specific and auditable.

### 4. Flowform

Primary source: [README](https://github.com/kayossouza/flowform/blob/main/README.md).

Relevant structure:

- Pure `runLlmStep(form, session, userInput, llmClient)` style orchestrator.
- Typed `FormDefinition`, `Session`, `FieldType`, `SessionStatus`.
- Multi-turn context preservation.
- LLM-agnostic extraction.
- Validation returns clean structured JSON.

Copy to LawViz:

- Implement intake as pure domain logic before wiring FastAPI routes.
- Keep LLM client injected, not imported globally.
- Use explicit state:

```text
draft -> qa -> plan -> confirmed -> generating -> done | failed
```

- Keep questions and extracted facts separate:

```text
conversation_history[]  # what was said
intake_state{}          # what facts are known/missing
plan_text               # lawyer-confirmed plan
llm_output{}            # final report JSON
```

Do not copy:

- Full web dashboard or form builder.
- CRM/webhook assumptions.

### 5. Rasa Forms

Primary source: [Rasa Forms documentation](https://github.com/RasaHQ/rasa/blob/3.6.x/docs/docs/forms.mdx).

Relevant structure:

- Required slots.
- Active loop.
- Requested slot.
- Validation action.
- Dynamic required slots.
- Unhappy paths return to the form after interruptions.

Copy to LawViz:

- Model each case type as required and adaptive slots:

```yaml
contract_dispute:
  required_slots:
    - contract_type
    - contract_status
    - dispute_amount
    - key_dates
  adaptive_slots:
    - limitation_period
    - evidence_status
    - counterparty_position
```

- Track `requested_slot`.
- Allow "skip" without blocking generation.
- Add explain/why support later: if user asks why a question matters, answer and return to current slot.

Do not copy:

- Rasa framework runtime.
- Rule/story DSL.

### 6. OpenAgreements

Primary source: [README](https://github.com/open-agreements/open-agreements/blob/main/README.md).

Relevant structure:

- Template catalog.
- Template discovery.
- Field-value interview.
- Fill template with values.
- Render signable DOCX.
- Licensing metadata per template.

Copy to LawViz:

- Treat each LawViz case type as a template with:

```text
id
name
description
fields_schema
qa_system_prompt
llm_output_schema
html_template_path
license/source metadata if imported
```

- Add a template-quality audit before enabling a template.
- Keep template source/licensing metadata even if current templates are internally authored.

Do not copy:

- Third-party legal templates into LawViz reports without license review.
- DocuSign or DOCX-first workflow for MVP.

### 7. pdfme

Primary source: [README](https://github.com/pdfme/pdfme/blob/main/README.md).

Relevant structure:

- JSON template + JSON input.
- TypeScript generator.
- React designer.
- Node/browser support.
- CLI can validate and generate rendered page images.

Copy to LawViz:

- Keep pdfme as a fallback or future module if Playwright HTML->PDF is unstable.
- Borrow the idea of validating a "job" before generation.

Do not copy in MVP:

- React template designer.
- A PDF-first report pipeline. LawViz v1.2 says HTML is generated first, then PDF/PNG via Playwright.

### 8. docassemble

Primary source: [GitHub repository](https://github.com/jhpyle/docassemble), [project site](https://docassemble.org).

Relevant structure:

- Legal guided interviews.
- YAML/Markdown-driven document assembly.
- Mature legal expert-system patterns.

Copy to LawViz:

- Study interview structure and review/confirmation patterns.
- Use as conceptual reference for legal intake completeness.

Do not copy:

- Platform architecture. It is too large for LawViz's single-founder FastAPI/Next MVP.

## LawViz Intake Skeleton

Sprint 3a should implement this minimal backend shape:

```python
class IntakeQuestion:
    id: str
    label: str
    kind: Literal["text", "textarea", "number", "date", "single_select", "multi_select"]
    required: bool
    allow_skip: bool = True
    options: list[str] = []
    help: str | None = None

class IntakeSlot:
    id: str
    value: Any | None
    source: Literal["initial_message", "answer", "llm_extract", "manual_edit"] | None
    confidence: float | None
    required: bool

class IntakeState:
    case_type: str
    round: int
    requested_slot: str | None
    slots: dict[str, IntakeSlot]
    missing_required: list[str]
    skipped: list[str]
```

Core function:

```python
async def handle_message(gen_id: str, content: str, model: str | None = None) -> dict:
    """Return either next structured question or final plan text."""
```

Rules:

- Max 5 rounds.
- User can skip any question.
- Model switch preserves full `conversation_history` and current `intake_state`.
- If enough facts exist or round limit is hit, return `type="plan"`.
- Do not generate HTML until lawyer confirms `plan_text`.

## Prompt Sources To Adapt

### Intake prompt

Based on Flowform + Rasa + OpenDesign:

```text
You are collecting facts for a legal case visualization report.
Use the case_type schema and conversation history.
Extract any slot values from the user's message.
Validate known slots.
Choose the single most useful next missing slot.
Return one structured question, or return PLAN_READY if enough facts exist.
Never provide legal advice.
Never invent facts.
If the user is unsure, allow approximate or skipped answers.
```

### Plan prompt

```text
Generate a plain-text case visualization plan for lawyer confirmation.
Use only provided facts and clearly mark unknowns.
Include: parties, dispute summary, timeline candidates, evidence map, risk points, report sections.
Do not generate final HTML.
Do not cite law unless pkulaw results are provided.
```

### Final JSON prompt

```text
Generate JSON matching the template schema exactly.
Use the confirmed plan, intake facts, and optional law references.
No markdown.
No extra keys.
Unknown values must be null or omitted according to schema.
```

### Verifier prompt

```text
Check the report JSON against:
1. confirmed plan,
2. case_type schema,
3. max lengths and item counts,
4. no invented facts,
5. no unsafe HTML,
6. required output sections.
Return pass/fail plus blocking issues.
```

## Proposed Sprint 0 Output Beyond This File

1. `docs/infrastructure-checklist.md`
2. `backend/sql/cost_dashboard.sql`
3. `docs/cost-dashboard-plan.md`
4. `docs/icp-and-vendor-startup.md`

## Risks

- Legal intake schemas require product/legal judgment. Do not finalize the five case-type question frameworks without user participation.
- OpenDesign projects are useful as workflow references, but most are design-agent systems, not legal SaaS backends.
- OpenAgreements templates have mixed content licenses. Do not import third-party templates directly.
- pdfme may be useful later, but MVP should stay HTML-first per v1.2.
- Rasa is mature, but adopting its runtime would be overkill.

## Immediate Recommendation

For Sprint 1 and Sprint 3a, build LawViz's own small orchestrator:

- Python/FastAPI domain logic.
- Case-type schemas stored in `templates.fields_schema`.
- Conversation state in `generations.conversation_history`.
- Final output schema in `templates.llm_output_schema`.
- HTML rendered by Jinja2.
- PDF/PNG rendered by Playwright.

This keeps LawViz close to the v1.2 plan while still copying the strongest patterns from existing projects.
